import { PrismaSagaStateRepository } from "@/infra/db/repositories/prisma-saga-state-repository";

const makePrisma = () => ({
  sagaState: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

const makeSut = () => {
  const prisma = makePrisma();
  const sut = new PrismaSagaStateRepository(prisma as any);
  return { sut, prisma };
};

const now = new Date();
const mockData = {
  id: "sg-1",
  workOrderId: "wo-1",
  status: "STARTED",
  currentStep: "BILLING",
  compensationHistory: [],
  createdAt: now,
  updatedAt: now,
};

describe("PrismaSagaStateRepository", () => {
  describe("create", () => {
    it("should create saga state", async () => {
      const { sut, prisma } = makeSut();
      prisma.sagaState.create.mockResolvedValue(mockData);
      const result = await sut.create({ workOrderId: "wo-1" });
      expect(result.workOrderId).toBe("wo-1");
    });
  });

  describe("update", () => {
    it("should update saga state", async () => {
      const { sut, prisma } = makeSut();
      prisma.sagaState.findUnique.mockResolvedValue(mockData);
      prisma.sagaState.update.mockResolvedValue({
        ...mockData,
        status: "COMPLETED",
        currentStep: "DONE",
      });
      const result = await sut.update({
        workOrderId: "wo-1",
        status: "COMPLETED",
        currentStep: "DONE",
      } as any);
      expect(result.workOrderId).toBe("wo-1");
    });

    it("should append compensation reason to history", async () => {
      const { sut, prisma } = makeSut();
      prisma.sagaState.findUnique.mockResolvedValue(mockData);
      prisma.sagaState.update.mockResolvedValue({
        ...mockData,
        compensationHistory: [
          { step: "BILLING", status: "completed", reason: "failed" },
        ],
      });
      await sut.update({
        workOrderId: "wo-1",
        status: "COMPENSATING",
        currentStep: "BILLING",
        compensationReason: "failed",
      } as any);
      expect(prisma.sagaState.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            compensationHistory: expect.arrayContaining([
              expect.objectContaining({ step: "BILLING", reason: "failed" }),
            ]),
          }),
        }),
      );
    });

    it("should handle null existing compensationHistory", async () => {
      const { sut, prisma } = makeSut();
      prisma.sagaState.findUnique.mockResolvedValue({
        ...mockData,
        compensationHistory: null,
      });
      prisma.sagaState.update.mockResolvedValue(mockData);
      await sut.update({
        workOrderId: "wo-1",
        status: "COMPLETED",
        currentStep: "DONE",
      } as any);
      expect(prisma.sagaState.update).toHaveBeenCalled();
    });
  });

  describe("getByWorkOrderId", () => {
    it("should return saga state", async () => {
      const { sut, prisma } = makeSut();
      prisma.sagaState.findUnique.mockResolvedValue(mockData);
      const result = await sut.getByWorkOrderId("wo-1");
      expect(result?.workOrderId).toBe("wo-1");
    });

    it("should return null if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.sagaState.findUnique.mockResolvedValue(null);
      const result = await sut.getByWorkOrderId("wo-1");
      expect(result).toBeNull();
    });
  });
});
