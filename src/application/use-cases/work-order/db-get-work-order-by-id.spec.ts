import { DbGetWorkOrderById } from '@/application/use-cases/work-order/db-get-work-order-by-id';
import { GetWorkOrderByIdRepository } from '@/application/protocols/db';

const makeRepository = (): GetWorkOrderByIdRepository => ({ getById: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbGetWorkOrderById(repository);
  return { sut, repository };
};

describe('DbGetWorkOrderById', () => {
  const mockResult = { id: 'wo-1', customerId: 'c-1', vehicleId: 'v-1', status: 'RECEIVED', budget: 100 };

  it('should call repository with correct id', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockResolvedValue(mockResult);
    await sut.getById({ id: 'wo-1' });
    expect(repository.getById).toHaveBeenCalledWith({ id: 'wo-1' });
  });

  it('should return work order', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.getById({ id: 'wo-1' });
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.getById({ id: 'wo-1' })).rejects.toThrow('not found');
  });
});
