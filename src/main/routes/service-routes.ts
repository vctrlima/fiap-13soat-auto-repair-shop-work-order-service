import { buildRoute } from '@/main/adapters';
import {
  makeCreateServiceController,
  makeGetServiceByIdController,
  makeGetAllServicesController,
  makeUpdateServiceController,
  makeDeleteServiceController,
} from '@/main/factories/controllers';
import {
  serviceResponseSchema,
  paginatedResponseSchema,
  errorResponseSchema,
} from '@/main/docs/schemas';
import { FastifyInstance } from 'fastify';

export async function serviceRoutes(fastify: FastifyInstance) {
  fastify.post('', {
    schema: {
      tags: ['service'],
      summary: 'Create a service',
      body: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
        },
      },
      response: {
        201: serviceResponseSchema,
        400: errorResponseSchema,
      },
    },
    handler: buildRoute(makeCreateServiceController()),
  });

  fastify.get('', {
    schema: {
      tags: ['service'],
      summary: 'List all services',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
          orderBy: { type: 'string' },
          orderDirection: { type: 'string', enum: ['asc', 'desc'] },
          name: { type: 'string' },
        },
      },
      response: { 200: paginatedResponseSchema(serviceResponseSchema) },
    },
    handler: buildRoute(makeGetAllServicesController()),
  });

  fastify.get('/:id', {
    schema: {
      tags: ['service'],
      summary: 'Get service by ID',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      response: {
        200: serviceResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeGetServiceByIdController()),
  });

  fastify.put('/:id', {
    schema: {
      tags: ['service'],
      summary: 'Update a service',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
        },
      },
      response: {
        200: serviceResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeUpdateServiceController()),
  });

  fastify.delete('/:id', {
    schema: {
      tags: ['service'],
      summary: 'Delete a service',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
      response: {
        204: { type: 'null' },
        404: errorResponseSchema,
      },
    },
    handler: buildRoute(makeDeleteServiceController()),
  });
}
