export interface DeletePartOrSupply {
  delete: (data: DeletePartOrSupply.Params) => Promise<DeletePartOrSupply.Result>;
}

export namespace DeletePartOrSupply {
  export type Params = { id: string };
  export type Result = void;
}
