import { DbGetServiceById } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaServiceRepository } from '@/infra/db/repositories';

export const makeGetServiceById = (): DbGetServiceById => {
  const repository = new PrismaServiceRepository(prisma);
  return new DbGetServiceById(repository);
};
