import { GetWorkOrderByIdController } from '@/presentation/controllers/work-order/get-work-order-by-id-controller';
import { NotFoundError } from '@/presentation/errors';
import { GetWorkOrderById } from '@/domain/use-cases';

const makeGet = (): GetWorkOrderById => ({ getById: jest.fn() });
const makeSut = () => {
  const getWorkOrderById = makeGet();
  const sut = new GetWorkOrderByIdController(getWorkOrderById);
  return { sut, getWorkOrderById };
};

describe('GetWorkOrderByIdController', () => {
  it('should return 400 if no id', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {} } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 200 with work order', async () => {
    const { sut, getWorkOrderById } = makeSut();
    const mockResult = { id: 'wo-1', status: 'RECEIVED' };
    (getWorkOrderById.getById as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it('should return 404 if not found', async () => {
    const { sut, getWorkOrderById } = makeSut();
    (getWorkOrderById.getById as jest.Mock).mockRejectedValue(new NotFoundError('WorkOrder'));
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(404);
  });

  it('should return 500 on error', async () => {
    const { sut, getWorkOrderById } = makeSut();
    (getWorkOrderById.getById as jest.Mock).mockRejectedValue(new Error('err'));
    const result = await sut.handle({ params: { id: 'wo-1' } });
    expect(result.statusCode).toBe(500);
  });
});
