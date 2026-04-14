import { CreatePartOrSupply } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class CreatePartOrSupplyController implements Controller {
  constructor(private readonly createPartOrSupply: CreatePartOrSupply) {}

  async handle(params: Request): Promise<Response> {
    try {
      const body = params.body;
      if (!body) return badRequest(new MissingParamError('body'));
      if (!body.name) return badRequest(new MissingParamError('name'));
      if (body.price == null) return badRequest(new MissingParamError('price'));
      if (body.inStock == null) return badRequest(new MissingParamError('inStock'));
      const partOrSupply = await this.createPartOrSupply.create(body);
      return created(partOrSupply);
    } catch (error: any) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<CreatePartOrSupply.Params>;
type Response = HttpResponse<CreatePartOrSupply.Result>;
