import { CreateWorkOrderController } from '@/presentation/controllers';
import { makeCreateWorkOrder } from '@/main/factories/use-cases';

export const makeCreateWorkOrderController = (): CreateWorkOrderController => {
  return new CreateWorkOrderController(makeCreateWorkOrder());
};
