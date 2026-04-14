import { workOrderRoutes, serviceRoutes, partOrSupplyRoutes, sagaRoutes } from '@/main/routes';
import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';
import { docs } from './docs';

export type AppOptions = object;

export async function app(fastify: FastifyInstance, _opts: AppOptions) {
  fastify.register(fastifySwagger, docs);
  fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  fastify.register(workOrderRoutes, { prefix: '/api/work-orders' });
  fastify.register(serviceRoutes, { prefix: '/api/services' });
  fastify.register(partOrSupplyRoutes, { prefix: '/api/parts-or-supplies' });
  fastify.register(sagaRoutes, { prefix: '/api/sagas' });

  fastify.get('/health', async () => ({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
  }));

  fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'full', deepLinking: false },
  });
}
