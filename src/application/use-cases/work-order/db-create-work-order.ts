import { CreateWorkOrderRepository } from '@/application/protocols/db';
import { CreateWorkOrder } from '@/domain/use-cases';
import { workOrderCreatedCounter } from '@/infra/observability';

export class DbCreateWorkOrder implements CreateWorkOrder {
  constructor(private readonly createWorkOrderRepository: CreateWorkOrderRepository) {}

  async create(params: CreateWorkOrder.Params): Promise<CreateWorkOrder.Result> {
    const result = await this.createWorkOrderRepository.create(params);
    workOrderCreatedCounter.add(1);
    return result;
  }
}
