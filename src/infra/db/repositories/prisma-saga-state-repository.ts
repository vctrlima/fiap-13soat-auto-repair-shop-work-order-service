import {
  CreateSagaStateRepository,
  GetSagaStateRepository,
  UpdateSagaStateRepository,
} from '@/application/protocols/db';
import { SagaState } from '@/domain/entities';
import { PrismaClient } from '@/generated/prisma/client';
import { SagaStateMapper } from '@/infra/db/mappers';

export class PrismaSagaStateRepository
  implements CreateSagaStateRepository, UpdateSagaStateRepository, GetSagaStateRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(params: CreateSagaStateRepository.Params): Promise<SagaState> {
    const data = await this.prisma.sagaState.create({
      data: { workOrderId: params.workOrderId },
    });
    return SagaStateMapper.toDomain(data);
  }

  async update(params: UpdateSagaStateRepository.Params): Promise<SagaState> {
    const existing = await this.prisma.sagaState.findUnique({
      where: { workOrderId: params.workOrderId },
    });

    const compensationHistory = (existing?.compensationHistory as any[]) ?? [];
    if (params.compensationReason) {
      compensationHistory.push({
        step: params.currentStep,
        status: 'completed',
        timestamp: new Date(),
        reason: params.compensationReason,
      });
    }

    const data = await this.prisma.sagaState.update({
      where: { workOrderId: params.workOrderId },
      data: {
        status: params.status as string as any,
        currentStep: params.currentStep,
        compensationHistory,
      },
    });
    return SagaStateMapper.toDomain(data);
  }

  async getByWorkOrderId(workOrderId: string): Promise<SagaState | null> {
    const data = await this.prisma.sagaState.findUnique({
      where: { workOrderId },
    });
    return data ? SagaStateMapper.toDomain(data) : null;
  }
}
