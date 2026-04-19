import { logger } from "@/infra/observability";
import { PrismaClient } from "@prisma/client";
import { SnsEventPublisher } from "./sns-event-publisher";

export class OutboxProcessor {
  private running = false;
  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly publisher: SnsEventPublisher,
  ) {}

  start(intervalMs = 5_000): void {
    this.running = true;
    this.intervalId = setInterval(() => {
      this.processOutbox().catch((err) =>
        logger.error({ err }, "Outbox processing failed"),
      );
    }, intervalMs);
    logger.info({ intervalMs }, "Outbox processor started");
  }

  stop(): void {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  async processOutbox(): Promise<void> {
    const events = await this.prisma.outboxEvent.findMany({
      where: { published: false },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    for (const event of events) {
      try {
        await this.publisher.publish(event.payload as any);
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { published: true, publishedAt: new Date() },
        });
      } catch (err) {
        logger.error(
          { err, eventId: event.id, eventType: event.eventType },
          "Failed to publish outbox event, will retry",
        );
      }
    }
  }
}
