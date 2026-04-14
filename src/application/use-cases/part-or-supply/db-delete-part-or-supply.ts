import { DeletePartOrSupplyRepository } from '@/application/protocols/db';
import { DeletePartOrSupply } from '@/domain/use-cases';

export class DbDeletePartOrSupply implements DeletePartOrSupply {
  constructor(private readonly deletePartOrSupplyRepository: DeletePartOrSupplyRepository) {}

  async delete(params: DeletePartOrSupply.Params): Promise<void> {
    await this.deletePartOrSupplyRepository.delete(params);
  }
}
