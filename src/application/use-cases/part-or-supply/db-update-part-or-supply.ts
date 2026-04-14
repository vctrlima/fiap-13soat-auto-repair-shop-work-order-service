import { UpdatePartOrSupplyRepository } from '@/application/protocols/db';
import { UpdatePartOrSupply } from '@/domain/use-cases';

export class DbUpdatePartOrSupply implements UpdatePartOrSupply {
  constructor(private readonly updatePartOrSupplyRepository: UpdatePartOrSupplyRepository) {}

  async update(params: UpdatePartOrSupply.Params): Promise<UpdatePartOrSupply.Result> {
    return await this.updatePartOrSupplyRepository.update(params);
  }
}
