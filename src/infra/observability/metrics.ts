import { Counter, Histogram, Meter, metrics } from "@opentelemetry/api";

const meter: Meter = metrics.getMeter("work-order-service");

export const httpRequestCounter: Counter = meter.createCounter(
  "http.server.request.count",
  { description: "Total number of HTTP requests" },
);

export const httpRequestDuration: Histogram = meter.createHistogram(
  "http.request.duration",
  { description: "HTTP request duration in milliseconds", unit: "ms" },
);

export const workOrderCreatedCounter: Counter = meter.createCounter(
  "business.work_order.created",
  { description: "Total number of work orders created" },
);

export const workOrderCompletedCounter: Counter = meter.createCounter(
  "business.work_order.completed",
  { description: "Total number of work orders completed" },
);

export const sagaStartedCounter: Counter = meter.createCounter(
  "business.saga.started",
  { description: "Total number of sagas started" },
);

export const sagaCompletedCounter: Counter = meter.createCounter(
  "business.saga.completed",
  { description: "Total number of sagas completed" },
);

export const sagaCompensatedCounter: Counter = meter.createCounter(
  "business.saga.compensated",
  { description: "Total number of sagas compensated" },
);

export const messagePublishedCounter: Counter = meter.createCounter(
  "messaging.message.published",
  { description: "Total messages published to SNS" },
);

export const messageConsumedCounter: Counter = meter.createCounter(
  "messaging.message.consumed",
  { description: "Total messages consumed from SQS" },
);

export const dbQueryDuration: Histogram = meter.createHistogram(
  "db.query.duration",
  { description: "Database query duration in milliseconds", unit: "ms" },
);

export const dbQueryErrorCounter: Counter = meter.createCounter(
  "db.query.error.count",
  { description: "Total number of database query errors" },
);
