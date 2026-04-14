import { CreateWorkOrder } from '@/domain/use-cases';

export interface CreateWorkOrderRepository {
  create(params: CreateWorkOrderRepository.Params): Promise<CreateWorkOrderRepository.Result>;
}

export namespace CreateWorkOrderRepository {
  export type Params = CreateWorkOrder.Params;
  export type Result = CreateWorkOrder.Result;
}
