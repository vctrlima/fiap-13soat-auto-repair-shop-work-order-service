import { CreateSagaStateRepository } from '@/application/protocols/db';
import { StartSaga } from '@/domain/use-cases';
import { sagaStartedCounter } from '@/infra/observability';

export class DbStartSaga implements StartSaga {
  constructor(private readonly createSagaStateRepository: CreateSagaStateRepository) {}

  async start(params: StartSaga.Params): Promise<StartSaga.Result> {
    const sagaState = await this.createSagaStateRepository.create(params);
    sagaStartedCounter.add(1);
    return sagaState;
  }
}
