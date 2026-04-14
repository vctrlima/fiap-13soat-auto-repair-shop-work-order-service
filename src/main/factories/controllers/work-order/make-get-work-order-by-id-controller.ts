import { GetWorkOrderByIdController } from '@/presentation/controllers';
import { makeGetWorkOrderById } from '@/main/factories/use-cases';

export const makeGetWorkOrderByIdController = (): GetWorkOrderByIdController => {
  return new GetWorkOrderByIdController(makeGetWorkOrderById());
};
