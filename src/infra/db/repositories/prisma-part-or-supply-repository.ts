import { PrismaClient, Prisma } from '@prisma/client';
import {
  CreatePartOrSupplyRepository,
  GetPartOrSupplyByIdRepository,
  GetAllPartsOrSuppliesRepository,
  UpdatePartOrSupplyRepository,
  DeletePartOrSupplyRepository,
} from '@/application/protocols/db';
import { NotFoundError } from '@/presentation/errors';
import { PartOrSupplyMapper } from '@/infra/db/mappers';

export class PrismaPartOrSupplyRepository
  implements
    CreatePartOrSupplyRepository,
    GetPartOrSupplyByIdRepository,
    GetAllPartsOrSuppliesRepository,
    UpdatePartOrSupplyRepository,
    DeletePartOrSupplyRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(params: CreatePartOrSupplyRepository.Params): Promise<CreatePartOrSupplyRepository.Result> {
    const data = await this.prisma.partOrSupply.create({ data: params });
    return PartOrSupplyMapper.toDomain(data);
  }

  async getById(params: GetPartOrSupplyByIdRepository.Params): Promise<GetPartOrSupplyByIdRepository.Result> {
    const data = await this.prisma.partOrSupply.findUnique({ where: { id: params.id } });
    if (!data) throw new NotFoundError(`PartOrSupply with id ${params.id} not found`);
    return PartOrSupplyMapper.toDomain(data);
  }

  async getAll(params: GetAllPartsOrSuppliesRepository.Params): Promise<GetAllPartsOrSuppliesRepository.Result> {
    const where: Prisma.PartOrSupplyWhereInput = {};
    if (params.name) where.name = { contains: params.name, mode: 'insensitive' };
    if (params.inStock != null) where.inStock = params.inStock ? { gt: 0 } : { equals: 0 };

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      this.prisma.partOrSupply.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.orderBy ? { [params.orderBy]: params.orderDirection ?? 'asc' } : { createdAt: 'desc' },
      }),
      this.prisma.partOrSupply.count({ where }),
    ]);

    return {
      content: content.map(PartOrSupplyMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(params: UpdatePartOrSupplyRepository.Params): Promise<UpdatePartOrSupplyRepository.Result> {
    const existing = await this.prisma.partOrSupply.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError(`PartOrSupply with id ${params.id} not found`);
    const { id, ...updateData } = params;
    const data = await this.prisma.partOrSupply.update({ where: { id }, data: updateData });
    return PartOrSupplyMapper.toDomain(data);
  }

  async delete(params: DeletePartOrSupplyRepository.Params): Promise<void> {
    const existing = await this.prisma.partOrSupply.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError(`PartOrSupply with id ${params.id} not found`);
    await this.prisma.partOrSupply.delete({ where: { id: params.id } });
  }
}
