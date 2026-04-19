jest.mock("@/infra/observability", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));

import { SagaTimeoutJob } from "@/infra/messaging/saga-timeout-job";
import { logger as mockLogger } from "@/infra/observability";

const mockFindMany = jest.fn();
const mockSagaUpdate = jest.fn();
const mockWorkOrderUpdate = jest.fn();
const mockTransaction = jest.fn();

const makePrisma = () =>
  ({
    sagaState: { findMany: mockFindMany },
    $transaction: mockTransaction,
    workOrder: { update: mockWorkOrderUpdate },
  }) as any;

// Expose individual update mocks through prisma for $transaction array
const makePrismaWithTransaction = () => {
  const prisma = makePrisma();
  prisma.sagaState.update = mockSagaUpdate;
  prisma.workOrder.update = mockWorkOrderUpdate;
  mockTransaction.mockImplementation((ops: any[]) => Promise.resolve(ops));
  return prisma;
};

describe("SagaTimeoutJob", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should start and stop the job", () => {
    const job = new SagaTimeoutJob(makePrisma());
    job.start(60_000);
    expect(mockLogger.info).toHaveBeenCalled();
    job.stop();
  });

  it("should handle stop when not started", () => {
    const job = new SagaTimeoutJob(makePrisma());
    expect(() => job.stop()).not.toThrow();
  });

  it("should do nothing when no stale sagas found", async () => {
    mockFindMany.mockResolvedValue([]);
    const job = new SagaTimeoutJob(makePrisma());
    await job.checkTimeouts();
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it("should compensate stale sagas", async () => {
    const staleSaga = {
      id: "saga-1",
      workOrderId: "wo-1",
      status: "SAGA_STARTED",
      currentStep: "PAYMENT",
      compensationHistory: [],
      updatedAt: new Date(Date.now() - 60 * 60 * 1000),
    };
    mockFindMany.mockResolvedValue([staleSaga]);

    const prisma = makePrismaWithTransaction();

    const job = new SagaTimeoutJob(prisma);
    await job.checkTimeouts();

    expect(mockTransaction).toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it("should handle null compensationHistory", async () => {
    const staleSaga = {
      id: "saga-2",
      workOrderId: "wo-2",
      status: "PAYMENT_PENDING",
      currentStep: "PAYMENT",
      compensationHistory: null,
      updatedAt: new Date(Date.now() - 60 * 60 * 1000),
    };
    mockFindMany.mockResolvedValue([staleSaga]);

    const prisma = makePrismaWithTransaction();

    const job = new SagaTimeoutJob(prisma);
    await job.checkTimeouts();

    expect(mockTransaction).toHaveBeenCalled();
  });
});
