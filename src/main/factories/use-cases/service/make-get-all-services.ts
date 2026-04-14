import { DbGetAllServices } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaServiceRepository } from '@/infra/db/repositories';

export const makeGetAllServices = (): DbGetAllServices => {
  const repository = new PrismaServiceRepository(prisma);
  return new DbGetAllServices(repository);
};
