import { WorkOrder } from '@/domain/entities';
import { Status } from '@/domain/enums';
import { DefaultPageParams, Page } from '@/domain/types';

export interface GetAllWorkOrders {
  getAll: (params: GetAllWorkOrders.Params) => Promise<GetAllWorkOrders.Result>;
}

export namespace GetAllWorkOrders {
  export type Params = DefaultPageParams & {
    customerId?: string;
    vehicleId?: string;
    status?: Status;
    minBudget?: number;
    maxBudget?: number;
  };

  export type Result = Page<WorkOrder>;
}
