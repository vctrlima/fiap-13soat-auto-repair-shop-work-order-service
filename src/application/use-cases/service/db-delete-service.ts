import { DeleteServiceRepository } from '@/application/protocols/db';
import { DeleteService } from '@/domain/use-cases';

export class DbDeleteService implements DeleteService {
  constructor(private readonly deleteServiceRepository: DeleteServiceRepository) {}

  async delete(params: DeleteService.Params): Promise<void> {
    await this.deleteServiceRepository.delete(params);
  }
}
