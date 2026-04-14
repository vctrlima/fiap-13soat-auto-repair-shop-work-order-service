export interface DeleteService {
  delete: (data: DeleteService.Params) => Promise<DeleteService.Result>;
}

export namespace DeleteService {
  export type Params = { id: string };
  export type Result = void;
}
