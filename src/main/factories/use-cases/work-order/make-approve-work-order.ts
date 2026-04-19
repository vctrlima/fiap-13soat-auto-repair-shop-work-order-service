import { DbApproveWorkOrder } from "@/application/use-cases";
import prisma from "@/infra/db/prisma-client";
import { PrismaWorkOrderRepository } from "@/infra/db/repositories";
import { PrismaOutboxEventPublisher } from "@/infra/messaging/prisma-outbox-event-publisher";

export const makeApproveWorkOrder = (): DbApproveWorkOrder => {
  const repository = new PrismaWorkOrderRepository(prisma);
  const eventPublisher = new PrismaOutboxEventPublisher(prisma);
  return new DbApproveWorkOrder(repository, eventPublisher);
};
