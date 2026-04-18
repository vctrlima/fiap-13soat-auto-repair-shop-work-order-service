import { UpdatePartOrSupply } from "@/domain/use-cases";
import { UpdatePartOrSupplyController } from "@/presentation/controllers/part-or-supply/update-part-or-supply-controller";
import { NotFoundError } from "@/presentation/errors";

const makeUpdate = (): UpdatePartOrSupply => ({ update: jest.fn() });
const makeSut = () => {
  const updatePartOrSupply = makeUpdate();
  const sut = new UpdatePartOrSupplyController(updatePartOrSupply);
  return { sut, updatePartOrSupply };
};

describe("UpdatePartOrSupplyController", () => {
  const body = { name: "Oil Filter", price: 30 };
  const mockResult = { id: "p-1", ...body, inStock: 10 };

  it("should return 400 if no id", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {}, body } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 400 if no body", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: { id: "p-1" } } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 200 on success", async () => {
    const { sut, updatePartOrSupply } = makeSut();
    (updatePartOrSupply.update as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ params: { id: "p-1" }, body });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it("should return 404 if not found", async () => {
    const { sut, updatePartOrSupply } = makeSut();
    (updatePartOrSupply.update as jest.Mock).mockRejectedValue(
      new NotFoundError("not found"),
    );
    const result = await sut.handle({ params: { id: "p-1" }, body });
    expect(result.statusCode).toBe(404);
  });

  it("should return 500 on error", async () => {
    const { sut, updatePartOrSupply } = makeSut();
    (updatePartOrSupply.update as jest.Mock).mockRejectedValue(
      new Error("err"),
    );
    const result = await sut.handle({ params: { id: "p-1" }, body });
    expect(result.statusCode).toBe(500);
  });
});
