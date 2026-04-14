import { GetAllWorkOrders } from '@/domain/use-cases';

export interface GetAllWorkOrdersRepository {
  getAll(params: GetAllWorkOrdersRepository.Params): Promise<GetAllWorkOrdersRepository.Result>;
}

export namespace GetAllWorkOrdersRepository {
  export type Params = GetAllWorkOrders.Params;
  export type Result = GetAllWorkOrders.Result;
}
