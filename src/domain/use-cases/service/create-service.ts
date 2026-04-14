import { Service } from '@/domain/entities';

export interface CreateService {
  create: (data: CreateService.Params) => Promise<CreateService.Result>;
}

export namespace CreateService {
  export type Params = {
    name: string;
    description?: string;
    price: number;
  };

  export type Result = Service;
}
