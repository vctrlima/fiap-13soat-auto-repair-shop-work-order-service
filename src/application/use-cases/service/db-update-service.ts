import { UpdateServiceRepository } from '@/application/protocols/db';
import { UpdateService } from '@/domain/use-cases';

export class DbUpdateService implements UpdateService {
  constructor(private readonly updateServiceRepository: UpdateServiceRepository) {}

  async update(params: UpdateService.Params): Promise<UpdateService.Result> {
    return await this.updateServiceRepository.update(params);
  }
}
