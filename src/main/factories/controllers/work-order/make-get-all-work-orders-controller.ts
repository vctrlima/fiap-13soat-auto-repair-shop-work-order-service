import { GetAllWorkOrdersController } from '@/presentation/controllers';
import { makeGetAllWorkOrders } from '@/main/factories/use-cases';

export const makeGetAllWorkOrdersController = (): GetAllWorkOrdersController => {
  return new GetAllWorkOrdersController(makeGetAllWorkOrders());
};
