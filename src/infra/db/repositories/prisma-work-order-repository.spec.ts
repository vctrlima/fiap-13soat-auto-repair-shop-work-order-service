import { PrismaWorkOrderRepository } from "@/infra/db/repositories/prisma-work-order-repository";
import { NotFoundError } from "@/presentation/errors";

const now = new Date();
const mockWorkOrderData = {
  id: "wo-1",
  customerId: "c-1",
  vehicleId: "v-1",
  status: "RECEIVED",
  budget: 150,
  createdAt: now,
  updatedAt: now,
  services: [
    {
      id: "wos-1",
      workOrderId: "wo-1",
      serviceId: "s-1",
      quantity: 1,
      service: {
        id: "s-1",
        name: "Brake",
        description: "D",
        price: 100,
        createdAt: now,
        updatedAt: now,
      },
    },
  ],
  partsAndSupplies: [
    {
      id: "wop-1",
      workOrderId: "wo-1",
      partOrSupplyId: "p-1",
      quantity: 2,
      partOrSupply: {
        id: "p-1",
        name: "Oil",
        description: "D",
        price: 25,
        inStock: 5,
        createdAt: now,
        updatedAt: now,
      },
    },
  ],
};

const makePrisma = () => ({
  workOrder: {
    create: jest.fn().mockResolvedValue(mockWorkOrderData),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

const makeSut = () => {
  const prisma = makePrisma();
  const sut = new PrismaWorkOrderRepository(prisma as any);
  return { sut, prisma };
};

describe("PrismaWorkOrderRepository", () => {
  describe("create", () => {
    it("should create work order with services", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.create.mockResolvedValue(mockWorkOrderData);
      prisma.workOrder.update.mockResolvedValue(mockWorkOrderData);
      const result = await sut.create({
        customerId: "c-1",
        vehicleId: "v-1",
        serviceIds: ["s-1"],
      } as any);
      expect(result.id).toBe("wo-1");
      expect(prisma.workOrder.create).toHaveBeenCalled();
    });

    it("should return without update when budget is zero", async () => {
      const { sut, prisma } = makeSut();
      const dataWithNoServices = {
        ...mockWorkOrderData,
        services: [],
        partsAndSupplies: [],
      };
      prisma.workOrder.create.mockResolvedValue(dataWithNoServices);
      const result = await sut.create({
        customerId: "c-1",
        vehicleId: "v-1",
        serviceIds: [],
      } as any);
      expect(prisma.workOrder.update).not.toHaveBeenCalled();
      expect(result.id).toBe("wo-1");
    });

    it("should handle partAndSupplyIds", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.create.mockResolvedValue(mockWorkOrderData);
      prisma.workOrder.update.mockResolvedValue(mockWorkOrderData);
      await sut.create({
        customerId: "c-1",
        vehicleId: "v-1",
        serviceIds: ["s-1"],
        partAndSupplyIds: ["p-1"],
      } as any);
      expect(prisma.workOrder.create).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return mapped result", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(mockWorkOrderData);
      const result = await sut.getById({ id: "wo-1" });
      expect(result.id).toBe("wo-1");
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(null);
      await expect(sut.getById({ id: "wo-1" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("getAll", () => {
    it("should return paginated result", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findMany.mockResolvedValue([mockWorkOrderData]);
      prisma.workOrder.count.mockResolvedValue(1);
      const result = await sut.getAll({ page: 1, limit: 20 } as any);
      expect(result.content).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should apply filters", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);
      await sut.getAll({
        page: 1,
        limit: 20,
        customerId: "c-1",
        vehicleId: "v-1",
        status: "RECEIVED",
        minBudget: 100,
        maxBudget: 500,
      } as any);
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: "c-1",
            vehicleId: "v-1",
            budget: { gte: 100, lte: 500 },
          }),
        }),
      );
    });

    it("should apply only minBudget", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);
      await sut.getAll({ page: 1, limit: 20, minBudget: 100 } as any);
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ budget: { gte: 100 } }),
        }),
      );
    });

    it("should apply custom orderBy", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);
      await sut.getAll({
        page: 1,
        limit: 20,
        orderBy: "budget",
        orderDirection: "desc",
      } as any);
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { budget: "desc" } }),
      );
    });
  });

  describe("update", () => {
    it("should update and return result", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(mockWorkOrderData);
      prisma.workOrder.update.mockResolvedValue(mockWorkOrderData);
      const result = await sut.update({
        id: "wo-1",
        status: "IN_DIAGNOSIS",
      } as any);
      expect(result.id).toBe("wo-1");
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(null);
      await expect(sut.update({ id: "wo-1" } as any)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should handle serviceIds update", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(mockWorkOrderData);
      prisma.workOrder.update.mockResolvedValue(mockWorkOrderData);
      await sut.update({ id: "wo-1", serviceIds: ["s-2"] } as any);
      expect(prisma.workOrder.update).toHaveBeenCalled();
    });

    it("should handle partAndSupplyIds update", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(mockWorkOrderData);
      prisma.workOrder.update.mockResolvedValue(mockWorkOrderData);
      await sut.update({ id: "wo-1", partAndSupplyIds: ["p-2"] } as any);
      expect(prisma.workOrder.update).toHaveBeenCalled();
    });

    it("should recalculate budget if changed", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(mockWorkOrderData);
      const changedBudget = { ...mockWorkOrderData, budget: 0 };
      prisma.workOrder.update
        .mockResolvedValueOnce(changedBudget)
        .mockResolvedValueOnce(mockWorkOrderData);
      await sut.update({ id: "wo-1", serviceIds: ["s-1"] } as any);
      expect(prisma.workOrder.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("approve", () => {
    it("should approve work order", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(mockWorkOrderData);
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrderData,
        status: "APPROVED",
      });
      const result = await sut.approve({ id: "wo-1" });
      expect(result.id).toBe("wo-1");
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(null);
      await expect(sut.approve({ id: "wo-1" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("cancel", () => {
    it("should cancel work order", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(mockWorkOrderData);
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrderData,
        status: "CANCELED",
      });
      const result = await sut.cancel({ id: "wo-1" });
      expect(result.id).toBe("wo-1");
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(null);
      await expect(sut.cancel({ id: "wo-1" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete work order", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(mockWorkOrderData);
      prisma.workOrder.delete.mockResolvedValue(undefined);
      await sut.delete({ id: "wo-1" });
      expect(prisma.workOrder.delete).toHaveBeenCalledWith({
        where: { id: "wo-1" },
      });
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.workOrder.findUnique.mockResolvedValue(null);
      await expect(sut.delete({ id: "wo-1" })).rejects.toThrow(NotFoundError);
    });
  });
});
