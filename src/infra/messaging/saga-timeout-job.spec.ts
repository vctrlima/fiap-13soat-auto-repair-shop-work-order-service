import { SagaTimeoutJob } from "@/infra/messaging/saga-timeout-job";

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
    const logSpy = jest.spyOn(console, "log").mockImplementation();
    const job = new SagaTimeoutJob(makePrisma());
    job.start(60_000);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Started"));
    job.stop();
    logSpy.mockRestore();
  });

  it("should handle stop when not started", () => {
    const job = new SagaTimeoutJob(makePrisma());
    expect(() => job.stop()).not.toThrow();
  });

  it("should do nothing when no stale sagas found", async () => {
    mockFindMany.mockResolvedValue([]);
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    const job = new SagaTimeoutJob(makePrisma());
    await job.checkTimeouts();
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
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
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    const job = new SagaTimeoutJob(prisma);
    await job.checkTimeouts();

    expect(mockTransaction).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Compensated 1 timed-out sagas"),
    );
    warnSpy.mockRestore();
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
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    const job = new SagaTimeoutJob(prisma);
    await job.checkTimeouts();

    expect(mockTransaction).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
