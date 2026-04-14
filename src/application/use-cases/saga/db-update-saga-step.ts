import { UpdateSagaStateRepository } from '@/application/protocols/db';
import { SagaStatus } from '@/domain/enums';
import { UpdateSagaStep } from '@/domain/use-cases';
import { sagaCompensatedCounter, sagaCompletedCounter } from '@/infra/observability';

export class DbUpdateSagaStep implements UpdateSagaStep {
  constructor(private readonly updateSagaStateRepository: UpdateSagaStateRepository) {}

  async updateStep(params: UpdateSagaStep.Params): Promise<UpdateSagaStep.Result> {
    const sagaState = await this.updateSagaStateRepository.update(params);
    if (sagaState.status === SagaStatus.SAGA_COMPLETED) {
      sagaCompletedCounter.add(1);
    }
    if (sagaState.compensationHistory.length > 0 && params.compensationReason) {
      sagaCompensatedCounter.add(1);
    }
    return sagaState;
  }
}
