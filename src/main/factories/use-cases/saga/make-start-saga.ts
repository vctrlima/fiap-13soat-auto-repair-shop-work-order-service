import { DbStartSaga } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaSagaStateRepository } from '@/infra/db/repositories';

export const makeStartSaga = (): DbStartSaga => {
  const repository = new PrismaSagaStateRepository(prisma);
  return new DbStartSaga(repository);
};
