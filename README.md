# Work Order Service (Saga Orchestrator)

Microserviço orquestrador do Saga Pattern, responsável pela gestão de ordens de serviço, catálogo de serviços e peças da oficina automotiva.

## Arquitetura

- **Clean Architecture**: domain → application → infra → presentation → main
- **Framework**: Fastify 5.2 + TypeScript 5.9
- **Banco de Dados**: PostgreSQL (Prisma ORM)
- **Mensageria**: AWS SNS (publish) + AWS SQS (consume)
- **Porta**: 3002

## Saga Pattern

Este serviço é o **orquestrador central do Saga**, coordenando o fluxo de trabalho entre os microserviços Billing e Execution.

### Estados da Saga

```
SAGA_STARTED → PAYMENT_PENDING → PAYMENT_COMPLETED → EXECUTION_PENDING → EXECUTION_COMPLETED → SAGA_COMPLETED
                                → PAYMENT_FAILED    → SAGA_COMPENSATING → SAGA_COMPENSATED
                                                      EXECUTION_FAILED  → SAGA_COMPENSATING → SAGA_COMPENSATED
```

### Fluxo de Eventos

1. **Aprovação da OS** → Publica `WorkOrderApproved` via SNS
2. **Billing Service** processa pagamento → Publica `PaymentCompleted` ou `PaymentFailed`
3. **Work Order Service** recebe evento e transiciona saga:
   - `PaymentCompleted` → atualiza saga para `EXECUTION_PENDING`, OS para `IN_EXECUTION`
   - `PaymentFailed` → compensa saga, cancela OS
4. **Execution Service** executa → Publica `ExecutionCompleted` ou `ExecutionFailed`
5. **Work Order Service** finaliza:
   - `ExecutionCompleted` → saga `SAGA_COMPLETED`, OS `FINISHED`
   - `ExecutionFailed` → publica `RefundRequested`, compensa saga, cancela OS

### Idempotência e Tolerância a Falhas

- **Deduplicação por `eventId`**: eventos duplicados são ignorados
- **Guard de transição de estado**: só processa eventos se a saga está no estado válido esperado
- **Histórico de compensação**: todas as compensações são registradas com timestamp e motivo

## Endpoints

| Método              | Rota                           | Descrição                |
| ------------------- | ------------------------------ | ------------------------ |
| POST                | `/api/work-orders`             | Criar OS                 |
| GET                 | `/api/work-orders`             | Listar OS                |
| GET                 | `/api/work-orders/:id`         | Buscar OS por ID         |
| PUT                 | `/api/work-orders/:id`         | Atualizar OS             |
| DELETE              | `/api/work-orders/:id`         | Remover OS               |
| POST                | `/api/work-orders/:id/approve` | Aprovar OS (inicia Saga) |
| POST                | `/api/work-orders/:id/cancel`  | Cancelar OS              |
| GET                 | `/api/sagas/:workOrderId`      | Consultar estado da Saga |
| POST/GET/PUT/DELETE | `/api/services`                | CRUD de serviços         |
| POST/GET/PUT/DELETE | `/api/parts-or-supplies`       | CRUD de peças            |

## Variáveis de Ambiente

| Variável                   | Descrição                 | Padrão    |
| -------------------------- | ------------------------- | --------- |
| `SERVER_PORT`              | Porta do servidor         | 3002      |
| `DATABASE_URL`             | URL PostgreSQL            | —         |
| `AWS_REGION`               | Região AWS                | us-east-1 |
| `AWS_ENDPOINT`             | Endpoint LocalStack (dev) | —         |
| `SNS_WORK_ORDER_TOPIC_ARN` | ARN do tópico SNS         | —         |
| `SQS_PAYMENT_QUEUE_URL`    | URL da fila de pagamentos | —         |
| `SQS_EXECUTION_QUEUE_URL`  | URL da fila de execução   | —         |
| `CORS_ORIGIN`              | Origem CORS permitida     | `*`       |

## Execução Local

```bash
yarn install
yarn prisma generate
yarn prisma migrate dev
yarn start:dev
```

## Testes

```bash
yarn test          # Unitários (28 suites, 102 testes)
yarn test:e2e      # BDD/E2E com jest-cucumber (requer ambiente local rodando)
```

- Cobertura mínima: 80%
- BDD: 6 cenários cobrindo fluxo completo da Saga

## Docker

```bash
docker compose up -d
```

## CI/CD

Pipeline GitHub Actions: lint → test → build → push ECR → deploy EKS
