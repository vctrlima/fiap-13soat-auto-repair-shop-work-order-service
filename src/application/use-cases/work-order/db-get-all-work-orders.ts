import { GetAllWorkOrdersRepository } from '@/application/protocols/db';
import { GetAllWorkOrders } from '@/domain/use-cases';

export class DbGetAllWorkOrders implements GetAllWorkOrders {
  constructor(private readonly getAllWorkOrdersRepository: GetAllWorkOrdersRepository) {}

  async getAll(params: GetAllWorkOrders.Params): Promise<GetAllWorkOrders.Result> {
    return await this.getAllWorkOrdersRepository.getAll(params);
  }
}
