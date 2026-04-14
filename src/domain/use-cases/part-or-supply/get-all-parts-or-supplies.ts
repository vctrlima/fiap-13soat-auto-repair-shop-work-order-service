import { PartOrSupply } from '@/domain/entities';
import { DefaultPageParams, Page } from '@/domain/types';

export interface GetAllPartsOrSupplies {
  getAll: (params: GetAllPartsOrSupplies.Params) => Promise<GetAllPartsOrSupplies.Result>;
}

export namespace GetAllPartsOrSupplies {
  export type Params = DefaultPageParams & {
    name?: string;
    inStock?: boolean;
  };

  export type Result = Page<PartOrSupply>;
}
