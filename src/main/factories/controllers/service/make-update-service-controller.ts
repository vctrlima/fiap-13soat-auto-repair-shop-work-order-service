import { UpdateServiceController } from '@/presentation/controllers';
import { makeUpdateService } from '@/main/factories/use-cases';

export const makeUpdateServiceController = (): UpdateServiceController => {
  return new UpdateServiceController(makeUpdateService());
};
