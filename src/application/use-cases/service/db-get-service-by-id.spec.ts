import { DbGetServiceById } from '@/application/use-cases/service/db-get-service-by-id';
import { GetServiceByIdRepository } from '@/application/protocols/db';

const makeRepository = (): GetServiceByIdRepository => ({ getById: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbGetServiceById(repository);
  return { sut, repository };
};

describe('DbGetServiceById', () => {
  const mockResult = { id: 's-1', name: 'Oil Change', price: 50 };

  it('should call repository with correct id', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockResolvedValue(mockResult);
    await sut.getById({ id: 's-1' });
    expect(repository.getById).toHaveBeenCalledWith({ id: 's-1' });
  });

  it('should return service', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.getById({ id: 's-1' });
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.getById as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.getById({ id: 's-1' })).rejects.toThrow('not found');
  });
});
