export const workOrderResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    customerId: { type: 'string', format: 'uuid' },
    vehicleId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    budget: { type: 'number' },
    services: { type: 'array', items: { type: 'object' } },
    partsAndSupplies: { type: 'array', items: { type: 'object' } },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  },
};

export const serviceResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    price: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  },
};

export const partOrSupplyResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    price: { type: 'number' },
    inStock: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  },
};

export const sagaStateResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    workOrderId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    currentStep: { type: 'string' },
    compensationHistory: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'string' },
          status: { type: 'string' },
          timestamp: { type: 'string' },
          reason: { type: 'string' },
        },
        additionalProperties: true,
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  },
};

export const paginatedResponseSchema = (itemSchema: object) => ({
  type: 'object',
  properties: {
    content: { type: 'array', items: itemSchema },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
});

export const errorResponseSchema = {
  type: 'object',
  properties: { error: { type: 'string' } },
};
