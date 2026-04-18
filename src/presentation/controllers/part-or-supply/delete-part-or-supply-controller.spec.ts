import { DeletePartOrSupplyController } from "@/presentation/controllers/part-or-supply/delete-part-or-supply-controller";
import { DeletePartOrSupply } from "@/domain/use-cases";
import { NotFoundError } from "@/presentation/errors";

const makeDelete = (): DeletePartOrSupply => ({ delete: jest.fn() });
const makeSut = () => {
  const deletePartOrSupply = makeDelete();
  const sut = new DeletePartOrSupplyController(deletePartOrSupply);
  return { sut, deletePartOrSupply };
};

describe("DeletePartOrSupplyController", () => {
  it("should return 400 if no id", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {} } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 204 on success", async () => {
    const { sut, deletePartOrSupply } = makeSut();
    (deletePartOrSupply.delete as jest.Mock).mockResolvedValue(undefined);
    const result = await sut.handle({ params: { id: "p-1" } });
    expect(result.statusCode).toBe(204);
  });

  it("should return 404 if not found", async () => {
    const { sut, deletePartOrSupply } = makeSut();
    (deletePartOrSupply.delete as jest.Mock).mockRejectedValue(
      new NotFoundError("not found"),
    );
    const result = await sut.handle({ params: { id: "p-1" } });
    expect(result.statusCode).toBe(404);
  });

  it("should return 500 on error", async () => {
    const { sut, deletePartOrSupply } = makeSut();
    (deletePartOrSupply.delete as jest.Mock).mockRejectedValue(
      new Error("err"),
    );
    const result = await sut.handle({ params: { id: "p-1" } });
    expect(result.statusCode).toBe(500);
  });
});
