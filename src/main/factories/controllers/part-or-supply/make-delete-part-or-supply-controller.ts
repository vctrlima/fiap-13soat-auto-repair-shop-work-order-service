import { DeletePartOrSupplyController } from '@/presentation/controllers';
import { makeDeletePartOrSupply } from '@/main/factories/use-cases';

export const makeDeletePartOrSupplyController = (): DeletePartOrSupplyController => {
  return new DeletePartOrSupplyController(makeDeletePartOrSupply());
};
