import { GetServiceById } from "@/domain/use-cases";
import { GetServiceByIdController } from "@/presentation/controllers/service/get-service-by-id-controller";
import { NotFoundError } from "@/presentation/errors";

const makeGetById = (): GetServiceById => ({ getById: jest.fn() });
const makeSut = () => {
  const getServiceById = makeGetById();
  const sut = new GetServiceByIdController(getServiceById);
  return { sut, getServiceById };
};

describe("GetServiceByIdController", () => {
  const mockResult = { id: "s-1", name: "Brake Service", price: 100 };

  it("should return 400 if no id", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {} } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 200 on success", async () => {
    const { sut, getServiceById } = makeSut();
    (getServiceById.getById as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ params: { id: "s-1" } });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it("should return 404 if not found", async () => {
    const { sut, getServiceById } = makeSut();
    (getServiceById.getById as jest.Mock).mockRejectedValue(
      new NotFoundError("not found"),
    );
    const result = await sut.handle({ params: { id: "s-1" } });
    expect(result.statusCode).toBe(404);
  });

  it("should return 500 on error", async () => {
    const { sut, getServiceById } = makeSut();
    (getServiceById.getById as jest.Mock).mockRejectedValue(new Error("err"));
    const result = await sut.handle({ params: { id: "s-1" } });
    expect(result.statusCode).toBe(500);
  });
});
