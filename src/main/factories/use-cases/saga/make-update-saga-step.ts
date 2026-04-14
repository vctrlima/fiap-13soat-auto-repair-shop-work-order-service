import { DbUpdateSagaStep } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaSagaStateRepository } from '@/infra/db/repositories';

export const makeUpdateSagaStep = (): DbUpdateSagaStep => {
  const repository = new PrismaSagaStateRepository(prisma);
  return new DbUpdateSagaStep(repository);
};
