import { GetWorkOrderById } from '@/domain/use-cases';

export interface GetWorkOrderByIdRepository {
  getById(params: GetWorkOrderByIdRepository.Params): Promise<GetWorkOrderByIdRepository.Result>;
}

export namespace GetWorkOrderByIdRepository {
  export type Params = GetWorkOrderById.Params;
  export type Result = GetWorkOrderById.Result;
}
