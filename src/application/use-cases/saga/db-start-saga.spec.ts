jest.mock('@/infra/observability', () => ({
  sagaStartedCounter: { add: jest.fn() },
}));

import { DbStartSaga } from '@/application/use-cases/saga/db-start-saga';
import { CreateSagaStateRepository } from '@/application/protocols/db';

const makeRepository = (): CreateSagaStateRepository => ({ create: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbStartSaga(repository);
  return { sut, repository };
};

describe('DbStartSaga', () => {
  const params = { workOrderId: 'wo-1' };
  const mockResult = { id: 'saga-1', workOrderId: 'wo-1', status: 'SAGA_STARTED', currentStep: 'INIT', compensationHistory: [], createdAt: new Date(), updatedAt: null };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    await sut.start(params);
    expect(repository.create).toHaveBeenCalledWith(params);
  });

  it('should increment counter on success', async () => {
    const { sut, repository } = makeSut();
    const { sagaStartedCounter } = require('@/infra/observability');
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    await sut.start(params);
    expect(sagaStartedCounter.add).toHaveBeenCalledWith(1);
  });

  it('should return saga state', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.start(params);
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockRejectedValue(new Error('err'));
    await expect(sut.start(params)).rejects.toThrow('err');
  });
});
