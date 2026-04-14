import { DeleteService } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, noContent, notFound, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class DeleteServiceController implements Controller {
  constructor(private readonly deleteService: DeleteService) {}

  async handle(params: Request): Promise<Response> {
    try {
      const id = params.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      await this.deleteService.delete({ id });
      return noContent();
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest;
type Response = HttpResponse;
