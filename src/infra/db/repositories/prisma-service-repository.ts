import { PrismaClient, Prisma } from '@prisma/client';
import {
  CreateServiceRepository,
  GetServiceByIdRepository,
  GetAllServicesRepository,
  UpdateServiceRepository,
  DeleteServiceRepository,
} from '@/application/protocols/db';
import { NotFoundError } from '@/presentation/errors';
import { ServiceMapper } from '@/infra/db/mappers';

export class PrismaServiceRepository
  implements
    CreateServiceRepository,
    GetServiceByIdRepository,
    GetAllServicesRepository,
    UpdateServiceRepository,
    DeleteServiceRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(params: CreateServiceRepository.Params): Promise<CreateServiceRepository.Result> {
    const data = await this.prisma.service.create({ data: params });
    return ServiceMapper.toDomain(data);
  }

  async getById(params: GetServiceByIdRepository.Params): Promise<GetServiceByIdRepository.Result> {
    const data = await this.prisma.service.findUnique({ where: { id: params.id } });
    if (!data) throw new NotFoundError(`Service with id ${params.id} not found`);
    return ServiceMapper.toDomain(data);
  }

  async getAll(params: GetAllServicesRepository.Params): Promise<GetAllServicesRepository.Result> {
    const where: Prisma.ServiceWhereInput = {};
    if (params.name) where.name = { contains: params.name, mode: 'insensitive' };

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.orderBy ? { [params.orderBy]: params.orderDirection ?? 'asc' } : { createdAt: 'desc' },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      content: content.map(ServiceMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(params: UpdateServiceRepository.Params): Promise<UpdateServiceRepository.Result> {
    const existing = await this.prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError(`Service with id ${params.id} not found`);
    const { id, ...updateData } = params;
    const data = await this.prisma.service.update({ where: { id }, data: updateData });
    return ServiceMapper.toDomain(data);
  }

  async delete(params: DeleteServiceRepository.Params): Promise<void> {
    const existing = await this.prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError(`Service with id ${params.id} not found`);
    await this.prisma.service.delete({ where: { id: params.id } });
  }
}
