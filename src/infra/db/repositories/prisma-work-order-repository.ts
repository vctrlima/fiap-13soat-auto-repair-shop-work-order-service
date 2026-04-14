import { PrismaClient, Prisma } from '@prisma/client';
import {
  CreateWorkOrderRepository,
  GetWorkOrderByIdRepository,
  GetAllWorkOrdersRepository,
  UpdateWorkOrderRepository,
  ApproveWorkOrderRepository,
  CancelWorkOrderRepository,
  DeleteWorkOrderRepository,
} from '@/application/protocols/db';
import { NotFoundError } from '@/presentation/errors';
import { Status } from '@/domain/enums';
import { WorkOrderMapper } from '@/infra/db/mappers';

const workOrderInclude = {
  services: { include: { service: true } },
  partsAndSupplies: { include: { partOrSupply: true } },
} satisfies Prisma.WorkOrderInclude;

export class PrismaWorkOrderRepository
  implements
    CreateWorkOrderRepository,
    GetWorkOrderByIdRepository,
    GetAllWorkOrdersRepository,
    UpdateWorkOrderRepository,
    ApproveWorkOrderRepository,
    CancelWorkOrderRepository,
    DeleteWorkOrderRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(params: CreateWorkOrderRepository.Params): Promise<CreateWorkOrderRepository.Result> {
    const data = await this.prisma.workOrder.create({
      data: {
        customerId: params.customerId,
        vehicleId: params.vehicleId,
        status: (params.status as string as any) ?? 'RECEIVED',
        services: {
          create: params.serviceIds.map((serviceId) => ({
            serviceId,
          })),
        },
        partsAndSupplies: params.partAndSupplyIds
          ? {
              create: params.partAndSupplyIds.map((partOrSupplyId) => ({
                partOrSupplyId,
              })),
            }
          : undefined,
      },
      include: workOrderInclude,
    });
    const workOrder = WorkOrderMapper.toDomain(data);
    const budget = this.calculateBudget(workOrder);
    if (budget > 0) {
      const updated = await this.prisma.workOrder.update({
        where: { id: data.id },
        data: { budget },
        include: workOrderInclude,
      });
      return WorkOrderMapper.toDomain(updated);
    }
    return workOrder;
  }

  async getById(params: GetWorkOrderByIdRepository.Params): Promise<GetWorkOrderByIdRepository.Result> {
    const data = await this.prisma.workOrder.findUnique({
      where: { id: params.id },
      include: workOrderInclude,
    });
    if (!data) throw new NotFoundError(`WorkOrder with id ${params.id} not found`);
    return WorkOrderMapper.toDomain(data);
  }

  async getAll(params: GetAllWorkOrdersRepository.Params): Promise<GetAllWorkOrdersRepository.Result> {
    const where: Prisma.WorkOrderWhereInput = {};
    if (params.customerId) where.customerId = params.customerId;
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.status) where.status = params.status as string as any;
    if (params.minBudget != null || params.maxBudget != null) {
      where.budget = {};
      if (params.minBudget != null) where.budget.gte = params.minBudget;
      if (params.maxBudget != null) where.budget.lte = params.maxBudget;
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        include: workOrderInclude,
        skip,
        take: limit,
        orderBy: params.orderBy ? { [params.orderBy]: params.orderDirection ?? 'asc' } : { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      content: content.map(WorkOrderMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(params: UpdateWorkOrderRepository.Params): Promise<UpdateWorkOrderRepository.Result> {
    const existing = await this.prisma.workOrder.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError(`WorkOrder with id ${params.id} not found`);

    const updateData: Prisma.WorkOrderUpdateInput = {};
    if (params.status) updateData.status = params.status as string as any;

    if (params.serviceIds) {
      updateData.services = {
        deleteMany: {},
        create: params.serviceIds.map((serviceId) => ({ serviceId })),
      };
    }
    if (params.partAndSupplyIds) {
      updateData.partsAndSupplies = {
        deleteMany: {},
        create: params.partAndSupplyIds.map((partOrSupplyId) => ({ partOrSupplyId })),
      };
    }

    const data = await this.prisma.workOrder.update({
      where: { id: params.id },
      data: updateData,
      include: workOrderInclude,
    });
    const workOrder = WorkOrderMapper.toDomain(data);
    const budget = this.calculateBudget(workOrder);
    if (budget !== data.budget) {
      const updated = await this.prisma.workOrder.update({
        where: { id: data.id },
        data: { budget },
        include: workOrderInclude,
      });
      return WorkOrderMapper.toDomain(updated);
    }
    return workOrder;
  }

  async approve(params: ApproveWorkOrderRepository.Params): Promise<ApproveWorkOrderRepository.Result> {
    const existing = await this.prisma.workOrder.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError(`WorkOrder with id ${params.id} not found`);
    const data = await this.prisma.workOrder.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
      include: workOrderInclude,
    });
    return WorkOrderMapper.toDomain(data);
  }

  async cancel(params: CancelWorkOrderRepository.Params): Promise<CancelWorkOrderRepository.Result> {
    const existing = await this.prisma.workOrder.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError(`WorkOrder with id ${params.id} not found`);
    const data = await this.prisma.workOrder.update({
      where: { id: params.id },
      data: { status: 'CANCELED' },
      include: workOrderInclude,
    });
    return WorkOrderMapper.toDomain(data);
  }

  async delete(params: DeleteWorkOrderRepository.Params): Promise<void> {
    const existing = await this.prisma.workOrder.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError(`WorkOrder with id ${params.id} not found`);
    await this.prisma.workOrder.delete({ where: { id: params.id } });
  }

  private calculateBudget(workOrder: { services: Array<{ service?: { price: number } | null; quantity: number }>; partsAndSupplies: Array<{ partOrSupply?: { price: number } | null; quantity: number }> }): number {
    const serviceTotal = workOrder.services.reduce((acc, s) => acc + (s.service?.price ?? 0) * s.quantity, 0);
    const partTotal = workOrder.partsAndSupplies.reduce((acc, p) => acc + (p.partOrSupply?.price ?? 0) * p.quantity, 0);
    return serviceTotal + partTotal;
  }
}
