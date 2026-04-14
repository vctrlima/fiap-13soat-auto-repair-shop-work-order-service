import { GetServiceByIdController } from '@/presentation/controllers';
import { makeGetServiceById } from '@/main/factories/use-cases';

export const makeGetServiceByIdController = (): GetServiceByIdController => {
  return new GetServiceByIdController(makeGetServiceById());
};
