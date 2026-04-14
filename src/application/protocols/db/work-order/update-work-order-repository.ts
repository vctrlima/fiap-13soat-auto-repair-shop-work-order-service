import { UpdateWorkOrder } from '@/domain/use-cases';

export interface UpdateWorkOrderRepository {
  update(params: UpdateWorkOrderRepository.Params): Promise<UpdateWorkOrderRepository.Result>;
}

export namespace UpdateWorkOrderRepository {
  export type Params = UpdateWorkOrder.Params;
  export type Result = UpdateWorkOrder.Result;
}
