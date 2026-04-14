import { SagaState } from '@/domain/entities';
import { SagaStatus } from '@/domain/enums';

export interface CreateSagaStateRepository {
  create(params: CreateSagaStateRepository.Params): Promise<SagaState>;
}
export namespace CreateSagaStateRepository {
  export type Params = { workOrderId: string };
}

export interface UpdateSagaStateRepository {
  update(params: UpdateSagaStateRepository.Params): Promise<SagaState>;
}
export namespace UpdateSagaStateRepository {
  export type Params = {
    workOrderId: string;
    status: SagaStatus;
    currentStep: string;
    compensationReason?: string;
  };
}

export interface GetSagaStateRepository {
  getByWorkOrderId(workOrderId: string): Promise<SagaState | null>;
}
