import { CreatePartOrSupply, GetPartOrSupplyById, GetAllPartsOrSupplies, UpdatePartOrSupply, DeletePartOrSupply } from '@/domain/use-cases';

export interface CreatePartOrSupplyRepository {
  create(params: CreatePartOrSupplyRepository.Params): Promise<CreatePartOrSupplyRepository.Result>;
}
export namespace CreatePartOrSupplyRepository {
  export type Params = CreatePartOrSupply.Params;
  export type Result = CreatePartOrSupply.Result;
}

export interface GetPartOrSupplyByIdRepository {
  getById(params: GetPartOrSupplyByIdRepository.Params): Promise<GetPartOrSupplyByIdRepository.Result>;
}
export namespace GetPartOrSupplyByIdRepository {
  export type Params = GetPartOrSupplyById.Params;
  export type Result = GetPartOrSupplyById.Result;
}

export interface GetAllPartsOrSuppliesRepository {
  getAll(params: GetAllPartsOrSuppliesRepository.Params): Promise<GetAllPartsOrSuppliesRepository.Result>;
}
export namespace GetAllPartsOrSuppliesRepository {
  export type Params = GetAllPartsOrSupplies.Params;
  export type Result = GetAllPartsOrSupplies.Result;
}

export interface UpdatePartOrSupplyRepository {
  update(params: UpdatePartOrSupplyRepository.Params): Promise<UpdatePartOrSupplyRepository.Result>;
}
export namespace UpdatePartOrSupplyRepository {
  export type Params = UpdatePartOrSupply.Params;
  export type Result = UpdatePartOrSupply.Result;
}

export interface DeletePartOrSupplyRepository {
  delete(params: DeletePartOrSupplyRepository.Params): Promise<void>;
}
export namespace DeletePartOrSupplyRepository {
  export type Params = DeletePartOrSupply.Params;
  export type Result = DeletePartOrSupply.Result;
}
