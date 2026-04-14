import { DbGetSagaState } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaSagaStateRepository } from '@/infra/db/repositories';

export const makeGetSagaState = (): DbGetSagaState => {
  const repository = new PrismaSagaStateRepository(prisma);
  return new DbGetSagaState(repository);
};
