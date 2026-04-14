import { GetAllWorkOrders } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllWorkOrdersController implements Controller {
  constructor(private readonly getAllWorkOrders: GetAllWorkOrders) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query ?? {};
      const result = await this.getAllWorkOrders.getAll({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
        customerId: query.customerId,
        vehicleId: query.vehicleId,
        status: query.status,
        minBudget: query.minBudget ? Number(query.minBudget) : undefined,
        maxBudget: query.maxBudget ? Number(query.maxBudget) : undefined,
      });
      return ok(result);
    } catch (error: any) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest;
type Response = HttpResponse<GetAllWorkOrders.Result>;
