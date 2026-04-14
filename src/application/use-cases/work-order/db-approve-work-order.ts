import { randomUUID } from 'node:crypto';

import { ApproveWorkOrderRepository } from '@/application/protocols/db';
import { EventPublisher } from '@/application/protocols/messaging';
import { DomainEvent, WorkOrderEventData } from '@/domain/events';
import { ApproveWorkOrder } from '@/domain/use-cases';

export class DbApproveWorkOrder implements ApproveWorkOrder {
  constructor(
    private readonly approveWorkOrderRepository: ApproveWorkOrderRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async approve(params: ApproveWorkOrder.Params): Promise<ApproveWorkOrder.Result> {
    const workOrder = await this.approveWorkOrderRepository.approve(params);
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
      },
    };
    await this.eventPublisher.publish(event);
    return workOrder;
  }
}
