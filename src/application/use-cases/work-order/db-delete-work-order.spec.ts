import { DbDeleteWorkOrder } from '@/application/use-cases/work-order/db-delete-work-order';
import { DeleteWorkOrderRepository } from '@/application/protocols/db';

const makeRepository = (): DeleteWorkOrderRepository => ({ delete: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const sut = new DbDeleteWorkOrder(repository);
  return { sut, repository };
};

describe('DbDeleteWorkOrder', () => {
  it('should call repository with correct id', async () => {
    const { sut, repository } = makeSut();
    (repository.delete as jest.Mock).mockResolvedValue(undefined);
    await sut.delete({ id: 'wo-1' });
    expect(repository.delete).toHaveBeenCalledWith({ id: 'wo-1' });
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.delete as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.delete({ id: 'wo-1' })).rejects.toThrow('not found');
  });
});
