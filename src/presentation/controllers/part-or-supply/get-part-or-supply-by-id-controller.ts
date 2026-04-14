import { GetPartOrSupplyById } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetPartOrSupplyByIdController implements Controller {
  constructor(private readonly getPartOrSupplyById: GetPartOrSupplyById) {}

  async handle(params: Request): Promise<Response> {
    try {
      const id = params.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      const partOrSupply = await this.getPartOrSupplyById.getById({ id });
      return ok(partOrSupply);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest;
type Response = HttpResponse<GetPartOrSupplyById.Result>;
