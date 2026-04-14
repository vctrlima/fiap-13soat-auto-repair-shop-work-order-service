import { SagaStatus } from '@/domain/enums';

export interface SagaState {
  id: string;
  workOrderId: string;
  status: SagaStatus;
  currentStep: string;
  compensationHistory: SagaCompensationEntry[];
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface SagaCompensationEntry {
  step: string;
  status: 'completed' | 'failed';
  timestamp: Date;
  reason?: string;
}
