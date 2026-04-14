import { DbGetAllWorkOrders } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaWorkOrderRepository } from '@/infra/db/repositories';

export const makeGetAllWorkOrders = (): DbGetAllWorkOrders => {
  const repository = new PrismaWorkOrderRepository(prisma);
  return new DbGetAllWorkOrders(repository);
};
