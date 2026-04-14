import { DbCancelWorkOrder } from '@/application/use-cases';
import prisma from '@/infra/db/prisma-client';
import { PrismaWorkOrderRepository } from '@/infra/db/repositories';
import { SnsEventPublisher } from '@/infra/messaging';
import env from '@/main/config/env';

export const makeCancelWorkOrder = (): DbCancelWorkOrder => {
  const repository = new PrismaWorkOrderRepository(prisma);
  const eventPublisher = new SnsEventPublisher(env.snsWorkOrderTopicArn, env.awsRegion, env.awsEndpoint);
  return new DbCancelWorkOrder(repository, eventPublisher);
};
