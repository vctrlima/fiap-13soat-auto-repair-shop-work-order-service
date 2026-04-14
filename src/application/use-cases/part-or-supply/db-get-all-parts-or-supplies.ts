import { GetAllPartsOrSuppliesRepository } from '@/application/protocols/db';
import { GetAllPartsOrSupplies } from '@/domain/use-cases';

export class DbGetAllPartsOrSupplies implements GetAllPartsOrSupplies {
  constructor(private readonly getAllPartsOrSuppliesRepository: GetAllPartsOrSuppliesRepository) {}

  async getAll(params: GetAllPartsOrSupplies.Params): Promise<GetAllPartsOrSupplies.Result> {
    return await this.getAllPartsOrSuppliesRepository.getAll(params);
  }
}
