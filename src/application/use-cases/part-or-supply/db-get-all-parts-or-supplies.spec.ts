import { DbGetAllPartsOrSupplies } from '@/application/use-cases/part-or-supply/db-get-all-parts-or-supplies';
import { GetAllPartsOrSuppliesRepository } from '@/application/protocols/db';

const makeRepository = (): GetAllPartsOrSuppliesRepository => ({ getAll: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbGetAllPartsOrSupplies(repository);
  return { sut, repository };
};

describe('DbGetAllPartsOrSupplies', () => {
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
