import { GetAllServices } from "@/domain/use-cases";
import { GetAllServicesController } from "@/presentation/controllers/service/get-all-services-controller";

const makeGetAll = (): GetAllServices => ({ getAll: jest.fn() });
const makeSut = () => {
  const getAllServices = makeGetAll();
  const sut = new GetAllServicesController(getAllServices);
  return { sut, getAllServices };
};

describe("GetAllServicesController", () => {
  const mockResult = {
    content: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  it("should return 200 with default query", async () => {
    const { sut, getAllServices } = makeSut();
    (getAllServices.getAll as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({} as any);
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it("should pass query params correctly", async () => {
    const { sut, getAllServices } = makeSut();
    (getAllServices.getAll as jest.Mock).mockResolvedValue(mockResult);
    await sut.handle({
      query: {
        page: "2",
        limit: "10",
        orderBy: "name",
        orderDirection: "desc",
        name: "Brake",
      },
    } as any);
    expect(getAllServices.getAll).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      orderBy: "name",
      orderDirection: "desc",
      name: "Brake",
    });
  });

  it("should return 500 on error", async () => {
    const { sut, getAllServices } = makeSut();
    (getAllServices.getAll as jest.Mock).mockRejectedValue(new Error("err"));
    const result = await sut.handle({} as any);
    expect(result.statusCode).toBe(500);
  });
});
