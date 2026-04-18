import { CreateWorkOrderController } from '@/presentation/controllers/work-order/create-work-order-controller';
import { CreateWorkOrder } from '@/domain/use-cases';

const makeCreateWorkOrder = (): CreateWorkOrder => ({ create: jest.fn() });
const makeSut = () => {
  const createWorkOrder = makeCreateWorkOrder();
  const sut = new CreateWorkOrderController(createWorkOrder);
  return { sut, createWorkOrder };
};

describe('CreateWorkOrderController', () => {
  const body = { customerId: 'c-1', vehicleId: 'v-1', serviceIds: ['s-1'] };
  const mockResult = { id: 'wo-1', ...body, budget: 100, status: 'RECEIVED' };

  it('should return 400 if no body', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({} as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if no customerId', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ body: { vehicleId: 'v-1', serviceIds: ['s-1'] } } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if no vehicleId', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ body: { customerId: 'c-1', serviceIds: ['s-1'] } } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if no serviceIds', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ body: { customerId: 'c-1', vehicleId: 'v-1' } } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 201 on success', async () => {
    const { sut, createWorkOrder } = makeSut();
    (createWorkOrder.create as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ body });
    expect(result.statusCode).toBe(201);
    expect(result.body).toEqual(mockResult);
  });

  it('should return 500 on error', async () => {
    const { sut, createWorkOrder } = makeSut();
    (createWorkOrder.create as jest.Mock).mockRejectedValue(new Error('err'));
    const result = await sut.handle({ body });
    expect(result.statusCode).toBe(500);
  });
});
