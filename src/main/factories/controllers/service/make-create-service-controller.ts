import { CreateServiceController } from '@/presentation/controllers';
import { makeCreateService } from '@/main/factories/use-cases';

export const makeCreateServiceController = (): CreateServiceController => {
  return new CreateServiceController(makeCreateService());
};
