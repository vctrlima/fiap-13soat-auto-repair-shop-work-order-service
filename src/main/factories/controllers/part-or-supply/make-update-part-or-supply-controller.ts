import { UpdatePartOrSupplyController } from '@/presentation/controllers';
import { makeUpdatePartOrSupply } from '@/main/factories/use-cases';

export const makeUpdatePartOrSupplyController = (): UpdatePartOrSupplyController => {
  return new UpdatePartOrSupplyController(makeUpdatePartOrSupply());
};
