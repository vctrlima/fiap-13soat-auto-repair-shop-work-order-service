import { CreateServiceRepository } from '@/application/protocols/db';
import { CreateService } from '@/domain/use-cases';

export class DbCreateService implements CreateService {
  constructor(private readonly createServiceRepository: CreateServiceRepository) {}

  async create(params: CreateService.Params): Promise<CreateService.Result> {
    return await this.createServiceRepository.create(params);
  }
}
