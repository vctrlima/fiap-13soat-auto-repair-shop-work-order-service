import { CreateServiceController } from '@/presentation/controllers/service/create-service-controller';
import { CreateService } from '@/domain/use-cases';

const makeCreateService = (): CreateService => ({ create: jest.fn() });
const makeSut = () => {
  const createService = makeCreateService();
  const sut = new CreateServiceController(createService);
  return { sut, createService };
};

describe('CreateServiceController', () => {
  const body = { name: 'Oil Change', price: 50 };
  const mockResult = { id: 's-1', ...body };

  it('should return 400 if no body', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({} as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if no name', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ body: { price: 50 } } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if no price', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ body: { name: 'Test' } } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 201 on success', async () => {
    const { sut, createService } = makeSut();
    (createService.create as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ body });
    expect(result.statusCode).toBe(201);
    expect(result.body).toEqual(mockResult);
  });

  it('should return 500 on error', async () => {
    const { sut, createService } = makeSut();
    (createService.create as jest.Mock).mockRejectedValue(new Error('err'));
    const result = await sut.handle({ body });
    expect(result.statusCode).toBe(500);
  });
});
