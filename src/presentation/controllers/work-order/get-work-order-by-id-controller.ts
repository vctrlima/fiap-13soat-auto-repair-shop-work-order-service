import { GetWorkOrderById } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetWorkOrderByIdController implements Controller {
  constructor(private readonly getWorkOrderById: GetWorkOrderById) {}

  async handle(params: Request): Promise<Response> {
    try {
      const id = params.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      const workOrder = await this.getWorkOrderById.getById({ id });
      return ok(workOrder);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest;
type Response = HttpResponse<GetWorkOrderById.Result>;
