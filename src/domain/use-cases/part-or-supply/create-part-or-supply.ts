import { PartOrSupply } from '@/domain/entities';

export interface CreatePartOrSupply {
  create: (data: CreatePartOrSupply.Params) => Promise<CreatePartOrSupply.Result>;
}

export namespace CreatePartOrSupply {
  export type Params = {
    name: string;
    description?: string;
    price: number;
    inStock: number;
  };

  export type Result = PartOrSupply;
}
