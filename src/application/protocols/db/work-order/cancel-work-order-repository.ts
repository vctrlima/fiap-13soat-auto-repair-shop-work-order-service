import { CancelWorkOrder } from '@/domain/use-cases';

export interface CancelWorkOrderRepository {
  cancel(params: CancelWorkOrderRepository.Params): Promise<CancelWorkOrderRepository.Result>;
}

export namespace CancelWorkOrderRepository {
  export type Params = CancelWorkOrder.Params;
  export type Result = CancelWorkOrder.Result;
}
