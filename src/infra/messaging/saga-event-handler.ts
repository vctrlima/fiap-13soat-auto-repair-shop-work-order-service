import { EventPublisher } from "@/application/protocols/messaging";
import { SagaStatus, Status } from "@/domain/enums";
import {
  DomainEvent,
  ExecutionEventData,
  PaymentEventData,
} from "@/domain/events";
import {
  GetSagaState,
  UpdateSagaStep,
  UpdateWorkOrder,
} from "@/domain/use-cases";
import {
  sagaCompensatedCounter,
  workOrderCompletedCounter,
} from "@/infra/observability";

const VALID_TRANSITIONS: Record<string, SagaStatus[]> = {
  PaymentCompleted: [SagaStatus.PaymentPending, SagaStatus.SagaStarted],
  PaymentFailed: [SagaStatus.PaymentPending, SagaStatus.SagaStarted],
  ExecutionCompleted: [SagaStatus.ExecutionPending],
  ExecutionFailed: [SagaStatus.ExecutionPending],
};

export class SagaEventHandler {
  private readonly processedEventIds = new Set<string>();

  constructor(
    private readonly updateSagaStep: UpdateSagaStep,
    private readonly updateWorkOrder: UpdateWorkOrder,
    private readonly eventPublisher: EventPublisher,
    private readonly getSagaState?: GetSagaState,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (this.processedEventIds.has(event.eventId)) {
      console.warn(`Duplicate event ignored: ${event.eventId}`);
      return;
    }

    if (this.getSagaState && event.data?.workOrderId) {
      const validStatuses = VALID_TRANSITIONS[event.eventType];
      if (validStatuses) {
        const sagaState = await this.getSagaState.getByWorkOrderId({
          workOrderId: event.data.workOrderId,
        });
        if (sagaState && !validStatuses.includes(sagaState.status)) {
          console.warn(
            `Invalid transition: ${event.eventType} not allowed from ${sagaState.status}`,
          );
          return;
        }
      }
    }

    switch (event.eventType) {
      case "PaymentCompleted":
        await this.handlePaymentCompleted(
          event as DomainEvent<PaymentEventData>,
        );
        break;
      case "PaymentFailed":
        await this.handlePaymentFailed(event as DomainEvent<PaymentEventData>);
        break;
      case "ExecutionCompleted":
        await this.handleExecutionCompleted(
          event as DomainEvent<ExecutionEventData>,
        );
        break;
      case "ExecutionFailed":
        await this.handleExecutionFailed(
          event as DomainEvent<ExecutionEventData>,
        );
        break;
      default:
        console.warn(`Unhandled event type: ${event.eventType}`);
    }

    this.processedEventIds.add(event.eventId);
    if (this.processedEventIds.size > 10000) {
      const first = this.processedEventIds.values().next().value;
      if (first) this.processedEventIds.delete(first);
    }
  }

  private async handlePaymentCompleted(
    event: DomainEvent<PaymentEventData>,
  ): Promise<void> {
    const { workOrderId } = event.data;
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.PaymentCompleted,
      currentStep: "PAYMENT",
    });
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.ExecutionPending,
      currentStep: "EXECUTION",
    });
    await this.updateWorkOrder.update({
      id: workOrderId,
      status: Status.InExecution,
    });
  }

  private async handlePaymentFailed(
    event: DomainEvent<PaymentEventData>,
  ): Promise<void> {
    const { workOrderId, failureReason } = event.data;
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.PaymentFailed,
      currentStep: "PAYMENT",
      compensationReason: failureReason,
    });
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.SagaCompensating,
      currentStep: "COMPENSATION",
    });
    await this.updateWorkOrder.update({
      id: workOrderId,
      status: Status.Canceled,
    });
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.SagaCompensated,
      currentStep: "COMPENSATION",
      compensationReason: `Payment failed: ${failureReason}`,
    });
    sagaCompensatedCounter.add(1);
  }

  private async handleExecutionCompleted(
    event: DomainEvent<ExecutionEventData>,
  ): Promise<void> {
    const { workOrderId } = event.data;
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.ExecutionCompleted,
      currentStep: "EXECUTION",
    });
    await this.updateWorkOrder.update({
      id: workOrderId,
      status: Status.Finished,
    });
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.SagaCompleted,
      currentStep: "COMPLETED",
    });
    workOrderCompletedCounter.add(1);
  }

  private async handleExecutionFailed(
    event: DomainEvent<ExecutionEventData>,
  ): Promise<void> {
    const { workOrderId, failureReason } = event.data;
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.ExecutionFailed,
      currentStep: "EXECUTION",
      compensationReason: failureReason,
    });
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.SagaCompensating,
      currentStep: "COMPENSATION",
    });
    await this.eventPublisher.publish({
      eventType: "RefundRequested",
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      version: "1.0",
      source: "work-order-service",
      data: { workOrderId, failureReason },
    });
    await this.updateWorkOrder.update({
      id: workOrderId,
      status: Status.Canceled,
    });
    await this.updateSagaStep.updateStep({
      workOrderId,
      status: SagaStatus.SagaCompensated,
      currentStep: "COMPENSATION",
      compensationReason: `Execution failed: ${failureReason}`,
    });
    sagaCompensatedCounter.add(1);
  }
}
