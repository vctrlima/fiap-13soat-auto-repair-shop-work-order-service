import { logger } from "@/infra/observability";
import { PrismaClient, SagaStatus } from "@prisma/client";

const TIMEOUT_MINUTES = 30;

const STALE_STATUSES: SagaStatus[] = [
  SagaStatus.SAGA_STARTED,
  SagaStatus.PAYMENT_PENDING,
  SagaStatus.EXECUTION_PENDING,
];

export class SagaTimeoutJob {
  private intervalId?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaClient) {}

  start(intervalMs = 60_000): void {
    this.intervalId = setInterval(() => {
      this.checkTimeouts().catch((err) =>
        logger.error({ err }, "SagaTimeout check failed"),
      );
    }, intervalMs);
    logger.info(
      { intervalMs, timeoutMinutes: TIMEOUT_MINUTES },
      "SagaTimeout started",
    );
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  async checkTimeouts(): Promise<void> {
    const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

    const staleSagas = await this.prisma.sagaState.findMany({
      where: {
        status: { in: STALE_STATUSES },
        updatedAt: { lt: cutoff },
      },
    });

    for (const saga of staleSagas) {
      logger.warn(
        { sagaId: saga.id, workOrderId: saga.workOrderId, status: saga.status },
        "Saga timed out",
      );

      const compensationHistory = (saga.compensationHistory as any[]) ?? [];
      compensationHistory.push({
        step: saga.currentStep,
        status: "timeout",
        timestamp: new Date(),
        reason: `Saga timed out after ${TIMEOUT_MINUTES} minutes in status ${saga.status}`,
      });

      await this.prisma.$transaction([
        this.prisma.sagaState.update({
          where: { id: saga.id },
          data: {
            status: SagaStatus.SAGA_COMPENSATED,
            currentStep: "TIMEOUT",
            compensationHistory,
          },
        }),
        this.prisma.workOrder.update({
          where: { id: saga.workOrderId },
          data: { status: "CANCELED" },
        }),
      ]);
    }

    if (staleSagas.length > 0) {
      logger.warn({ count: staleSagas.length }, "Compensated timed-out sagas");
    }
  }
}
