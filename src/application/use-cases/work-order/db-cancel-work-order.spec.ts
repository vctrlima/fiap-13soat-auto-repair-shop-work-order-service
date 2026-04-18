import { DbCancelWorkOrder } from '@/application/use-cases/work-order/db-cancel-work-order';
import { CancelWorkOrderRepository } from '@/application/protocols/db';
import { EventPublisher } from '@/application/protocols/messaging';

const makeRepository = (): CancelWorkOrderRepository => ({ cancel: jest.fn() });
const makePublisher = (): EventPublisher => ({ publish: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const publisher = makePublisher();
  const sut = new DbCancelWorkOrder(repository, publisher);
  return { sut, repository, publisher };
};

describe('DbCancelWorkOrder', () => {
  const mockResult = { id: 'wo-1', customerId: 'c-1', vehicleId: 'v-1', budget: 100, status: 'CANCELED', createdAt: new Date(), updatedAt: new Date() };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.cancel as jest.Mock).mockResolvedValue(mockResult);
    await sut.cancel({ id: 'wo-1' });
    expect(repository.cancel).toHaveBeenCalledWith({ id: 'wo-1' });
  });

  it('should publish WorkOrderCanceled event', async () => {
    const { sut, repository, publisher } = makeSut();
    (repository.cancel as jest.Mock).mockResolvedValue(mockResult);
    await sut.cancel({ id: 'wo-1' });
    expect(publisher.publish).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'WorkOrderCanceled',
      source: 'work-order-service',
      data: expect.objectContaining({ workOrderId: 'wo-1' }),
    }));
  });

  it('should return canceled work order', async () => {
    const { sut, repository } = makeSut();
    (repository.cancel as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.cancel({ id: 'wo-1' });
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.cancel as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.cancel({ id: 'wo-1' })).rejects.toThrow('not found');
  });
});
