import { DbGetWorkOrderById } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaWorkOrderRepository } from '@/infra/db/repositories';

export const makeGetWorkOrderById = (): DbGetWorkOrderById => {
  const repository = new PrismaWorkOrderRepository(prisma);
  return new DbGetWorkOrderById(repository);
};
