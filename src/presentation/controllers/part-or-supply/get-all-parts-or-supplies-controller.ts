import { GetAllPartsOrSupplies } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllPartsOrSuppliesController implements Controller {
  constructor(private readonly getAllPartsOrSupplies: GetAllPartsOrSupplies) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query ?? {};
      const result = await this.getAllPartsOrSupplies.getAll({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
        name: query.name,
        inStock: query.inStock != null ? query.inStock === 'true' : undefined,
      });
      return ok(result);
    } catch (error: any) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest;
type Response = HttpResponse<GetAllPartsOrSupplies.Result>;
