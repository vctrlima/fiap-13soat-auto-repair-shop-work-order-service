import { GetSagaStateRepository } from '@/application/protocols/db';
import { GetSagaState } from '@/domain/use-cases';

export class DbGetSagaState implements GetSagaState {
  constructor(private readonly getSagaStateRepository: GetSagaStateRepository) {}

  async getByWorkOrderId(params: GetSagaState.Params): Promise<GetSagaState.Result> {
    return await this.getSagaStateRepository.getByWorkOrderId(params.workOrderId);
  }
}
