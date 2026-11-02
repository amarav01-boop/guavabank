# GuavaBank

Banco digital educacional em ambiente de simulação.

## Objetivo do MVP

Construir uma aplicação simples para demonstrar cadastro de cliente e KYC simulado, abertura de conta-corrente, consulta de saldo e extrato, transferência Pix simulada entre contas GuavaBank e trilha de auditoria.

> Este projeto não movimenta dinheiro real e não se conecta ao SPI, DICT ou a qualquer participante Pix.

## Stack inicial

- Mobile: React Native com Expo e TypeScript
- API: Node.js, TypeScript, Fastify
- Persistência: SQLite durante o MVP, acessado via Prisma
- Testes: Vitest e testes de integração

## Estrutura planejada

```text
guavabank/
├── apps/api/              # API HTTP e regras de negócio
├── apps/mobile/           # Aplicativo React Native/Expo
├── packages/shared/       # Tipos e contratos compartilhados
├── docs/architecture.md   # Escopo, modelo e decisões
└── README.md
```

## Próximos incrementos

1. Inicializar o workspace e os dois aplicativos.
2. Criar o schema SQLite e as migrações.
3. Implementar autenticação local e KYC simulado.
4. Implementar conta, saldo e extrato usando lançamentos contábeis.
5. Implementar Pix simulado com validação, idempotência e estados.
6. Adicionar telas mobile e testes de ponta a ponta.

## Fontes oficiais consultadas

- [Normas sobre o Pix — Banco Central](https://www.bcb.gov.br/estabilidadefinanceira/pix-normas)
- [Manual de Padrões para Iniciação do Pix](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf)
- [Manual de Segurança do Pix](https://www.bcb.gov.br/content/estabilidadefinanceira/cedsfn/manual_de_seguranca_pix.pdf)
