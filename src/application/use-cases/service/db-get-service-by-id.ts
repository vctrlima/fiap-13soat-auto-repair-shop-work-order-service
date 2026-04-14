import { GetServiceByIdRepository } from '@/application/protocols/db';
import { GetServiceById } from '@/domain/use-cases';

export class DbGetServiceById implements GetServiceById {
  constructor(private readonly getServiceByIdRepository: GetServiceByIdRepository) {}

  async getById(params: GetServiceById.Params): Promise<GetServiceById.Result> {
    return await this.getServiceByIdRepository.getById(params);
  }
}
