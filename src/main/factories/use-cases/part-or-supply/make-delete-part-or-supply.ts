import { DbDeletePartOrSupply } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaPartOrSupplyRepository } from '@/infra/db/repositories';

export const makeDeletePartOrSupply = (): DbDeletePartOrSupply => {
  const repository = new PrismaPartOrSupplyRepository(prisma);
  return new DbDeletePartOrSupply(repository);
};
