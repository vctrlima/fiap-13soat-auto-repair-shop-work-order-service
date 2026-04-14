import { randomUUID } from 'node:crypto';

import { CancelWorkOrderRepository } from '@/application/protocols/db';
import { EventPublisher } from '@/application/protocols/messaging';
import { DomainEvent, WorkOrderEventData } from '@/domain/events';
import { CancelWorkOrder } from '@/domain/use-cases';

export class DbCancelWorkOrder implements CancelWorkOrder {
  constructor(
    private readonly cancelWorkOrderRepository: CancelWorkOrderRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async cancel(params: CancelWorkOrder.Params): Promise<CancelWorkOrder.Result> {
    const workOrder = await this.cancelWorkOrderRepository.cancel(params);
    const event: DomainEvent<WorkOrderEventData> = {
      eventType: 'WorkOrderCanceled',
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
