import { DbUpdateService } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaServiceRepository } from '@/infra/db/repositories';

export const makeUpdateService = (): DbUpdateService => {
  const repository = new PrismaServiceRepository(prisma);
  return new DbUpdateService(repository);
};
