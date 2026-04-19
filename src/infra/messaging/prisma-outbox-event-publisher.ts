import { EventPublisher } from "@/application/protocols/messaging";
import { DomainEvent } from "@/domain/events";
import { messagePublishedCounter } from "@/infra/observability";
import { PrismaClient } from "@prisma/client";

/**
 * Writes events to the outbox table instead of publishing directly to SNS.
 * The OutboxProcessor polls the table and publishes to SNS asynchronously.
 * This ensures events are only created when the DB transaction commits.
 */
export class PrismaOutboxEventPublisher implements EventPublisher {
  constructor(private readonly prisma: PrismaClient) {}

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        eventType: event.eventType,
        payload: event as any,
      },
    });
    messagePublishedCounter.add(1, { eventType: event.eventType });
  }
}
