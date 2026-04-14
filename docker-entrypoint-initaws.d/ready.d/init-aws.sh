#!/bin/bash
# MiniStack init script — creates SNS topics, SQS queues and subscriptions for Work Order Service
set -e

ENDPOINT="http://localhost:4566"
REGION="us-east-2"
ACCOUNT="000000000000"

echo "Creating SNS topics..."
aws --endpoint-url=$ENDPOINT --region=$REGION sns create-topic --name work-order-events
aws --endpoint-url=$ENDPOINT --region=$REGION sns create-topic --name payment-events
aws --endpoint-url=$ENDPOINT --region=$REGION sns create-topic --name execution-events

echo "Creating SQS queues..."
# DLQs
aws --endpoint-url=$ENDPOINT --region=$REGION sqs create-queue --queue-name work-order-payment-queue-dlq
aws --endpoint-url=$ENDPOINT --region=$REGION sqs create-queue --queue-name work-order-execution-queue-dlq

# Main queues with DLQ redrive policy
aws --endpoint-url=$ENDPOINT --region=$REGION sqs create-queue --queue-name work-order-payment-queue \
  --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-2:000000000000:work-order-payment-queue-dlq\",\"maxReceiveCount\":\"3\"}"}'

aws --endpoint-url=$ENDPOINT --region=$REGION sqs create-queue --queue-name work-order-execution-queue \
  --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-2:000000000000:work-order-execution-queue-dlq\",\"maxReceiveCount\":\"3\"}"}'

echo "Creating SNS→SQS subscriptions..."
aws --endpoint-url=$ENDPOINT --region=$REGION sns subscribe \
  --topic-arn arn:aws:sns:$REGION:$ACCOUNT:payment-events \
  --protocol sqs \
  --notification-endpoint arn:aws:sqs:$REGION:$ACCOUNT:work-order-payment-queue

aws --endpoint-url=$ENDPOINT --region=$REGION sns subscribe \
  --topic-arn arn:aws:sns:$REGION:$ACCOUNT:execution-events \
  --protocol sqs \
  --notification-endpoint arn:aws:sqs:$REGION:$ACCOUNT:work-order-execution-queue

echo "Work Order Service AWS resources created."
