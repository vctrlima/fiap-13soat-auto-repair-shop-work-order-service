export interface DeleteWorkOrder {
  delete: (data: DeleteWorkOrder.Params) => Promise<DeleteWorkOrder.Result>;
}

export namespace DeleteWorkOrder {
  export type Params = { id: string };
  export type Result = void;
}
