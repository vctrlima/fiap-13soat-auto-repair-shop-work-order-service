import { UpdateWorkOrderController } from '@/presentation/controllers';
import { makeUpdateWorkOrder } from '@/main/factories/use-cases';

export const makeUpdateWorkOrderController = (): UpdateWorkOrderController => {
  return new UpdateWorkOrderController(makeUpdateWorkOrder());
};
