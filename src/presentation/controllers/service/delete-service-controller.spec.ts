import { DeleteService } from "@/domain/use-cases";
import { DeleteServiceController } from "@/presentation/controllers/service/delete-service-controller";
import { NotFoundError } from "@/presentation/errors";

const makeDelete = (): DeleteService => ({ delete: jest.fn() });
const makeSut = () => {
  const deleteService = makeDelete();
  const sut = new DeleteServiceController(deleteService);
  return { sut, deleteService };
};

describe("DeleteServiceController", () => {
  it("should return 400 if no id", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {} } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 204 on success", async () => {
    const { sut, deleteService } = makeSut();
    (deleteService.delete as jest.Mock).mockResolvedValue(undefined);
    const result = await sut.handle({ params: { id: "s-1" } });
    expect(result.statusCode).toBe(204);
  });

  it("should return 404 if not found", async () => {
    const { sut, deleteService } = makeSut();
    (deleteService.delete as jest.Mock).mockRejectedValue(
      new NotFoundError("not found"),
    );
    const result = await sut.handle({ params: { id: "s-1" } });
    expect(result.statusCode).toBe(404);
  });

  it("should return 500 on error", async () => {
    const { sut, deleteService } = makeSut();
    (deleteService.delete as jest.Mock).mockRejectedValue(new Error("err"));
    const result = await sut.handle({ params: { id: "s-1" } });
    expect(result.statusCode).toBe(500);
  });
});
