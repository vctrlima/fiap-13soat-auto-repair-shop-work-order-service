import { DbDeleteService } from '@/application/use-cases/service/db-delete-service';
import { DeleteServiceRepository } from '@/application/protocols/db';

const makeRepository = (): DeleteServiceRepository => ({ delete: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbDeleteService(repository);
  return { sut, repository };
};

describe('DbDeleteService', () => {
  it('should call repository with correct id', async () => {
    const { sut, repository } = makeSut();
    (repository.delete as jest.Mock).mockResolvedValue(undefined);
    await sut.delete({ id: 's-1' });
    expect(repository.delete).toHaveBeenCalledWith({ id: 's-1' });
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.delete as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.delete({ id: 's-1' })).rejects.toThrow('not found');
  });
});
