import { WorkOrder, WorkOrderService, WorkOrderPartOrSupply } from '@/domain/entities';
import { Status } from '@/domain/enums';
import { WorkOrderRepositoryType } from '@/infra/db/types';

export class WorkOrderMapper {
  static toDomain(data: WorkOrderRepositoryType): WorkOrder {
    return {
      id: data.id,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      status: data.status as unknown as Status,
      budget: data.budget,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      services: data.services.map(
        (s): WorkOrderService => ({
          id: s.id,
          workOrderId: s.workOrderId,
          serviceId: s.serviceId,
          service: s.service
            ? {
                id: s.service.id,
                name: s.service.name,
                description: s.service.description,
                price: s.service.price,
                createdAt: s.service.createdAt,
                updatedAt: s.service.updatedAt,
              }
            : undefined,
          quantity: s.quantity,
        }),
      ),
      partsAndSupplies: data.partsAndSupplies.map(
        (p): WorkOrderPartOrSupply => ({
          id: p.id,
          workOrderId: p.workOrderId,
          partOrSupplyId: p.partOrSupplyId,
          partOrSupply: p.partOrSupply
            ? {
                id: p.partOrSupply.id,
                name: p.partOrSupply.name,
                description: p.partOrSupply.description,
                price: p.partOrSupply.price,
                inStock: p.partOrSupply.inStock,
                createdAt: p.partOrSupply.createdAt,
                updatedAt: p.partOrSupply.updatedAt,
              }
            : undefined,
          quantity: p.quantity,
        }),
      ),
    };
  }
}
