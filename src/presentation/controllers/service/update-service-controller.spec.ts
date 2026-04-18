import { UpdateService } from "@/domain/use-cases";
import { UpdateServiceController } from "@/presentation/controllers/service/update-service-controller";
import { NotFoundError } from "@/presentation/errors";

const makeUpdate = (): UpdateService => ({ update: jest.fn() });
const makeSut = () => {
  const updateService = makeUpdate();
  const sut = new UpdateServiceController(updateService);
  return { sut, updateService };
};

describe("UpdateServiceController", () => {
  const body = { name: "Brake Service", price: 120 };
  const mockResult = { id: "s-1", ...body };

  it("should return 400 if no id", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {}, body } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 400 if no body", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: { id: "s-1" } } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 200 on success", async () => {
    const { sut, updateService } = makeSut();
    (updateService.update as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ params: { id: "s-1" }, body });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it("should return 404 if not found", async () => {
    const { sut, updateService } = makeSut();
    (updateService.update as jest.Mock).mockRejectedValue(
      new NotFoundError("not found"),
    );
    const result = await sut.handle({ params: { id: "s-1" }, body });
    expect(result.statusCode).toBe(404);
  });

  it("should return 500 on error", async () => {
    const { sut, updateService } = makeSut();
    (updateService.update as jest.Mock).mockRejectedValue(new Error("err"));
    const result = await sut.handle({ params: { id: "s-1" }, body });
    expect(result.statusCode).toBe(500);
  });
});
