import { Service } from '@/domain/entities';

export interface GetServiceById {
  getById: (params: GetServiceById.Params) => Promise<GetServiceById.Result>;
}

export namespace GetServiceById {
  export type Params = { id: string };
  export type Result = Service;
}
