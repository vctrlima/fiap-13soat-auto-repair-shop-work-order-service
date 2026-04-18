import { DbUpdatePartOrSupply } from '@/application/use-cases/part-or-supply/db-update-part-or-supply';
import { UpdatePartOrSupplyRepository } from '@/application/protocols/db';

const makeRepository = (): UpdatePartOrSupplyRepository => ({ update: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbUpdatePartOrSupply(repository);
  return { sut, repository };
};

describe('DbUpdatePartOrSupply', () => {
  const params = { id: 'p-1', price: 30 };
  const mockResult = { id: 'p-1', name: 'Oil Filter', price: 30, inStock: true };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    await sut.update(params);
    expect(repository.update).toHaveBeenCalledWith(params);
  });

  it('should return updated part', async () => {
    const { sut, repository } = makeSut();
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.update(params);
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.update as jest.Mock).mockRejectedValue(new Error('err'));
    await expect(sut.update(params)).rejects.toThrow('err');
  });
});
