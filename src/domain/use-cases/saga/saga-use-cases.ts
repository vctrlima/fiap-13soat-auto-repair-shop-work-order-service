import { SagaState } from '@/domain/entities';
import { SagaStatus } from '@/domain/enums';

export interface StartSaga {
  start(params: StartSaga.Params): Promise<StartSaga.Result>;
}

export namespace StartSaga {
  export type Params = { workOrderId: string };
  export type Result = SagaState;
}

export interface UpdateSagaStep {
  updateStep(params: UpdateSagaStep.Params): Promise<UpdateSagaStep.Result>;
}

export namespace UpdateSagaStep {
  export type Params = {
    workOrderId: string;
    status: SagaStatus;
    currentStep: string;
    compensationReason?: string;
  };
  export type Result = SagaState;
}

export interface GetSagaState {
  getByWorkOrderId(params: GetSagaState.Params): Promise<GetSagaState.Result>;
}

export namespace GetSagaState {
  export type Params = { workOrderId: string };
  export type Result = SagaState | null;
}
