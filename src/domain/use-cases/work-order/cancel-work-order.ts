import { WorkOrder } from '@/domain/entities';

export interface CancelWorkOrder {
  cancel(data: CancelWorkOrder.Params): Promise<CancelWorkOrder.Result>;
}

export namespace CancelWorkOrder {
  export type Params = { id: string };
  export type Result = WorkOrder;
}
