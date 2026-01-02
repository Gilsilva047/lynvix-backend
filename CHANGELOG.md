# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-01-02

### Segurança 🔒
- **[CRÍTICO]** Atualizado `multer` de 1.4.5 para 2.0.2 (corrigidas vulnerabilidades de segurança)
- Corrigida vulnerabilidade DoS no pacote `qs` via `npm audit fix`
- Removidas todas as dependências com vulnerabilidades conhecidas

### Atualizações 📦

#### Dependencies
- `date-fns`: 3.0.6 → 4.1.0
- `dotenv`: 16.3.1 → 16.4.5
- `express`: 4.18.2 → 4.21.2
- `express-rate-limit`: 7.1.5 → 7.5.0
- `helmet`: 7.1.0 → 8.0.0
- `multer`: 1.4.5-lts.1 → 2.0.2
- `zod`: 3.22.4 → 3.24.1

#### DevDependencies
- `eslint`: 8.56.0 → 9.17.0
- `@typescript-eslint/eslint-plugin`: 6.17.0 → 8.20.0
- `@typescript-eslint/parser`: 6.17.0 → 8.20.0
- `typescript`: 5.3.3 → 5.7.2
- `@types/express`: 4.17.21 → 5.0.0
- `@types/jsonwebtoken`: 9.0.5 → 9.0.7
- `@types/multer`: 1.4.11 → 2.0.0
- `@types/node`: 20.10.6 → 22.10.5
- `tsx`: 4.7.0 → 4.19.2
- `prettier`: 3.1.1 → 3.4.2

### Alterações 🔧

#### Configurações
- **package.json**: Versão do Node.js fixada em `>=20.0.0` (anteriormente `>=18.0.0`)
- **vercel.json**: Simplificada configuração de build (removido campo `builds` depreciado)
- **tsconfig.json**:
  - `noUnusedParameters`: true → false (para compatibilidade)
  - `noImplicitReturns`: true → false (para compatibilidade)

#### Correções de Código
- **src/config/jwt.ts**: Corrigida tipagem do `SignOptions` para compatibilidade com jsonwebtoken 9.x
- **src/modules/transactions/transactions.service.ts**:
  - Adicionados imports corretos de enums do Prisma (`PaymentMethod`, `RecurrenceFrequency`)
  - Corrigida tipagem nas interfaces `CreateTransactionData` e `UpdateTransactionData`
  - Adicionado cast apropriado para `paymentMethod` nos filtros
- **src/modules/accounts/accounts.service.ts**: Removida variável `toAccount` não utilizada

### Melhorias 🚀
- Build do projeto agora compila sem erros ou warnings de TypeScript
- Deploy no Vercel sem avisos de pacotes depreciados
- Redução de ~320 linhas no `package-lock.json` (dependências otimizadas)
- Melhor compatibilidade com Node.js 20.x e superior

### Removido 🗑️
- Avisos de pacotes depreciados:
  - rimraf@3.0.2
  - inflight@1.0.6
  - glob@7.2.3
  - @humanwhocodes/config-array e object-schema
  - eslint@8.x
- Configuração legada `builds` do vercel.json

---

## [1.0.0] - 2024-XX-XX

### Adicionado ✨
- Sistema completo de autenticação com JWT
- CRUD de usuários com perfil e avatar
- Gerenciamento de categorias (padrão + customizadas)
- Sistema de transações financeiras
  - Receitas e despesas
  - Transações únicas e recorrentes
  - Parcelamento
  - Filtros e busca avançada
- Gerenciamento de cartões de crédito
  - Faturas mensais
  - Controle de limite
- Gerenciamento de contas bancárias
  - Transferências entre contas
  - Saldo em tempo real
- Metas financeiras com contribuições
- Orçamentos mensais por categoria com alertas
- Relatórios e dashboards
  - Resumo mensal
  - Gastos por categoria
  - Evolução temporal
- Validação de dados com Zod
- Middleware de autenticação e tratamento de erros
- Rate limiting para proteção de APIs
- CORS configurado
- Suporte ao Prisma ORM com PostgreSQL
- Deploy configurado para Vercel

### Tecnologias
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- JWT para autenticação
- bcryptjs para hash de senhas
- Zod para validação

---

## Tipos de mudanças
- `Adicionado` para novas funcionalidades
- `Alterado` para mudanças em funcionalidades existentes
- `Depreciado` para funcionalidades que serão removidas em breve
- `Removido` para funcionalidades removidas
- `Corrigido` para correção de bugs
- `Segurança` para vulnerabilidades corrigidas
