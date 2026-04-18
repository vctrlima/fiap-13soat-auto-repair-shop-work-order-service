import { DbGetSagaState } from '@/application/use-cases/saga/db-get-saga-state';
import { GetSagaStateRepository } from '@/application/protocols/db';

const makeRepository = (): GetSagaStateRepository => ({ getByWorkOrderId: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbGetSagaState(repository);
  return { sut, repository };
};

describe('DbGetSagaState', () => {
  const mockResult = { id: 'saga-1', workOrderId: 'wo-1', status: 'SAGA_STARTED', currentStep: 'INIT', compensationHistory: [] };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.getByWorkOrderId as jest.Mock).mockResolvedValue(mockResult);
    await sut.getByWorkOrderId({ workOrderId: 'wo-1' });
    expect(repository.getByWorkOrderId).toHaveBeenCalledWith('wo-1');
  });

  it('should return saga state', async () => {
    const { sut, repository } = makeSut();
    (repository.getByWorkOrderId as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.getByWorkOrderId({ workOrderId: 'wo-1' });
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.getByWorkOrderId as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.getByWorkOrderId({ workOrderId: 'wo-1' })).rejects.toThrow('not found');
  });
});
