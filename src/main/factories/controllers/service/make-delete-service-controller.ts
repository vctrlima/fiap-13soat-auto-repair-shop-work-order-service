import { DeleteServiceController } from '@/presentation/controllers';
import { makeDeleteService } from '@/main/factories/use-cases';

export const makeDeleteServiceController = (): DeleteServiceController => {
  return new DeleteServiceController(makeDeleteService());
};
