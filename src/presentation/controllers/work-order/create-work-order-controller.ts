import { CreateWorkOrder } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class CreateWorkOrderController implements Controller {
  constructor(private readonly createWorkOrder: CreateWorkOrder) {}

  async handle(params: Request): Promise<Response> {
    try {
      const body = params.body;
      if (!body) return badRequest(new MissingParamError('body'));
      if (!body.customerId) return badRequest(new MissingParamError('customerId'));
      if (!body.vehicleId) return badRequest(new MissingParamError('vehicleId'));
      if (!body.serviceIds?.length) return badRequest(new MissingParamError('serviceIds'));
      const workOrder = await this.createWorkOrder.create(body);
      return created(workOrder);
    } catch (error: any) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<CreateWorkOrder.Params>;
type Response = HttpResponse<CreateWorkOrder.Result>;
