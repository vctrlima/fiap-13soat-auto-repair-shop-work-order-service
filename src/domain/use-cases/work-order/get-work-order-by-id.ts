import { WorkOrder } from '@/domain/entities';

export interface GetWorkOrderById {
  getById: (params: GetWorkOrderById.Params) => Promise<GetWorkOrderById.Result>;
}

export namespace GetWorkOrderById {
  export type Params = { id: string };
  export type Result = WorkOrder;
}
