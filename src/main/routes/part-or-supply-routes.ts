import { buildRoute } from '@/main/adapters';
import {
  makeCreatePartOrSupplyController,
  makeGetPartOrSupplyByIdController,
  makeGetAllPartsOrSuppliesController,
  makeUpdatePartOrSupplyController,
  makeDeletePartOrSupplyController,
} from '@/main/factories/controllers';
import {
  partOrSupplyResponseSchema,
  paginatedResponseSchema,
  errorResponseSchema,
} from '@/main/docs/schemas';
import { FastifyInstance } from 'fastify';

export async function partOrSupplyRoutes(fastify: FastifyInstance) {
  fastify.post('', {
    schema: {
      tags: ['part-or-supply'],
      summary: 'Create a part/supply',
      body: {
        type: 'object',
        required: ['name', 'price', 'inStock'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          inStock: { type: 'integer' },
        },
      },
      response: {
        201: partOrSupplyResponseSchema,
        400: errorResponseSchema,
      },
    },
    handler: buildRoute(makeCreatePartOrSupplyController()),
  });

  fastify.get('', {
    schema: {
      tags: ['part-or-supply'],
      summary: 'List all parts/supplies',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
          orderBy: { type: 'string' },
          orderDirection: { type: 'string', enum: ['asc', 'desc'] },
          name: { type: 'string' },
          inStock: { type: 'string', enum: ['true', 'false'] },
        },
      },
      response: { 200: paginatedResponseSchema(partOrSupplyResponseSchema) },
    },
    handler: buildRoute(makeGetAllPartsOrSuppliesController()),
  });

  fastify.get('/:id', {
    schema: {
      tags: ['part-or-supply'],
      summary: 'Get part/supply by ID',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      response: {
        200: partOrSupplyResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeGetPartOrSupplyByIdController()),
  });

  fastify.put('/:id', {
    schema: {
      tags: ['part-or-supply'],
      summary: 'Update a part/supply',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          inStock: { type: 'integer' },
        },
      },
      response: {
        200: partOrSupplyResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeUpdatePartOrSupplyController()),
  });

  fastify.delete('/:id', {
    schema: {
      tags: ['part-or-supply'],
      summary: 'Delete a part/supply',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      response: {
        204: { type: 'null' },
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeDeletePartOrSupplyController()),
  });
}
