import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';

export const docs: FastifyDynamicSwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Work Order Service',
      description: 'API documentation for the Work Order microservice — saga orchestrator',
      version: '1.0.0',
    },
    servers: [{ url: '/', description: 'Current server' }],
    tags: [
      { name: 'work-order', description: 'Work Order related end-points' },
      { name: 'service', description: 'Service catalog end-points' },
      { name: 'part-or-supply', description: 'Part/Supply catalog end-points' },
      { name: 'saga', description: 'Saga state end-points' },
    ],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from POST /api/auth/cpf (customer) or POST /api/auth/login (admin)',
        },
      },
    },
  },
};
