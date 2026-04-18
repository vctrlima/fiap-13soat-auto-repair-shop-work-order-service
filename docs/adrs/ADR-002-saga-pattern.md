# ADR-002: Saga Orchestration Pattern

## Status

Aceito

## Contexto

O fluxo de uma ordem de serviço envolve múltiplos serviços (pagamento, execução) que precisam ser coordenados com garantias de consistência eventual. Falhas em qualquer etapa devem acionar compensações automáticas.

## Decisão

Implementamos o **Saga Orchestration Pattern** com:

- **SagaState**: Modelo persistido (PostgreSQL) com status, step atual e histórico de compensações
- **SagaEventHandler**: Orquestrador que processa eventos de pagamento e execução via SQS
- **Compensação automática**: Em caso de falha no pagamento → cancela ordem; falha na execução → solicita reembolso e cancela
- **Idempotência**: Cache in-memory de eventIds processados para evitar duplicatas
- **Validação de transições**: Mapa `VALID_TRANSITIONS` que impede transições de estado inválidas

## Fluxo

1. WorkOrder aprovada → Saga inicia → Publica evento SNS
2. Payment completo → Saga avança → Execução pendente
3. Execução completa → Saga completa → WorkOrder finalizada
4. Falha em qualquer etapa → Compensação → WorkOrder cancelada

## Consequências

- **Positivo**: Consistência eventual garantida, rastreabilidade completa via SagaState, resiliência a falhas
- **Negativo**: Complexidade de implementação, necessidade de DLQ para mensagens que falham repetidamente
