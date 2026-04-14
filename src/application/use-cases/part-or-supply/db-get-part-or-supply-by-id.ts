import { GetPartOrSupplyByIdRepository } from '@/application/protocols/db';
import { GetPartOrSupplyById } from '@/domain/use-cases';

export class DbGetPartOrSupplyById implements GetPartOrSupplyById {
  constructor(private readonly getPartOrSupplyByIdRepository: GetPartOrSupplyByIdRepository) {}

  async getById(params: GetPartOrSupplyById.Params): Promise<GetPartOrSupplyById.Result> {
    return await this.getPartOrSupplyByIdRepository.getById(params);
  }
}
