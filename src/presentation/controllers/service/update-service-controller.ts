import { UpdateService } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class UpdateServiceController implements Controller {
  constructor(private readonly updateService: UpdateService) {}

  async handle(params: Request): Promise<Response> {
    try {
      const id = params.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      const body = params.body;
      if (!body) return badRequest(new MissingParamError('body'));
      const service = await this.updateService.update({ ...body, id });
      return ok(service);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<Omit<UpdateService.Params, 'id'>>;
type Response = HttpResponse<UpdateService.Result>;
