import { DbCreateService } from '@/application/use-cases/service/db-create-service';
import { CreateServiceRepository } from '@/application/protocols/db';

const makeRepository = (): CreateServiceRepository => ({ create: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbCreateService(repository);
  return { sut, repository };
};

describe('DbCreateService', () => {
  const params = { name: 'Oil Change', price: 50 };
  const mockResult = { id: 's-1', ...params, createdAt: new Date(), updatedAt: null };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    await sut.create(params);
    expect(repository.create).toHaveBeenCalledWith(params);
  });

  it('should return created service', async () => {
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
