import { GetWorkOrderByIdRepository } from '@/application/protocols/db';
import { GetWorkOrderById } from '@/domain/use-cases';

export class DbGetWorkOrderById implements GetWorkOrderById {
  constructor(private readonly getWorkOrderByIdRepository: GetWorkOrderByIdRepository) {}

  async getById(params: GetWorkOrderById.Params): Promise<GetWorkOrderById.Result> {
    return await this.getWorkOrderByIdRepository.getById(params);
  }
}
