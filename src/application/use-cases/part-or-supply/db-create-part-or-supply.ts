import { CreatePartOrSupplyRepository } from '@/application/protocols/db';
import { CreatePartOrSupply } from '@/domain/use-cases';

export class DbCreatePartOrSupply implements CreatePartOrSupply {
  constructor(private readonly createPartOrSupplyRepository: CreatePartOrSupplyRepository) {}

  async create(params: CreatePartOrSupply.Params): Promise<CreatePartOrSupply.Result> {
    return await this.createPartOrSupplyRepository.create(params);
  }
}
