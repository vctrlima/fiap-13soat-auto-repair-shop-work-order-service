import { SagaState, SagaCompensationEntry } from '@/domain/entities';
import { SagaStatus } from '@/domain/enums';
import { SagaStateRepositoryType } from '@/infra/db/types';

export class SagaStateMapper {
  static toDomain(data: SagaStateRepositoryType): SagaState {
    return {
      id: data.id,
      workOrderId: data.workOrderId,
      status: data.status as unknown as SagaStatus,
      currentStep: data.currentStep,
      compensationHistory: (data.compensationHistory as unknown as SagaCompensationEntry[]) ?? [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
