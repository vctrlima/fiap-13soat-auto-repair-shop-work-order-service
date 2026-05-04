import { DbApproveWorkOrder } from '@/application/use-cases/work-order/db-approve-work-order';
import { ApproveWorkOrderRepository } from '@/application/protocols/db';
import { EventPublisher } from '@/application/protocols/messaging';
import { StartSaga } from '@/domain/use-cases';

const makeRepository = (): ApproveWorkOrderRepository => ({ approve: jest.fn() });
const makePublisher = (): EventPublisher => ({ publish: jest.fn() });
const makeStartSaga = (): StartSaga => ({ start: jest.fn() });
const makeSut = () => {
  const repository = makeRepository();
  const publisher = makePublisher();
  const startSaga = makeStartSaga();
  const sut = new DbApproveWorkOrder(repository, publisher, startSaga);
  return { sut, repository, publisher, startSaga };
};

describe('DbApproveWorkOrder', () => {
  const mockResult = { id: 'wo-1', customerId: 'c-1', vehicleId: 'v-1', budget: 100, status: 'APPROVED', createdAt: new Date(), updatedAt: new Date(), services: [], partsAndSupplies: [] };

  it('should call repository with correct params', async () => {
    const { sut, repository } = makeSut();
    (repository.approve as jest.Mock).mockResolvedValue(mockResult);
    await sut.approve({ id: 'wo-1' });
    expect(repository.approve).toHaveBeenCalledWith({ id: 'wo-1' });
  });

  it('should publish WorkOrderApproved event', async () => {
    const { sut, repository, publisher } = makeSut();
    (repository.approve as jest.Mock).mockResolvedValue(mockResult);
    await sut.approve({ id: 'wo-1' });
    expect(publisher.publish).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'WorkOrderApproved',
      source: 'work-order-service',
      data: expect.objectContaining({ workOrderId: 'wo-1' }),
    }));
  });

  it('should return approved work order', async () => {
    const { sut, repository } = makeSut();
    (repository.approve as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.approve({ id: 'wo-1' });
    expect(result).toEqual(mockResult);
  });

  it('should throw if repository throws', async () => {
    const { sut, repository } = makeSut();
    (repository.approve as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(sut.approve({ id: 'wo-1' })).rejects.toThrow('not found');
  });
});
