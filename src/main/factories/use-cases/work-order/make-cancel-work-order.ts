import { DbCancelWorkOrder } from "@/application/use-cases";
import prisma from "@/infra/db/prisma-client";
import { PrismaWorkOrderRepository } from "@/infra/db/repositories";
import { PrismaOutboxEventPublisher } from "@/infra/messaging/prisma-outbox-event-publisher";

export const makeCancelWorkOrder = (): DbCancelWorkOrder => {
  const repository = new PrismaWorkOrderRepository(prisma);
  const eventPublisher = new PrismaOutboxEventPublisher(prisma);
  return new DbCancelWorkOrder(repository, eventPublisher);
};
