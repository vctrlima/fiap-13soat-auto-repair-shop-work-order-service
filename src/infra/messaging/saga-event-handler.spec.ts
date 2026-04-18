jest.mock("@/infra/observability", () => ({
  sagaCompensatedCounter: { add: jest.fn() },
  workOrderCompletedCounter: { add: jest.fn() },
}));

import { EventPublisher } from "@/application/protocols/messaging";
import { SagaStatus, Status } from "@/domain/enums";
import {
  GetSagaState,
  UpdateSagaStep,
  UpdateWorkOrder,
} from "@/domain/use-cases";
import { SagaEventHandler } from "@/infra/messaging/saga-event-handler";
import type { EventType } from "@/domain/events/domain-event";

const makeUpdateSagaStep = (): UpdateSagaStep => ({ updateStep: jest.fn() });
const makeUpdateWorkOrder = (): UpdateWorkOrder => ({ update: jest.fn() });
const makePublisher = (): EventPublisher => ({ publish: jest.fn() });
const makeGetSagaState = (): GetSagaState => ({ getByWorkOrderId: jest.fn() });

const makeSut = (getSagaState?: GetSagaState) => {
  const updateSagaStep = makeUpdateSagaStep();
  const updateWorkOrder = makeUpdateWorkOrder();
  const publisher = makePublisher();
  const sut = new SagaEventHandler(
    updateSagaStep,
    updateWorkOrder,
    publisher,
    getSagaState,
  );
  return { sut, updateSagaStep, updateWorkOrder, publisher };
};

const makeEvent = (eventType: EventType, data: any) => ({
  eventType,
  eventId: "evt-1",
  timestamp: new Date().toISOString(),
  version: "1.0",
  source: "test",
  data,
});

describe("SagaEventHandler", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("PaymentCompleted", () => {
    it("should update saga to PaymentCompleted then ExecutionPending and update work order to InExecution", async () => {
      const { sut, updateSagaStep, updateWorkOrder } = makeSut();
      await sut.handle(makeEvent("PaymentCompleted", { workOrderId: "wo-1" }));
      expect(updateSagaStep.updateStep).toHaveBeenCalledTimes(2);
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.PaymentCompleted }),
      );
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.ExecutionPending }),
      );
      expect(updateWorkOrder.update).toHaveBeenCalledWith({
        id: "wo-1",
        status: Status.InExecution,
      });
    });
  });

  describe("PaymentFailed", () => {
    it("should compensate saga and cancel work order", async () => {
      const { sut, updateSagaStep, updateWorkOrder } = makeSut();
      const { sagaCompensatedCounter } = require("@/infra/observability");
      await sut.handle(
        makeEvent("PaymentFailed", {
          workOrderId: "wo-1",
          failureReason: "Insufficient funds",
        }),
      );
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.PaymentFailed }),
      );
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.SagaCompensating }),
      );
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.SagaCompensated }),
      );
      expect(updateWorkOrder.update).toHaveBeenCalledWith({
        id: "wo-1",
        status: Status.Canceled,
      });
      expect(sagaCompensatedCounter.add).toHaveBeenCalledWith(1);
    });
  });

  describe("ExecutionCompleted", () => {
    it("should complete saga and finish work order", async () => {
      const { sut, updateSagaStep, updateWorkOrder } = makeSut();
      const { workOrderCompletedCounter } = require("@/infra/observability");
      await sut.handle(
        makeEvent("ExecutionCompleted", { workOrderId: "wo-1" }),
      );
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.ExecutionCompleted }),
      );
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.SagaCompleted }),
      );
      expect(updateWorkOrder.update).toHaveBeenCalledWith({
        id: "wo-1",
        status: Status.Finished,
      });
      expect(workOrderCompletedCounter.add).toHaveBeenCalledWith(1);
    });
  });

  describe("ExecutionFailed", () => {
    it("should compensate saga, publish RefundRequested, and cancel work order", async () => {
      const { sut, updateSagaStep, updateWorkOrder, publisher } = makeSut();
      const { sagaCompensatedCounter } = require("@/infra/observability");
      await sut.handle(
        makeEvent("ExecutionFailed", {
          workOrderId: "wo-1",
          failureReason: "Part unavailable",
        }),
      );
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.ExecutionFailed }),
      );
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.SagaCompensating }),
      );
      expect(publisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "RefundRequested" }),
      );
      expect(updateWorkOrder.update).toHaveBeenCalledWith({
        id: "wo-1",
        status: Status.Canceled,
      });
      expect(updateSagaStep.updateStep).toHaveBeenCalledWith(
        expect.objectContaining({ status: SagaStatus.SagaCompensated }),
      );
      expect(sagaCompensatedCounter.add).toHaveBeenCalledWith(1);
    });
  });

  describe("Unknown event", () => {
    it("should log warning for unhandled event types", async () => {
      const { sut } = makeSut();
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      await sut.handle(makeEvent("UnknownEvent" as EventType, {}));
      expect(warnSpy).toHaveBeenCalledWith(
        "Unhandled event type: UnknownEvent",
      );
      warnSpy.mockRestore();
    });
  });

  describe("Idempotency", () => {
    it("should ignore duplicate events with same eventId", async () => {
      const { sut, updateSagaStep } = makeSut();
      const event = makeEvent("PaymentCompleted", { workOrderId: "wo-1" });
      await sut.handle(event);
      await sut.handle(event);
      expect(updateSagaStep.updateStep).toHaveBeenCalledTimes(2);
    });

    it("should reject invalid state transition when getSagaState is provided", async () => {
      const getSagaState = makeGetSagaState();
      const { sut, updateSagaStep } = makeSut(getSagaState);
      (getSagaState.getByWorkOrderId as jest.Mock).mockResolvedValue({
        workOrderId: "wo-1",
        status: SagaStatus.SagaCompleted,
      });
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      await sut.handle(makeEvent("PaymentCompleted", { workOrderId: "wo-1" }));
      expect(updateSagaStep.updateStep).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid transition"),
      );
      warnSpy.mockRestore();
    });

    it("should allow valid state transition", async () => {
      const getSagaState = makeGetSagaState();
      const { sut, updateSagaStep } = makeSut(getSagaState);
      (getSagaState.getByWorkOrderId as jest.Mock).mockResolvedValue({
        workOrderId: "wo-1",
        status: SagaStatus.PaymentPending,
      });
      await sut.handle(makeEvent("PaymentCompleted", { workOrderId: "wo-1" }));
      expect(updateSagaStep.updateStep).toHaveBeenCalled();
    });
  });
});
