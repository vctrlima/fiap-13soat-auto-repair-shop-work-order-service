import { DbGetPartOrSupplyById } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaPartOrSupplyRepository } from '@/infra/db/repositories';

export const makeGetPartOrSupplyById = (): DbGetPartOrSupplyById => {
  const repository = new PrismaPartOrSupplyRepository(prisma);
  return new DbGetPartOrSupplyById(repository);
};
