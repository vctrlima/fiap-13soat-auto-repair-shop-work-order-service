# ADR-004: Idempotência e Timeout no Saga Pattern

## Status

Aceito

## Contexto

O Saga Pattern (ADR-002) orquestra transações distribuídas entre os serviços de pagamento e execução. No entanto, em cenários de falha de rede ou reprocessamento de mensagens SQS, eventos duplicados podem causar inconsistências. Além disso, sagas podem ficar "travadas" indefinidamente em estados intermediários caso um serviço downstream não responda.

## Decisão

### Idempotência baseada em banco de dados

- Criamos o modelo `ProcessedEvent` no schema Prisma para registrar `eventId` de cada evento processado.
- Antes de processar um evento no `SagaEventHandler`, verificamos se o `eventId` já foi registrado via `prisma.processedEvent.findUnique`.
- Após o processamento bem-sucedido, registramos o `eventId` com `prisma.processedEvent.create`.
- Isso substitui a abordagem anterior de deduplicação em memória (Set), que não sobrevivia a reinicializações.

### Validação de transição de estado

- Implementamos uma tabela `VALID_TRANSITIONS` que mapeia cada tipo de evento para os estados de saga permitidos.
- O handler verifica o estado atual da saga antes de processar, rejeitando transições inválidas.

### Timeout de sagas

- Implementamos `SagaTimeoutJob` — um job periódico (60s) que busca sagas em estados `SAGA_STARTED`, `PAYMENT_PENDING` ou `EXECUTION_PENDING` há mais de 30 minutos.
- Sagas expiradas são atomicamente compensadas via `prisma.$transaction` — o estado da saga é atualizado para `SAGA_COMPENSATED` e a work order para `CANCELED`.
- O histórico de compensação é preservado no campo JSON `compensationHistory`.

## Consequências

- Eventos duplicados são ignorados de forma idempotente, prevenindo ações duplicadas.
- Transições inválidas são bloqueadas, prevenindo corrupção de estado.
- Sagas travadas são automaticamente compensadas, evitando recursos bloqueados indefinidamente.
- O modelo `ProcessedEvent` adiciona uma escrita extra ao banco por evento processado.
