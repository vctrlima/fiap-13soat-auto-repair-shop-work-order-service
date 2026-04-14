import { Prisma } from '@prisma/client';

export type WorkOrderRepositoryType = Prisma.WorkOrderGetPayload<{
  include: {
    services: { include: { service: true } };
    partsAndSupplies: { include: { partOrSupply: true } };
  };
}>;

export type ServiceRepositoryType = Prisma.ServiceGetPayload<{}>;

export type PartOrSupplyRepositoryType = Prisma.PartOrSupplyGetPayload<{}>;

export type SagaStateRepositoryType = Prisma.SagaStateGetPayload<{}>;
