import { GetAllServicesController } from '@/presentation/controllers';
import { makeGetAllServices } from '@/main/factories/use-cases';

export const makeGetAllServicesController = (): GetAllServicesController => {
  return new GetAllServicesController(makeGetAllServices());
};
