import { DbUpdateWorkOrder } from '@/application/use-cases/work-order/db-update-work-order';
import { UpdateWorkOrderRepository } from '@/application/protocols/db';

const makeRepository = (): UpdateWorkOrderRepository => ({ update: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbUpdateWorkOrder(repository);
  return { sut, repository };
};

describe('DbUpdateWorkOrder', () => {
  const params = { id: 'wo-1', status: 'IN_EXECUTION' as any };
  const mockResult = { id: 'wo-1', customerId: 'c-1', vehicleId: 'v-1', status: 'IN_EXECUTION', budget: 100, createdAt: new Date(), updatedAt: new Date() };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    await sut.update(params);
    expect(repository.update).toHaveBeenCalledWith(params);
  });

  it('should return updated work order', async () => {
    const { sut, repository } = makeSut();
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.update(params);
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.update as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.update(params)).rejects.toThrow('not found');
  });
});
