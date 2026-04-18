import { Prisma } from '@prisma/client';

export type WorkOrderRepositoryType = Prisma.WorkOrderGetPayload<{
  include: {
    services: { include: { service: true } };
    partsAndSupplies: { include: { partOrSupply: true } };
  };
}>;

export type ServiceRepositoryType = Prisma.ServiceGetPayload<Record<string, never>>;

export type PartOrSupplyRepositoryType = Prisma.PartOrSupplyGetPayload<Record<string, never>>;

export type SagaStateRepositoryType = Prisma.SagaStateGetPayload<Record<string, never>>;
