# Arquitetura do GuavaBank — MVP simulado

## Limites do produto

O sistema representa um banco digital fictício para desenvolvimento e testes. Não haverá integração com instituições financeiras, SPI, DICT, API Pix, certificados, liquidação externa ou dados reais de clientes.

## Módulos

### Identidade e KYC simulado

- `User`: credenciais e estado de acesso.
- `Customer`: dados cadastrais mínimos.
- `KycCase`: status `PENDING`, `PROCESSING`, `APPROVED`, `REJECTED` ou `MANUAL_REVIEW`.
- `KycDocument`: metadados e hash de documentos sintéticos; o arquivo não é persistido no MVP.
- `KycCheck`: resultado de cada regra automatizada.
- `KycDecision`: histórico imutável das decisões do caso.
- O aprovador inicial será uma regra determinística de teste ou endpoint administrativo local.
- Somente KYC aprovado pode abrir conta e enviar Pix.

### Conta-corrente e saldo

- Uma conta por cliente no MVP.
- Saldo em centavos (`integer`), nunca em ponto flutuante.
- Saldo derivado de lançamentos (`LedgerEntry`), permitindo auditoria.
- Toda operação financeira deve ser transacional e atômica.

### Pix simulado

Fluxo: criação da intenção, validação da chave, validação de saldo e limites, lançamentos de débito/crédito, conclusão e auditoria.

Estados: `CREATED`, `PROCESSING`, `COMPLETED`, `REJECTED` e `CANCELED`.

Regras: `idempotencyKey` única por remetente, valor maior que zero, sem transferência para a própria conta, sem saldo negativo e logs sem CPF ou documentos.

## Modelo de dados inicial

```text
User 1──1 Customer 1──1 KycCase
Customer 1──1 Account 1──N LedgerEntry
Account 1──N PixTransfer
PixTransfer 1──N AuditEvent
```

Entidades mínimas: `User`, `Customer`, `KycCase`, `KycDocument`, `KycCheck`, `KycDecision`, `Account`, `LedgerEntry`, `PixKey`, `PixTransfer` e `AuditEvent`.

## API inicial

```text
POST /auth/register       POST /auth/login
POST /kyc/submit          GET  /kyc/me
POST /accounts            GET  /accounts/me
GET  /accounts/me/statement
POST /pix/keys            GET  /pix/keys
POST /pix/transfers       GET  /pix/transfers/:id
```

## Segurança do MVP

- hash forte para senhas;
- token de curta duração;
- validação de entrada e autorização por usuário/conta;
- transações de banco para débito/crédito;
- logs estruturados sem credenciais, documentos ou chaves completas;
- dados sintéticos no ambiente de teste.

## Evolução para MariaDB

O domínio não deve depender de SQLite. O Prisma permite trocar o provider e a URL de conexão posteriormente. A migração só deve ocorrer quando houver necessidade de concorrência, execução multi-instância ou ambiente compartilhado.

## Relação com a documentação do Banco Central

Os manuais oficiais serão referência conceitual para estados, identificadores, rastreabilidade e segurança. Isso não transforma o sistema em participante Pix nem em implementação da API Pix. Uma integração real exigiria instituição autorizada, contratos, homologação, certificados e requisitos regulatórios específicos.
