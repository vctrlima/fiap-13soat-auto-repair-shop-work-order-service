import { CancelWorkOrderController } from '@/presentation/controllers/work-order/cancel-work-order-controller';
import { NotFoundError } from '@/presentation/errors';
import { CancelWorkOrder } from '@/domain/use-cases';

const makeCancel = (): CancelWorkOrder => ({ cancel: jest.fn() });
const makeSut = () => {
  const cancelWorkOrder = makeCancel();
  const sut = new CancelWorkOrderController(cancelWorkOrder);
  return { sut, cancelWorkOrder };
};

describe('CancelWorkOrderController', () => {
  it('should return 400 if no id', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {} } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 200 on success', async () => {
    const { sut, cancelWorkOrder } = makeSut();
    (cancelWorkOrder.cancel as jest.Mock).mockResolvedValue({ id: 'wo-1', status: 'CANCELED' });
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(200);
  });

  it('should return 404 if not found', async () => {
    const { sut, cancelWorkOrder } = makeSut();
    (cancelWorkOrder.cancel as jest.Mock).mockRejectedValue(new NotFoundError('WorkOrder'));
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(404);
  });

  it('should return 500 on error', async () => {
    const { sut, cancelWorkOrder } = makeSut();
    (cancelWorkOrder.cancel as jest.Mock).mockRejectedValue(new Error('err'));
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(500);
  });
});
