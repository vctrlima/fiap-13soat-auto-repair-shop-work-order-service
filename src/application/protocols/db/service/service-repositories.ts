import { CreateService, GetServiceById, GetAllServices, UpdateService, DeleteService } from '@/domain/use-cases';

export interface CreateServiceRepository {
  create(params: CreateServiceRepository.Params): Promise<CreateServiceRepository.Result>;
}
export namespace CreateServiceRepository {
  export type Params = CreateService.Params;
  export type Result = CreateService.Result;
}

export interface GetServiceByIdRepository {
  getById(params: GetServiceByIdRepository.Params): Promise<GetServiceByIdRepository.Result>;
}
export namespace GetServiceByIdRepository {
  export type Params = GetServiceById.Params;
  export type Result = GetServiceById.Result;
}

export interface GetAllServicesRepository {
  getAll(params: GetAllServicesRepository.Params): Promise<GetAllServicesRepository.Result>;
}
export namespace GetAllServicesRepository {
  export type Params = GetAllServices.Params;
  export type Result = GetAllServices.Result;
}

export interface UpdateServiceRepository {
  update(params: UpdateServiceRepository.Params): Promise<UpdateServiceRepository.Result>;
}
export namespace UpdateServiceRepository {
  export type Params = UpdateService.Params;
  export type Result = UpdateService.Result;
}

export interface DeleteServiceRepository {
  delete(params: DeleteServiceRepository.Params): Promise<void>;
}
export namespace DeleteServiceRepository {
  export type Params = DeleteService.Params;
  export type Result = DeleteService.Result;
}
