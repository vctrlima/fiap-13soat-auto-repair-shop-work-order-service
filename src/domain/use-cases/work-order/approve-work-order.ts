import { WorkOrder } from '@/domain/entities';

export interface ApproveWorkOrder {
  approve(data: ApproveWorkOrder.Params): Promise<ApproveWorkOrder.Result>;
}

export namespace ApproveWorkOrder {
  export type Params = { id: string };
  export type Result = WorkOrder;
}
