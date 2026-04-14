import { Service } from '@/domain/entities';
import { DefaultPageParams, Page } from '@/domain/types';

export interface GetAllServices {
  getAll: (params: GetAllServices.Params) => Promise<GetAllServices.Result>;
}

export namespace GetAllServices {
  export type Params = DefaultPageParams & { name?: string };
  export type Result = Page<Service>;
}
