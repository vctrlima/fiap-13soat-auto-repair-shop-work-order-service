import { UpdateWorkOrder } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class UpdateWorkOrderController implements Controller {
  constructor(private readonly updateWorkOrder: UpdateWorkOrder) {}

  async handle(params: Request): Promise<Response> {
    try {
      const id = params.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      const body = params.body;
      if (!body) return badRequest(new MissingParamError('body'));
      const workOrder = await this.updateWorkOrder.update({ ...body, id });
      return ok(workOrder);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<Omit<UpdateWorkOrder.Params, 'id'>>;
type Response = HttpResponse<UpdateWorkOrder.Result>;
