# ADR-003: Comunicação Assíncrona via SNS/SQS

## Status

Aceito

## Contexto

Os microserviços precisam se comunicar de forma assíncrona e desacoplada para eventos de domínio (WorkOrderApproved, PaymentCompleted, ExecutionCompleted, etc.).

## Decisão

Adotamos **AWS SNS** (publish) + **SQS** (subscribe) no padrão fan-out:

- Cada serviço publica eventos em um tópico SNS dedicado
- Serviços consumidores inscrevem filas SQS nos tópicos relevantes
- Polling com long-polling (20s) e batch de até 10 mensagens
- Mensagens processadas com sucesso são deletadas; falhas permanecem para retry via DLQ

## Consequências

- **Positivo**: Desacoplamento total entre serviços, retry automático, escalabilidade independente
- **Negativo**: Latência eventual, necessidade de idempotência nos handlers
