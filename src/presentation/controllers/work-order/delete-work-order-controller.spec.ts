import { DeleteWorkOrderController } from "@/presentation/controllers/work-order/delete-work-order-controller";
import { NotFoundError } from "@/presentation/errors";

const makeUseCase = () => ({ delete: jest.fn() });
const makeSut = () => {
  const useCase = makeUseCase();
  const sut = new DeleteWorkOrderController(useCase as any);
  return { sut, useCase };
};

describe("DeleteWorkOrderController", () => {
  it("should return 400 if no id", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {} } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 204 on success", async () => {
    const { sut, useCase } = makeSut();
    useCase.delete.mockResolvedValue(undefined);
    const result = await sut.handle({ params: { id: "wo-1" } } as any);
    expect(result.statusCode).toBe(204);
  });

  it("should return 404 if not found", async () => {
    const { sut, useCase } = makeSut();
    useCase.delete.mockRejectedValue(new NotFoundError("not found"));
    const result = await sut.handle({ params: { id: "wo-1" } } as any);
    expect(result.statusCode).toBe(404);
  });

  it("should return 500 on error", async () => {
    const { sut, useCase } = makeSut();
    useCase.delete.mockRejectedValue(new Error("err"));
    const result = await sut.handle({ params: { id: "wo-1" } } as any);
    expect(result.statusCode).toBe(500);
  });
});
