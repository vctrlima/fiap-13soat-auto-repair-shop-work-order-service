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
        console.error("[SagaTimeout] Error checking timeouts:", err),
      );
    }, intervalMs);
    console.log(
      `[SagaTimeout] Started — checking every ${intervalMs / 1000}s for sagas stale >${TIMEOUT_MINUTES}min`,
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
      console.warn(
        `[SagaTimeout] Saga ${saga.id} for workOrder ${saga.workOrderId} timed out in status ${saga.status}`,
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
      console.warn(
        `[SagaTimeout] Compensated ${staleSagas.length} timed-out sagas`,
      );
    }
  }
}
