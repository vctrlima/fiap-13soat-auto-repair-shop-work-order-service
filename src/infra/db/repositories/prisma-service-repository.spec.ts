import { PrismaServiceRepository } from "@/infra/db/repositories/prisma-service-repository";
import { NotFoundError } from "@/presentation/errors";

const makePrisma = () => ({
  service: {
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
  const sut = new PrismaServiceRepository(prisma as any);
  return { sut, prisma };
};

const mockData = {
  id: "s-1",
  name: "Brake Service",
  description: "Desc",
  price: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrismaServiceRepository", () => {
  describe("create", () => {
    it("should create and return mapped result", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.create.mockResolvedValue(mockData);
      const result = await sut.create({
        name: "Brake Service",
        price: 100,
      } as any);
      expect(result.id).toBe("s-1");
    });
  });

  describe("getById", () => {
    it("should return mapped result", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findUnique.mockResolvedValue(mockData);
      const result = await sut.getById({ id: "s-1" });
      expect(result.id).toBe("s-1");
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findUnique.mockResolvedValue(null);
      await expect(sut.getById({ id: "s-1" })).rejects.toThrow(NotFoundError);
    });
  });

  describe("getAll", () => {
    it("should return paginated result", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findMany.mockResolvedValue([mockData]);
      prisma.service.count.mockResolvedValue(1);
      const result = await sut.getAll({ page: 1, limit: 20 } as any);
      expect(result.content).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should apply name filter", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findMany.mockResolvedValue([]);
      prisma.service.count.mockResolvedValue(0);
      await sut.getAll({ page: 1, limit: 20, name: "Brake" } as any);
      expect(prisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: "Brake", mode: "insensitive" },
          }),
        }),
      );
    });

    it("should apply custom orderBy", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findMany.mockResolvedValue([]);
      prisma.service.count.mockResolvedValue(0);
      await sut.getAll({
        page: 1,
        limit: 20,
        orderBy: "price",
        orderDirection: "asc",
      } as any);
      expect(prisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { price: "asc" } }),
      );
    });
  });

  describe("update", () => {
    it("should update and return mapped result", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findUnique.mockResolvedValue(mockData);
      prisma.service.update.mockResolvedValue({ ...mockData, name: "Updated" });
      const result = await sut.update({ id: "s-1", name: "Updated" } as any);
      expect(result.name).toBe("Updated");
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findUnique.mockResolvedValue(null);
      await expect(
        sut.update({ id: "s-1", name: "Updated" } as any),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete successfully", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findUnique.mockResolvedValue(mockData);
      prisma.service.delete.mockResolvedValue(undefined);
      await sut.delete({ id: "s-1" });
      expect(prisma.service.delete).toHaveBeenCalledWith({
        where: { id: "s-1" },
      });
    });

    it("should throw NotFoundError if not found", async () => {
      const { sut, prisma } = makeSut();
      prisma.service.findUnique.mockResolvedValue(null);
      await expect(sut.delete({ id: "s-1" })).rejects.toThrow(NotFoundError);
    });
  });
});
