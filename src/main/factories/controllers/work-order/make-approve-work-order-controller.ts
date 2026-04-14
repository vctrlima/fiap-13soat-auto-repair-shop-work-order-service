import { ApproveWorkOrderController } from '@/presentation/controllers';
import { makeApproveWorkOrder } from '@/main/factories/use-cases';

export const makeApproveWorkOrderController = (): ApproveWorkOrderController => {
  return new ApproveWorkOrderController(makeApproveWorkOrder());
};
