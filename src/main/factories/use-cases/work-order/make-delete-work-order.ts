import { DbDeleteWorkOrder } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaWorkOrderRepository } from '@/infra/db/repositories';

export const makeDeleteWorkOrder = (): DbDeleteWorkOrder => {
  const repository = new PrismaWorkOrderRepository(prisma);
  return new DbDeleteWorkOrder(repository);
};
