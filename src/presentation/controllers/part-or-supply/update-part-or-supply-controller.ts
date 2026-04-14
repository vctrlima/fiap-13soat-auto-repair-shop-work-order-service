import { UpdatePartOrSupply } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class UpdatePartOrSupplyController implements Controller {
  constructor(private readonly updatePartOrSupply: UpdatePartOrSupply) {}

  async handle(params: Request): Promise<Response> {
    try {
      const id = params.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      const body = params.body;
      if (!body) return badRequest(new MissingParamError('body'));
      const partOrSupply = await this.updatePartOrSupply.update({ ...body, id });
      return ok(partOrSupply);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<Omit<UpdatePartOrSupply.Params, 'id'>>;
type Response = HttpResponse<UpdatePartOrSupply.Result>;
