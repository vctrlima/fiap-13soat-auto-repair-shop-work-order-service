import { WorkOrder } from '@/domain/entities';
import { Status } from '@/domain/enums';

export interface CreateWorkOrder {
  create: (data: CreateWorkOrder.Params) => Promise<CreateWorkOrder.Result>;
}

export namespace CreateWorkOrder {
  export type Params = {
    customerId: string;
    vehicleId: string;
    serviceIds: string[];
    partAndSupplyIds?: string[];
    status?: Status;
  };

  export type Result = WorkOrder;
}
