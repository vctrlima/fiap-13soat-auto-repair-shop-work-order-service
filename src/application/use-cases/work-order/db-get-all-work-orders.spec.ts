import { DbGetAllWorkOrders } from '@/application/use-cases/work-order/db-get-all-work-orders';
import { GetAllWorkOrdersRepository } from '@/application/protocols/db';

const makeRepository = (): GetAllWorkOrdersRepository => ({ getAll: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbGetAllWorkOrders(repository);
  return { sut, repository };
};

describe('DbGetAllWorkOrders', () => {
  const mockResult = { page: 1, limit: 10, total: 0, totalPages: 0, content: [] };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.getAll as jest.Mock).mockResolvedValue(mockResult);
    await sut.getAll({ page: 1, limit: 10 });
    expect(repository.getAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should return paginated result', async () => {
    const { sut, repository } = makeSut();
    (repository.getAll as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.getAll({ page: 1, limit: 10 });
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.getAll as jest.Mock).mockRejectedValue(new Error('err'));
    await expect(sut.getAll({ page: 1, limit: 10 })).rejects.toThrow('err');
  });
});
