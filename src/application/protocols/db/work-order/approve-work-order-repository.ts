import { ApproveWorkOrder } from '@/domain/use-cases';

export interface ApproveWorkOrderRepository {
  approve(params: ApproveWorkOrderRepository.Params): Promise<ApproveWorkOrderRepository.Result>;
}

export namespace ApproveWorkOrderRepository {
  export type Params = ApproveWorkOrder.Params;
  export type Result = ApproveWorkOrder.Result;
}
