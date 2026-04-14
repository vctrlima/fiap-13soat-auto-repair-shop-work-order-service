import { DbDeleteService } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaServiceRepository } from '@/infra/db/repositories';

export const makeDeleteService = (): DbDeleteService => {
  const repository = new PrismaServiceRepository(prisma);
  return new DbDeleteService(repository);
};
