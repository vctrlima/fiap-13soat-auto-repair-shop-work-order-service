import { DbCreateService } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaServiceRepository } from '@/infra/db/repositories';

export const makeCreateService = (): DbCreateService => {
  const repository = new PrismaServiceRepository(prisma);
  return new DbCreateService(repository);
};
