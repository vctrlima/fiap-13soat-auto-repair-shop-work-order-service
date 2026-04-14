import * as dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.SERVER_PORT || 3002,
  host: process.env.SERVER_HOST || 'http://localhost:3002',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsEndpoint: process.env.AWS_ENDPOINT || undefined,
  snsWorkOrderTopicArn: process.env.SNS_WORK_ORDER_TOPIC_ARN || 'arn:aws:sns:us-east-1:000000000000:work-order-events',
  sqsPaymentQueueUrl: process.env.SQS_PAYMENT_QUEUE_URL || 'http://localhost:4566/000000000000/payment-events-work-order',
  sqsExecutionQueueUrl: process.env.SQS_EXECUTION_QUEUE_URL || 'http://localhost:4566/000000000000/execution-events-work-order',
};
