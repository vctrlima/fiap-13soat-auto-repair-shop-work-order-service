import { CancelWorkOrderController } from '@/presentation/controllers';
import { makeCancelWorkOrder } from '@/main/factories/use-cases';

export const makeCancelWorkOrderController = (): CancelWorkOrderController => {
  return new CancelWorkOrderController(makeCancelWorkOrder());
};
