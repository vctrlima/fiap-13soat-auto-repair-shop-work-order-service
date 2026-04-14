import { makeGetSagaState } from '@/main/factories/use-cases';
import { sagaStateResponseSchema, errorResponseSchema } from '@/main/docs/schemas';
import { FastifyInstance } from 'fastify';

export async function sagaRoutes(fastify: FastifyInstance) {
  fastify.get('/:workOrderId', {
    schema: {
      tags: ['saga'],
      summary: 'Get saga state by work order ID',
      params: { type: 'object', properties: { workOrderId: { type: 'string', format: 'uuid' } } },
      response: {
        200: sagaStateResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { workOrderId } = request.params as { workOrderId: string };
      const getSagaState = makeGetSagaState();
      const sagaState = await getSagaState.getByWorkOrderId({ workOrderId });
      if (!sagaState) {
        return reply.status(404).send({ error: 'Saga state not found' });
      }
      return reply.status(200).send(sagaState);
    },
  });
}
