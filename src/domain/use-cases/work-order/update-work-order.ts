import { WorkOrder } from '@/domain/entities';
import { Status } from '@/domain/enums';

export interface UpdateWorkOrder {
  update: (data: UpdateWorkOrder.Params) => Promise<UpdateWorkOrder.Result>;
}

export namespace UpdateWorkOrder {
  export type Params = {
    id: string;
    serviceIds?: string[];
    partAndSupplyIds?: string[];
    status?: Status;
  };

  export type Result = WorkOrder;
}
