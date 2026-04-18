import { DbUpdateService } from '@/application/use-cases/service/db-update-service';
import { UpdateServiceRepository } from '@/application/protocols/db';

const makeRepository = (): UpdateServiceRepository => ({ update: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbUpdateService(repository);
  return { sut, repository };
};

describe('DbUpdateService', () => {
  const params = { id: 's-1', price: 60 };
  const mockResult = { id: 's-1', name: 'Oil Change', price: 60, createdAt: new Date(), updatedAt: new Date() };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    await sut.update(params);
    expect(repository.update).toHaveBeenCalledWith(params);
  });

  it('should return updated service', async () => {
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
