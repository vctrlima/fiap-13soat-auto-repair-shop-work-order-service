jest.mock('@/infra/observability', () => ({
  sagaCompletedCounter: { add: jest.fn() },
  sagaCompensatedCounter: { add: jest.fn() },
}));

import { DbUpdateSagaStep } from '@/application/use-cases/saga/db-update-saga-step';
import { UpdateSagaStateRepository } from '@/application/protocols/db';
import { SagaStatus } from '@/domain/enums';

const makeRepository = (): UpdateSagaStateRepository => ({ update: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbUpdateSagaStep(repository);
  return { sut, repository };
};

describe('DbUpdateSagaStep', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    const params = { workOrderId: 'wo-1', status: SagaStatus.PaymentCompleted, currentStep: 'PAYMENT' };
    const mockResult = { id: 'saga-1', workOrderId: 'wo-1', status: SagaStatus.PaymentCompleted, currentStep: 'PAYMENT', compensationHistory: [], createdAt: new Date(), updatedAt: new Date() };
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    await sut.updateStep(params);
    expect(repository.update).toHaveBeenCalledWith(params);
  });

  it('should increment sagaCompletedCounter when status is SagaCompleted', async () => {
    const { sut, repository } = makeSut();
    const { sagaCompletedCounter } = require('@/infra/observability');
    const mockResult = { id: 'saga-1', workOrderId: 'wo-1', status: SagaStatus.SagaCompleted, currentStep: 'COMPLETED', compensationHistory: [], createdAt: new Date(), updatedAt: new Date() };
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    await sut.updateStep({ workOrderId: 'wo-1', status: SagaStatus.SagaCompleted, currentStep: 'COMPLETED' });
    expect(sagaCompletedCounter.add).toHaveBeenCalledWith(1);
  });

  it('should increment sagaCompensatedCounter when compensation history exists with reason', async () => {
    const { sut, repository } = makeSut();
    const { sagaCompensatedCounter } = require('@/infra/observability');
    const mockResult = { id: 'saga-1', workOrderId: 'wo-1', status: SagaStatus.SagaCompensated, currentStep: 'COMPENSATION', compensationHistory: ['Payment failed'], createdAt: new Date(), updatedAt: new Date() };
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    await sut.updateStep({ workOrderId: 'wo-1', status: SagaStatus.SagaCompensated, currentStep: 'COMPENSATION', compensationReason: 'Payment failed' });
    expect(sagaCompensatedCounter.add).toHaveBeenCalledWith(1);
  });

  it('should not increment counters for intermediate status', async () => {
    const { sut, repository } = makeSut();
    const { sagaCompletedCounter, sagaCompensatedCounter } = require('@/infra/observability');
    const mockResult = { id: 'saga-1', workOrderId: 'wo-1', status: SagaStatus.PaymentPending, currentStep: 'PAYMENT', compensationHistory: [], createdAt: new Date(), updatedAt: new Date() };
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    await sut.updateStep({ workOrderId: 'wo-1', status: SagaStatus.PaymentPending, currentStep: 'PAYMENT' });
    expect(sagaCompletedCounter.add).not.toHaveBeenCalled();
    expect(sagaCompensatedCounter.add).not.toHaveBeenCalled();
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.update as jest.Mock).mockRejectedValue(new Error('err'));
    await expect(sut.updateStep({ workOrderId: 'wo-1', status: SagaStatus.PaymentPending, currentStep: 'PAYMENT' })).rejects.toThrow('err');
  });
});
