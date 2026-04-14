import { DeleteWorkOrderRepository } from '@/application/protocols/db';
import { DeleteWorkOrder } from '@/domain/use-cases';

export class DbDeleteWorkOrder implements DeleteWorkOrder {
  constructor(private readonly deleteWorkOrderRepository: DeleteWorkOrderRepository) {}

  async delete(params: DeleteWorkOrder.Params): Promise<void> {
    await this.deleteWorkOrderRepository.delete(params);
  }
}
