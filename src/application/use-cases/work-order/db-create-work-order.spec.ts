jest.mock('@/infra/observability', () => ({
  workOrderCreatedCounter: { add: jest.fn() },
}));

import { DbCreateWorkOrder } from '@/application/use-cases/work-order/db-create-work-order';
import { CreateWorkOrderRepository } from '@/application/protocols/db';

const makeRepository = (): CreateWorkOrderRepository => ({ create: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbCreateWorkOrder(repository);
  return { sut, repository };
};

describe('DbCreateWorkOrder', () => {
  const params = { customerId: 'c-1', vehicleId: 'v-1', serviceIds: ['s-1'] };
  const mockResult = { id: 'wo-1', ...params, budget: 100, status: 'RECEIVED', createdAt: new Date(), updatedAt: null };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    await sut.create(params);
    expect(repository.create).toHaveBeenCalledWith(params);
  });

  it('should return created work order', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.create(params);
    expect(result).toEqual(mockResult);
  });

  it('should increment counter on success', async () => {
    const { sut, repository } = makeSut();
    const { workOrderCreatedCounter } = require('@/infra/observability');
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    await sut.create(params);
    expect(workOrderCreatedCounter.add).toHaveBeenCalledWith(1);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockRejectedValue(new Error('err'));
    await expect(sut.create(params)).rejects.toThrow('err');
  });
});
