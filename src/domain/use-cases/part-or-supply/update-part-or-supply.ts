import { PartOrSupply } from '@/domain/entities';

export interface UpdatePartOrSupply {
  update: (data: UpdatePartOrSupply.Params) => Promise<UpdatePartOrSupply.Result>;
}

export namespace UpdatePartOrSupply {
  export type Params = {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    inStock?: number;
  };

  export type Result = PartOrSupply;
}
