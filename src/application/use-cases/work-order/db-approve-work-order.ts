import { randomUUID } from 'node:crypto';

import { ApproveWorkOrderRepository } from '@/application/protocols/db';
import { EventPublisher } from '@/application/protocols/messaging';
import { DomainEvent, WorkOrderEventData } from '@/domain/events';
import { ApproveWorkOrder, StartSaga } from '@/domain/use-cases';

export interface CustomerEmailProvider {
  getCustomerEmailById(customerId: string): Promise<string | undefined>;
}

export class DbApproveWorkOrder implements ApproveWorkOrder {
  constructor(
    private readonly approveWorkOrderRepository: ApproveWorkOrderRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly startSaga: StartSaga,
    private readonly customerEmailProvider?: CustomerEmailProvider,
  ) {}

  async approve(params: ApproveWorkOrder.Params): Promise<ApproveWorkOrder.Result> {
    const workOrder = await this.approveWorkOrderRepository.approve(params);
    await this.startSaga.start({ workOrderId: workOrder.id });

    const customerEmail = this.customerEmailProvider
      ? await this.customerEmailProvider.getCustomerEmailById(workOrder.customerId)
      : undefined;

    const event: DomainEvent<WorkOrderEventData> = {
      eventType: 'WorkOrderApproved',
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
      version: '1.0',
      source: 'work-order-service',
      data: {
        workOrderId: workOrder.id,
        customerId: workOrder.customerId,
        vehicleId: workOrder.vehicleId,
        budget: workOrder.budget,
        status: workOrder.status,
        customerEmail,
        services: workOrder.services.map((s) => ({
          id: s.serviceId,
          name: s.service?.name ?? '',
          price: s.service?.price ?? 0,
          quantity: s.quantity,
        })),
        parts: workOrder.partsAndSupplies.map((p) => ({
          id: p.partOrSupplyId,
          name: p.partOrSupply?.name ?? '',
          price: p.partOrSupply?.price ?? 0,
          quantity: p.quantity,
        })),
      },
    };
    await this.eventPublisher.publish(event);
    return workOrder;
  }
}
