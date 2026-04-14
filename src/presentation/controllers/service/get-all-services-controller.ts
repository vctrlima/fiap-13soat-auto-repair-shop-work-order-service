import { GetAllServices } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllServicesController implements Controller {
  constructor(private readonly getAllServices: GetAllServices) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query ?? {};
      const result = await this.getAllServices.getAll({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
        name: query.name,
      });
      return ok(result);
    } catch (error: any) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest;
type Response = HttpResponse<GetAllServices.Result>;
