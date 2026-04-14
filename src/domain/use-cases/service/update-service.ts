import { Service } from '@/domain/entities';

export interface UpdateService {
  update: (data: UpdateService.Params) => Promise<UpdateService.Result>;
}

export namespace UpdateService {
  export type Params = {
    id: string;
    name?: string;
    description?: string;
    price?: number;
  };

  export type Result = Service;
}
