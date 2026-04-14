import { GetAllPartsOrSuppliesController } from '@/presentation/controllers';
import { makeGetAllPartsOrSupplies } from '@/main/factories/use-cases';

export const makeGetAllPartsOrSuppliesController = (): GetAllPartsOrSuppliesController => {
  return new GetAllPartsOrSuppliesController(makeGetAllPartsOrSupplies());
};
