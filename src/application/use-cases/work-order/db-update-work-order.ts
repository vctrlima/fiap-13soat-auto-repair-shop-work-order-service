import { UpdateWorkOrderRepository } from '@/application/protocols/db';
import { UpdateWorkOrder } from '@/domain/use-cases';

export class DbUpdateWorkOrder implements UpdateWorkOrder {
  constructor(private readonly updateWorkOrderRepository: UpdateWorkOrderRepository) {}

  async update(params: UpdateWorkOrder.Params): Promise<UpdateWorkOrder.Result> {
    return await this.updateWorkOrderRepository.update(params);
  }
}
