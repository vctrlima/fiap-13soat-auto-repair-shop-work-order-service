import { DeleteWorkOrderController } from '@/presentation/controllers';
import { makeDeleteWorkOrder } from '@/main/factories/use-cases';

export const makeDeleteWorkOrderController = (): DeleteWorkOrderController => {
  return new DeleteWorkOrderController(makeDeleteWorkOrder());
};
