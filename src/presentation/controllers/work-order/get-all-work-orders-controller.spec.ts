import { GetAllWorkOrders } from "@/domain/use-cases";
import { GetAllWorkOrdersController } from "@/presentation/controllers/work-order/get-all-work-orders-controller";

const makeGetAll = (): GetAllWorkOrders => ({ getAll: jest.fn() });
const makeSut = () => {
  const getAllWorkOrders = makeGetAll();
  const sut = new GetAllWorkOrdersController(getAllWorkOrders);
  return { sut, getAllWorkOrders };
};

describe("GetAllWorkOrdersController", () => {
  const mockResult = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    content: [],
  };

  it("should return 200 with paginated result", async () => {
    const { sut, getAllWorkOrders } = makeSut();
    (getAllWorkOrders.getAll as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ query: { page: 1, limit: 10 } });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it("should pass all query params", async () => {
    const { sut, getAllWorkOrders } = makeSut();
    (getAllWorkOrders.getAll as jest.Mock).mockResolvedValue(mockResult);
    await sut.handle({
      query: {
        page: "2",
        limit: "10",
        orderBy: "createdAt",
        orderDirection: "desc",
        customerId: "c-1",
        vehicleId: "v-1",
        status: "RECEIVED",
        minBudget: "100",
        maxBudget: "500",
      },
    } as any);
    expect(getAllWorkOrders.getAll).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      orderBy: "createdAt",
      orderDirection: "desc",
      customerId: "c-1",
      vehicleId: "v-1",
      status: "RECEIVED",
      minBudget: 100,
      maxBudget: 500,
    });
  });

  it("should handle empty query", async () => {
    const { sut, getAllWorkOrders } = makeSut();
    (getAllWorkOrders.getAll as jest.Mock).mockResolvedValue(mockResult);
    await sut.handle({} as any);
    expect(getAllWorkOrders.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });

  it("should return 500 on error", async () => {
    const { sut, getAllWorkOrders } = makeSut();
    (getAllWorkOrders.getAll as jest.Mock).mockRejectedValue(new Error("err"));
    const result = await sut.handle({ query: { page: 1, limit: 10 } });
    expect(result.statusCode).toBe(500);
  });
});
