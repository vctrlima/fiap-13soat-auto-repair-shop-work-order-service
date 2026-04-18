import { DbCreatePartOrSupply } from '@/application/use-cases/part-or-supply/db-create-part-or-supply';
import { CreatePartOrSupplyRepository } from '@/application/protocols/db';

const makeRepository = (): CreatePartOrSupplyRepository => ({ create: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbCreatePartOrSupply(repository);
  return { sut, repository };
};

describe('DbCreatePartOrSupply', () => {
  const params = { name: 'Oil Filter', price: 25, inStock: 10 };
  const mockResult = { id: 'p-1', ...params, createdAt: new Date(), updatedAt: null };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    await sut.create(params);
    expect(repository.create).toHaveBeenCalledWith(params);
  });

  it('should return created part', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.create(params);
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockRejectedValue(new Error('err'));
    await expect(sut.create(params)).rejects.toThrow('err');
  });
});
