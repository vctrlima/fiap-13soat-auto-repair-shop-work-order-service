import { PrismaPartOrSupplyRepository } from "@/infra/db/repositories/prisma-part-or-supply-repository";
import { NotFoundError } from "@/presentation/errors";

const makePrisma = () => ({
  partOrSupply: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

const makeSut = () => {
  const prisma = makePrisma();
  const sut = new PrismaPartOrSupplyRepository(prisma as any);
  return { sut, prisma };
};

const mockData = {
  id: "p-1",
  name: "Oil Filter",
  description: "Desc",
  price: 25,
  inStock: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrismaPartOrSupplyRepository", () => {
  describe("create", () => {
    it("should create and return mapped result", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.create.mockResolvedValue(mockData);
      const result = await sut.create({
        name: "Oil Filter",
        price: 25,
        inStock: 10,
      } as any);
      expect(result.id).toBe("p-1");
      expect(prisma.partOrSupply.create).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return mapped result", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findUnique.mockResolvedValue(mockData);
      const result = await sut.getById({ id: "p-1" });
      expect(result.id).toBe("p-1");
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findUnique.mockResolvedValue(null);
      await expect(sut.getById({ id: "p-1" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("getAll", () => {
    it("should return paginated result", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findMany.mockResolvedValue([mockData]);
      prisma.partOrSupply.count.mockResolvedValue(1);
      const result = await sut.getAll({ page: 1, limit: 20 } as any);
      expect(result.content).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should apply name filter", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findMany.mockResolvedValue([]);
      prisma.partOrSupply.count.mockResolvedValue(0);
      await sut.getAll({ page: 1, limit: 20, name: "Oil" } as any);
      expect(prisma.partOrSupply.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: "Oil", mode: "insensitive" },
          }),
        }),
      );
    });

    it("should apply inStock true filter", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findMany.mockResolvedValue([]);
      prisma.partOrSupply.count.mockResolvedValue(0);
      await sut.getAll({ page: 1, limit: 20, inStock: true } as any);
      expect(prisma.partOrSupply.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ inStock: { gt: 0 } }),
        }),
      );
    });

    it("should apply inStock false filter", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findMany.mockResolvedValue([]);
      prisma.partOrSupply.count.mockResolvedValue(0);
      await sut.getAll({ page: 1, limit: 20, inStock: false } as any);
      expect(prisma.partOrSupply.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ inStock: { equals: 0 } }),
        }),
      );
    });

    it("should apply custom orderBy", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findMany.mockResolvedValue([]);
      prisma.partOrSupply.count.mockResolvedValue(0);
      await sut.getAll({
        page: 1,
        limit: 20,
        orderBy: "name",
        orderDirection: "desc",
      } as any);
      expect(prisma.partOrSupply.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: "desc" } }),
      );
    });
  });

  describe("update", () => {
    it("should update and return mapped result", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findUnique.mockResolvedValue(mockData);
      prisma.partOrSupply.update.mockResolvedValue({
        ...mockData,
        name: "Updated",
      });
      const result = await sut.update({ id: "p-1", name: "Updated" } as any);
      expect(result.name).toBe("Updated");
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findUnique.mockResolvedValue(null);
      await expect(
        sut.update({ id: "p-1", name: "Updated" } as any),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete successfully", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findUnique.mockResolvedValue(mockData);
      prisma.partOrSupply.delete.mockResolvedValue(undefined);
      await sut.delete({ id: "p-1" });
      expect(prisma.partOrSupply.delete).toHaveBeenCalledWith({
        where: { id: "p-1" },
      });
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.partOrSupply.findUnique.mockResolvedValue(null);
      await expect(sut.delete({ id: "p-1" })).rejects.toThrow(NotFoundError);
    });
  });
});
