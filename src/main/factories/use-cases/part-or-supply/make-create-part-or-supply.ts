import { DbCreatePartOrSupply } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaPartOrSupplyRepository } from '@/infra/db/repositories';

export const makeCreatePartOrSupply = (): DbCreatePartOrSupply => {
  const repository = new PrismaPartOrSupplyRepository(prisma);
  return new DbCreatePartOrSupply(repository);
};
