import { DbUpdatePartOrSupply } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaPartOrSupplyRepository } from '@/infra/db/repositories';

export const makeUpdatePartOrSupply = (): DbUpdatePartOrSupply => {
  const repository = new PrismaPartOrSupplyRepository(prisma);
  return new DbUpdatePartOrSupply(repository);
};
