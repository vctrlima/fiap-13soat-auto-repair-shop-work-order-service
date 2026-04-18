import { UpdateWorkOrder } from "@/domain/use-cases";
import { UpdateWorkOrderController } from "@/presentation/controllers/work-order/update-work-order-controller";
import { NotFoundError } from "@/presentation/errors";

const makeUpdate = (): UpdateWorkOrder => ({ update: jest.fn() });
const makeSut = () => {
  const updateWorkOrder = makeUpdate();
  const sut = new UpdateWorkOrderController(updateWorkOrder);
  return { sut, updateWorkOrder };
};

describe("UpdateWorkOrderController", () => {
  const body = { status: "APPROVED", serviceIds: ["s-1"] };
  const mockResult = { id: "wo-1", ...body };

  it("should return 400 if no id", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: {}, body } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 400 if no body", async () => {
    const { sut } = makeSut();
    const result = await sut.handle({ params: { id: "wo-1" } } as any);
    expect(result.statusCode).toBe(400);
  });

  it("should return 200 on success", async () => {
    const { sut, updateWorkOrder } = makeSut();
    (updateWorkOrder.update as jest.Mock).mockResolvedValue(mockResult);
    const result = await sut.handle({
      params: { id: "wo-1" },
      body: body as any,
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockResult);
  });

  it("should return 404 if not found", async () => {
    const { sut, updateWorkOrder } = makeSut();
    (updateWorkOrder.update as jest.Mock).mockRejectedValue(
      new NotFoundError("not found"),
    );
    const result = await sut.handle({
      params: { id: "wo-1" },
      body: body as any,
    });
    expect(result.statusCode).toBe(404);
  });

  it("should return 500 on error", async () => {
    const { sut, updateWorkOrder } = makeSut();
    (updateWorkOrder.update as jest.Mock).mockRejectedValue(new Error("err"));
    const result = await sut.handle({
      params: { id: "wo-1" },
      body: body as any,
    });
    expect(result.statusCode).toBe(500);
  });
});
