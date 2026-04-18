import { GetPartOrSupplyById } from "@/domain/use-cases";
import { GetPartOrSupplyByIdController } from "@/presentation/controllers/part-or-supply/get-part-or-supply-by-id-controller";
import { NotFoundError } from "@/presentation/errors";

const makeGetById = (): GetPartOrSupplyById => ({ getById: jest.fn() });
const makeSut = () => {
  const getPartOrSupplyById = makeGetById();
  const sut = new GetPartOrSupplyByIdController(getPartOrSupplyById);
  return { sut, getPartOrSupplyById };
};

describe("GetPartOrSupplyByIdController", () => {
  const mockResult = { id: "p-1", name: "Oil Filter", price: 25, inStock: 10 };

  it("should return 400 if no id", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {} } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 200 on success", async () => {
    const { sut, getPartOrSupplyById } = makeSut();
    (getPartOrSupplyById.getById as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({ params: { id: "p-1" } });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it("should return 404 if not found", async () => {
    const { sut, getPartOrSupplyById } = makeSut();
    (getPartOrSupplyById.getById as jest.Mock).mockRejectedValue(
      new NotFoundError("not found"),
    );
    const result = await sut.handle({ params: { id: "p-1" } });
    expect(result.statusCode).toBe(404);
  });

  it("should return 500 on error", async () => {
    const { sut, getPartOrSupplyById } = makeSut();
    (getPartOrSupplyById.getById as jest.Mock).mockRejectedValue(
      new Error("err"),
    );
    const result = await sut.handle({ params: { id: "p-1" } });
    expect(result.statusCode).toBe(500);
  });
});
