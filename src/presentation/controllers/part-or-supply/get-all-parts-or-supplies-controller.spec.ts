import { GetAllPartsOrSupplies } from '@/domain/use-cases';
import { GetAllPartsOrSuppliesController } from '@/presentation/controllers/part-or-supply/get-all-parts-or-supplies-controller';

const makeGetAll = (): GetAllPartsOrSupplies => ({ getAll: jest.fn() });
const makeSut = () => {
  const getAllPartsOrSupplies = makeGetAll();
  const sut = new GetAllPartsOrSuppliesController(getAllPartsOrSupplies);
  return { sut, getAllPartsOrSupplies };
};

describe("GetAllPartsOrSuppliesController", () => {
  const mockResult = {
    content: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  it("should return 200 with default query", async () => {
    const { sut, getAllPartsOrSupplies } = makeSut();
    (getAllPartsOrSupplies.getAll as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({} as any);
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it("should pass query params correctly", async () => {
    const { sut, getAllPartsOrSupplies } = makeSut();
    (getAllPartsOrSupplies.getAll as jest.Mock).mockResolvedValue(mockResult);
    await sut.handle({
      query: {
        page: "2",
        limit: "10",
        orderBy: "name",
        orderDirection: "asc",
        name: "Oil",
        inStock: "true",
      },
    } as any);
    expect(getAllPartsOrSupplies.getAll).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      orderBy: "name",
      orderDirection: "asc",
      name: "Oil",
      inStock: true,
    });
  });

  it("should handle inStock false", async () => {
    const { sut, getAllPartsOrSupplies } = makeSut();
    (getAllPartsOrSupplies.getAll as jest.Mock).mockResolvedValue(mockResult);
    await sut.handle({ query: { inStock: "false" } } as any);
    expect(getAllPartsOrSupplies.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ inStock: false }),
    );
  });

  it("should return 500 on error", async () => {
    const { sut, getAllPartsOrSupplies } = makeSut();
    (getAllPartsOrSupplies.getAll as jest.Mock).mockRejectedValue(
      new Error("err"),
    );
    const result = await sut.handle({} as any);
    expect(result.statusCode).toBe(500);
  });
});
