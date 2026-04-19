import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  SERVER_PORT: z.coerce.number().default(3002),
  SERVER_HOST: z.string().default("http://localhost:3002"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ENDPOINT: z.string().optional(),
  SNS_WORK_ORDER_TOPIC_ARN: z
    .string()
    .default("arn:aws:sns:us-east-1:000000000000:work-order-events"),
  SQS_PAYMENT_QUEUE_URL: z
    .string()
    .default("http://localhost:4566/000000000000/payment-events-work-order"),
  SQS_EXECUTION_QUEUE_URL: z
    .string()
    .default("http://localhost:4566/000000000000/execution-events-work-order"),
  SNS_PAYMENT_EVENTS_TOPIC_ARN: z
    .string()
    .default("arn:aws:sns:us-east-2:000000000000:payment-events"),
  SNS_EXECUTION_EVENTS_TOPIC_ARN: z
    .string()
    .default("arn:aws:sns:us-east-2:000000000000:execution-events"),
  SQS_PAYMENT_DLQ_URL: z
    .string()
    .default("http://localhost:4566/000000000000/work-order-payment-queue-dlq"),
  SQS_EXECUTION_DLQ_URL: z
    .string()
    .default(
      "http://localhost:4566/000000000000/work-order-execution-queue-dlq",
    ),
  CORS_ORIGIN: z.string().optional(),
  JWT_ACCESS_TOKEN_SECRET: z.string({
    error: "JWT_ACCESS_TOKEN_SECRET is required. Auth cannot be disabled.",
  }),
});

const parsed = envSchema.parse(process.env);

export default {
  port: parsed.SERVER_PORT,
  host: parsed.SERVER_HOST,
  awsRegion: parsed.AWS_REGION,
  awsEndpoint: parsed.AWS_ENDPOINT,
  snsWorkOrderTopicArn: parsed.SNS_WORK_ORDER_TOPIC_ARN,
  sqsPaymentQueueUrl: parsed.SQS_PAYMENT_QUEUE_URL,
  sqsExecutionQueueUrl: parsed.SQS_EXECUTION_QUEUE_URL,
  snsPaymentEventsTopicArn: parsed.SNS_PAYMENT_EVENTS_TOPIC_ARN,
  snsExecutionEventsTopicArn: parsed.SNS_EXECUTION_EVENTS_TOPIC_ARN,
  sqsPaymentDlqUrl: parsed.SQS_PAYMENT_DLQ_URL,
  sqsExecutionDlqUrl: parsed.SQS_EXECUTION_DLQ_URL,
  corsOrigin: parsed.CORS_ORIGIN,
  jwtSecret: parsed.JWT_ACCESS_TOKEN_SECRET,
};
