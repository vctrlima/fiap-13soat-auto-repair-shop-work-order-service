export enum SagaStatus {
  SagaStarted = 'SAGA_STARTED',
  PaymentPending = 'PAYMENT_PENDING',
  PaymentCompleted = 'PAYMENT_COMPLETED',
  PaymentFailed = 'PAYMENT_FAILED',
  ExecutionPending = 'EXECUTION_PENDING',
  ExecutionCompleted = 'EXECUTION_COMPLETED',
  ExecutionFailed = 'EXECUTION_FAILED',
  RefundPending = 'REFUND_PENDING',
  SagaCompensating = 'SAGA_COMPENSATING',
  SagaCompensated = 'SAGA_COMPENSATED',
  SagaCompleted = 'SAGA_COMPLETED',
}
