import { DbGetAllPartsOrSupplies } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaPartOrSupplyRepository } from '@/infra/db/repositories';

export const makeGetAllPartsOrSupplies = (): DbGetAllPartsOrSupplies => {
  const repository = new PrismaPartOrSupplyRepository(prisma);
  return new DbGetAllPartsOrSupplies(repository);
};
