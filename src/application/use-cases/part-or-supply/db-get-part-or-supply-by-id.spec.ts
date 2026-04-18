import { DbGetPartOrSupplyById } from '@/application/use-cases/part-or-supply/db-get-part-or-supply-by-id';
import { GetPartOrSupplyByIdRepository } from '@/application/protocols/db';

const makeRepository = (): GetPartOrSupplyByIdRepository => ({ getById: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbGetPartOrSupplyById(repository);
  return { sut, repository };
};

describe('DbGetPartOrSupplyById', () => {
  const mockResult = { id: 'p-1', name: 'Oil Filter', price: 25, inStock: true };

  it('should call repository with correct id', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockResolvedValue(mockResult);
    await sut.getById({ id: 'p-1' });
    expect(repository.getById).toHaveBeenCalledWith({ id: 'p-1' });
  });

  it('should return part', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.getById({ id: 'p-1' });
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.getById({ id: 'p-1' })).rejects.toThrow('not found');
  });
});
