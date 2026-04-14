import { DbCreateWorkOrder } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaWorkOrderRepository } from '@/infra/db/repositories';

export const makeCreateWorkOrder = (): DbCreateWorkOrder => {
  const repository = new PrismaWorkOrderRepository(prisma);
  return new DbCreateWorkOrder(repository);
};
