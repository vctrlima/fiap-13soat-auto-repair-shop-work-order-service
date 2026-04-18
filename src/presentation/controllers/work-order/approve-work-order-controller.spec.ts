import { ApproveWorkOrderController } from '@/presentation/controllers/work-order/approve-work-order-controller';
import { NotFoundError } from '@/presentation/errors';
import { ApproveWorkOrder } from '@/domain/use-cases';

const makeApprove = (): ApproveWorkOrder => ({ approve: jest.fn() });
const makeSut = () => {
  const approveWorkOrder = makeApprove();
  const sut = new ApproveWorkOrderController(approveWorkOrder);
  return { sut, approveWorkOrder };
};

describe('ApproveWorkOrderController', () => {
  const mockResult = { id: 'wo-1', status: 'APPROVED' };

  it('should return 400 if no id', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {} } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 200 on success', async () => {
    const { sut, approveWorkOrder } = makeSut();
    (approveWorkOrder.approve as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it('should return 404 if not found', async () => {
    const { sut, approveWorkOrder } = makeSut();
    (approveWorkOrder.approve as jest.Mock).mockRejectedValue(new NotFoundError('WorkOrder'));
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(404);
  });

  it('should return 500 on error', async () => {
    const { sut, approveWorkOrder } = makeSut();
    (approveWorkOrder.approve as jest.Mock).mockRejectedValue(new Error('err'));
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(500);
  });
});
