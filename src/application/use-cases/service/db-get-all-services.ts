import { GetAllServicesRepository } from '@/application/protocols/db';
import { GetAllServices } from '@/domain/use-cases';

export class DbGetAllServices implements GetAllServices {
  constructor(private readonly getAllServicesRepository: GetAllServicesRepository) {}

  async getAll(params: GetAllServices.Params): Promise<GetAllServices.Result> {
    return await this.getAllServicesRepository.getAll(params);
  }
}
