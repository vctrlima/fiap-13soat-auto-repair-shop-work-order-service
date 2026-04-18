import { DbDeletePartOrSupply } from '@/application/use-cases/part-or-supply/db-delete-part-or-supply';
import { DeletePartOrSupplyRepository } from '@/application/protocols/db';

const makeRepository = (): DeletePartOrSupplyRepository => ({ delete: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbDeletePartOrSupply(repository);
  return { sut, repository };
};

describe('DbDeletePartOrSupply', () => {
  it('should call repository with correct id', async () => {
    const { sut, repository } = makeSut();
    (repository.delete as jest.Mock).mockResolvedValue(undefined);
    await sut.delete({ id: 'p-1' });
    expect(repository.delete).toHaveBeenCalledWith({ id: 'p-1' });
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.delete as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.delete({ id: 'p-1' })).rejects.toThrow('not found');
  });
});
