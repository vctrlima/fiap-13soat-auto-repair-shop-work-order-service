import { GetPartOrSupplyByIdController } from '@/presentation/controllers';
import { makeGetPartOrSupplyById } from '@/main/factories/use-cases';

export const makeGetPartOrSupplyByIdController = (): GetPartOrSupplyByIdController => {
  return new GetPartOrSupplyByIdController(makeGetPartOrSupplyById());
};
