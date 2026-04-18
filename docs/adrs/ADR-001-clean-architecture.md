# ADR-001: Adoção de Clean Architecture

## Status

Aceito

## Contexto

O serviço de Ordens de Serviço é o orquestrador central do sistema, gerenciando o ciclo de vida das ordens e a saga de pagamento/execução.

## Decisão

Adotamos **Clean Architecture** com separação em Domain, Application, Infra, Main e Presentation. A camada de Domain contém entidades (WorkOrder, Service, PartOrSupply, SagaState), enums de status e interfaces de casos de uso.

## Consequências

- **Positivo**: Lógica de negócio (saga) totalmente isolada e testável, fácil substituição de infraestrutura
- **Negativo**: Complexidade adicional na composição de dependências via factories
