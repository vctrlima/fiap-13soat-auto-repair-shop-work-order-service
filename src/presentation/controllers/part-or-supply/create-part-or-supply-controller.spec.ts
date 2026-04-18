import { CreatePartOrSupplyController } from '@/presentation/controllers/part-or-supply/create-part-or-supply-controller';
import { CreatePartOrSupply } from '@/domain/use-cases';

const makeCreate = (): CreatePartOrSupply => ({ create: jest.fn() });
const makeSut = () => {
  const createPartOrSupply = makeCreate();
  const sut = new CreatePartOrSupplyController(createPartOrSupply);
  return { sut, createPartOrSupply };
};

describe('CreatePartOrSupplyController', () => {
  const body = { name: 'Oil Filter', price: 25, inStock: 10 };
  const mockResult = { id: 'p-1', ...body };

  it('should return 400 if no body', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({} as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if no name', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ body: { price: 25, inStock: 10 } } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if no price', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ body: { name: 'Test', inStock: 10 } } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if no inStock', async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ body: { name: 'Test', price: 25 } } as any);
    expect(result.statusCode).toBe(400);
  });

  it('should return 201 on success', async () => {
    const { sut, createPartOrSupply } = makeSut();
    (createPartOrSupply.create as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ body });
    expect(result.statusCode).toBe(201);
    expect(result.body).toEqual(mockResult);
  });

  it('should return 500 on error', async () => {
    const { sut, createPartOrSupply } = makeSut();
    (createPartOrSupply.create as jest.Mock).mockRejectedValue(new Error('err'));
    const result = await sut.handle({ body });
    expect(result.statusCode).toBe(500);
  });
});
