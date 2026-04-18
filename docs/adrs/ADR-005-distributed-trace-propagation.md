# ADR-004: Propagação de Trace Context Distribuído via SNS/SQS

## Status

Aceito

## Contexto

O sistema utiliza comunicação assíncrona via SNS/SQS entre microsserviços. Sem propagação explícita de contexto de rastreamento, os traces do OpenTelemetry são interrompidos nas fronteiras de mensageria, impossibilitando correlacionar uma requisição ponta a ponta entre os serviços.

## Decisão

Implementamos propagação de trace context seguindo o padrão W3C Trace Context via `traceparent` header:

### Publisher (SNS)

- No `SnsEventPublisher.publish()`, injetamos o contexto ativo do OpenTelemetry em um carrier usando `propagation.inject(context.active(), carrier)`.
- Se o carrier contiver `traceparent`, adicionamos como `MessageAttribute` na mensagem SNS.

### Consumer (SQS)

- No `SqsEventConsumer`, extraímos o `traceparent` de `body.MessageAttributes.traceparent.Value`.
- Usamos `propagation.extract()` para reconstruir o contexto pai.
- O handler é executado dentro de `context.with(parentContext, ...)`, garantindo que spans filhos herdem o trace correto.

### Dependência

- Utilizamos `@opentelemetry/api` que já estava instalado em todos os serviços como parte da pipeline de observabilidade.

## Consequências

- Traces agora cruzam fronteiras de mensageria SNS/SQS, permitindo rastreamento ponta a ponta.
- O Grafana Tempo exibe traces completos que incluem spans de múltiplos serviços conectados via mensageria.
- Overhead mínimo — apenas um `MessageAttribute` adicional por mensagem (~60 bytes).
- Compatível com o padrão W3C Trace Context, amplamente suportado por ferramentas de observabilidade.
