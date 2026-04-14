import { CreatePartOrSupplyController } from '@/presentation/controllers';
import { makeCreatePartOrSupply } from '@/main/factories/use-cases';

export const makeCreatePartOrSupplyController = (): CreatePartOrSupplyController => {
  return new CreatePartOrSupplyController(makeCreatePartOrSupply());
};
