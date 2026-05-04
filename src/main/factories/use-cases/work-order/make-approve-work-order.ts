import { DbApproveWorkOrder, DbStartSaga } from "@/application/use-cases";
import env from "@/main/config/env";
import prisma from "@/infra/db/prisma-client";
import { PrismaWorkOrderRepository, PrismaSagaStateRepository } from "@/infra/db/repositories";
import { PrismaOutboxEventPublisher } from "@/infra/messaging/prisma-outbox-event-publisher";
import { CustomerServiceAdapter } from "@/infra/http/customer-service-adapter";

export const makeApproveWorkOrder = (): DbApproveWorkOrder => {
  const repository = new PrismaWorkOrderRepository(prisma);
  const eventPublisher = new PrismaOutboxEventPublisher(prisma);
  const sagaRepository = new PrismaSagaStateRepository(prisma);
  const startSaga = new DbStartSaga(sagaRepository);
  const customerEmailProvider = new CustomerServiceAdapter(env.customerServiceUrl);
  return new DbApproveWorkOrder(repository, eventPublisher, startSaga, customerEmailProvider);
};
