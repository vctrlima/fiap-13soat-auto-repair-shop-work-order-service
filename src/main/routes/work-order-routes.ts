import { buildRoute } from '@/main/adapters';
import {
  makeCreateWorkOrderController,
  makeGetWorkOrderByIdController,
  makeGetAllWorkOrdersController,
  makeUpdateWorkOrderController,
  makeApproveWorkOrderController,
  makeCancelWorkOrderController,
  makeDeleteWorkOrderController,
} from '@/main/factories/controllers';
import {
  workOrderResponseSchema,
  paginatedResponseSchema,
  errorResponseSchema,
} from '@/main/docs/schemas';
import { FastifyInstance } from 'fastify';

export async function workOrderRoutes(fastify: FastifyInstance) {
  fastify.post('', {
    schema: {
      tags: ['work-order'],
      summary: 'Create a work order',
      body: {
        type: 'object',
        required: ['customerId', 'vehicleId', 'serviceIds'],
        properties: {
          customerId: { type: 'string', format: 'uuid' },
          vehicleId: { type: 'string', format: 'uuid' },
          serviceIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          partAndSupplyIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
        },
      },
      response: {
        201: workOrderResponseSchema,
        400: errorResponseSchema,
      },
    },
    handler: buildRoute(makeCreateWorkOrderController()),
  });

  fastify.get('', {
    schema: {
      tags: ['work-order'],
      summary: 'List all work orders',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
          orderBy: { type: 'string' },
          orderDirection: { type: 'string', enum: ['asc', 'desc'] },
          customerId: { type: 'string', format: 'uuid' },
          vehicleId: { type: 'string', format: 'uuid' },
          status: { type: 'string' },
          minBudget: { type: 'number' },
          maxBudget: { type: 'number' },
        },
      },
      response: { 200: paginatedResponseSchema(workOrderResponseSchema) },
    },
    handler: buildRoute(makeGetAllWorkOrdersController()),
  });

  fastify.get('/:id', {
    schema: {
      tags: ['work-order'],
      summary: 'Get work order by ID',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      response: {
        200: workOrderResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeGetWorkOrderByIdController()),
  });

  fastify.put('/:id', {
    schema: {
      tags: ['work-order'],
      summary: 'Update a work order',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        properties: {
          serviceIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          partAndSupplyIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          status: { type: 'string' },
        },
      },
      response: {
        200: workOrderResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeUpdateWorkOrderController()),
  });

  fastify.patch('/:id/approve', {
    schema: {
      tags: ['work-order'],
      summary: 'Approve a work order (starts saga)',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      response: {
        200: workOrderResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeApproveWorkOrderController()),
  });

  fastify.patch('/:id/cancel', {
    schema: {
      tags: ['work-order'],
      summary: 'Cancel a work order',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      response: {
        200: workOrderResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeCancelWorkOrderController()),
  });

  fastify.delete('/:id', {
    schema: {
      tags: ['work-order'],
      summary: 'Delete a work order',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      response: {
        204: { type: 'null' },
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeDeleteWorkOrderController()),
  });
}
