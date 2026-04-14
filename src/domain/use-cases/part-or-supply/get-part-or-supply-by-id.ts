import { PartOrSupply } from '@/domain/entities';

export interface GetPartOrSupplyById {
  getById: (params: GetPartOrSupplyById.Params) => Promise<GetPartOrSupplyById.Result>;
}

export namespace GetPartOrSupplyById {
  export type Params = { id: string };
  export type Result = PartOrSupply;
}
