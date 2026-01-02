# FinançasBR - Backend

Backend completo de um SaaS de controle financeiro pessoal para brasileiros.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** (Framework web)
- **Prisma ORM** (ORM para PostgreSQL)
- **PostgreSQL** (Banco de dados via Supabase)
- **JWT** (Autenticação)
- **Zod** (Validação de dados)
- **bcrypt** (Hash de senhas)
- **date-fns** (Manipulação de datas)

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- NPM ou Yarn
- Conta no [Supabase](https://supabase.com) (PostgreSQL gratuito)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd financasbr-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e **substitua [YOUR-PASSWORD] pela senha do seu banco Supabase**:

```env
NODE_ENV=development
PORT=3333

# Banco de dados (substitua [YOUR-PASSWORD] pela senha do Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.hljbpdlrxuimelznijzi.supabase.co:5432/postgres

# JWT Secrets (já configurados, mas você pode alterá-los)
JWT_SECRET=lynvix_super_secret_key_2024_production_32chars_min
JWT_REFRESH_SECRET=lynvix_refresh_token_secret_key_2024_prod_32chars

JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

### 4. Configure o banco de dados

```bash
# Gera o Prisma Client
npm run prisma:generate

# Cria as tabelas no banco de dados
npm run prisma:push

# (Opcional) Abre o Prisma Studio para visualizar os dados
npm run prisma:studio
```

### 5. Inicie o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3333`

## 📚 Documentação da API

### Base URL

```
http://localhost:3333/api/v1
```

### Autenticação

Todos os endpoints (exceto registro e login) exigem autenticação via JWT no header:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🔐 Autenticação (Auth)

### POST `/auth/register`
Registra um novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "cpf": "12345678901" // opcional
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": "...",
      "name": "João Silva",
      "email": "joao@example.com"
    }
  }
}
```

### POST `/auth/login`
Faz login

**Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

### POST `/auth/refresh-token`
Atualiza os tokens

**Body:**
```json
{
  "refreshToken": "..."
}
```

### POST `/auth/logout`
Faz logout (invalida o refresh token)

**Body:**
```json
{
  "refreshToken": "..."
}
```

---

## 👤 Usuários (Users)

### GET `/users/me`
Retorna perfil do usuário autenticado

### PUT `/users/me`
Atualiza perfil

**Body:**
```json
{
  "name": "João da Silva",
  "cpf": "12345678901",
  "avatar": "https://..."
}
```

### PUT `/users/me/password`
Altera senha

**Body:**
```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

### DELETE `/users/me`
Deleta a conta do usuário

---

## 📂 Categorias (Categories)

### GET `/categories`
Lista todas as categorias (padrão + customizadas do usuário)

### POST `/categories`
Cria uma categoria customizada

**Body:**
```json
{
  "name": "Academia",
  "icon": "dumbbell",
  "color": "#FF5733",
  "parentId": "..." // opcional (para subcategoria)
}
```

### PUT `/categories/:id`
Atualiza categoria

### DELETE `/categories/:id`
Deleta categoria

---

## 💰 Transações (Transactions)

### GET `/transactions`
Lista transações com filtros

**Query params:**
- `page` (número da página)
- `limit` (itens por página)
- `type` (INCOME ou EXPENSE)
- `status` (PAID, PENDING, SCHEDULED)
- `categoryId`
- `paymentMethod`
- `startDate` (ISO 8601)
- `endDate` (ISO 8601)
- `search` (busca na descrição)

**Exemplo:**
```
GET /transactions?type=EXPENSE&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
```

### GET `/transactions/:id`
Busca transação por ID

### POST `/transactions`
Cria transação

**Body:**
```json
{
  "description": "Compra no supermercado",
  "amount": 150.50,
  "date": "2024-01-15T10:30:00Z",
  "type": "EXPENSE",
  "status": "PAID",
  "paymentMethod": "CREDIT_CARD",
  "categoryId": "...",
  "creditCardId": "...", // opcional
  "bankAccountId": "...", // opcional
  "isRecurring": false,
  "installments": 3, // opcional
  "notes": "Compras do mês",
  "tags": ["alimentação", "casa"]
}
```

### PUT `/transactions/:id`
Atualiza transação

### DELETE `/transactions/:id`
Deleta transação

---

## 💳 Cartões de Crédito (Cards)

### GET `/cards`
Lista todos os cartões

### GET `/cards/:id`
Busca cartão por ID

### POST `/cards`
Cria cartão

**Body:**
```json
{
  "name": "Nubank Mastercard",
  "lastDigits": "1234",
  "limit": 5000,
  "closingDay": 10,
  "dueDay": 17,
  "brand": "Mastercard",
  "color": "#8A05BE"
}
```

### PUT `/cards/:id`
Atualiza cartão

### DELETE `/cards/:id`
Deleta cartão

### GET `/cards/:id/invoice`
Busca fatura do cartão

**Query params:**
- `month` (1-12, padrão: mês atual)
- `year` (padrão: ano atual)

---

## 🏦 Contas Bancárias (Accounts)

### GET `/accounts`
Lista todas as contas

### POST `/accounts`
Cria conta

**Body:**
```json
{
  "name": "Conta Corrente Nubank",
  "bank": "Nubank",
  "accountType": "CHECKING",
  "balance": 1500.00,
  "color": "#8A05BE"
}
```

### PUT `/accounts/:id`
Atualiza conta

### DELETE `/accounts/:id`
Deleta conta

### POST `/accounts/transfer`
Cria transferência entre contas

**Body:**
```json
{
  "fromAccountId": "...",
  "toAccountId": "...",
  "amount": 500,
  "date": "2024-01-15T14:00:00Z",
  "description": "Transferência para poupança"
}
```

---

## 🎯 Metas Financeiras (Goals)

### GET `/goals`
Lista todas as metas

### POST `/goals`
Cria meta

**Body:**
```json
{
  "name": "Viagem para Europa",
  "description": "Economia para viagem em julho",
  "targetAmount": 15000,
  "currentAmount": 0,
  "deadline": "2024-07-01T00:00:00Z",
  "icon": "airplane",
  "color": "#3498db"
}
```

### PUT `/goals/:id`
Atualiza meta

### DELETE `/goals/:id`
Deleta meta

### POST `/goals/:id/contribute`
Adiciona contribuição à meta

**Body:**
```json
{
  "amount": 500,
  "date": "2024-01-15T00:00:00Z",
  "notes": "Economia do mês"
}
```

---

## 📊 Orçamentos (Budgets)

### GET `/budgets`
Lista orçamentos

**Query params:**
- `month` (1-12)
- `year`

### GET `/budgets/status`
Retorna status dos orçamentos (quanto gastou vs limite)

### POST `/budgets`
Cria orçamento

**Body:**
```json
{
  "month": 1,
  "year": 2024,
  "categoryId": "...",
  "limit": 1000,
  "alertAt70": true,
  "alertAt90": true,
  "alertAt100": true
}
```

### PUT `/budgets/:id`
Atualiza orçamento

### DELETE `/budgets/:id`
Deleta orçamento

---

## 📈 Relatórios (Reports)

### GET `/reports/summary`
Resumo mensal

**Query params:**
- `month` (padrão: mês atual)
- `year` (padrão: ano atual)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "month": 1,
    "year": 2024,
    "totalIncome": 5000,
    "totalExpense": 3500,
    "balance": 1500,
    "topCategories": [...],
    "topExpenses": [...]
  }
}
```

### GET `/reports/by-category`
Gastos por categoria

### GET `/reports/evolution`
Evolução dos últimos meses

**Query params:**
- `months` (padrão: 6)

---

## 🗂️ Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (DB, JWT, env)
│   ├── middlewares/     # Middlewares (auth, error, validation)
│   ├── modules/         # Módulos da aplicação
│   │   ├── auth/
│   │   ├── users/
│   │   ├── categories/
│   │   ├── transactions/
│   │   ├── cards/
│   │   ├── accounts/
│   │   ├── goals/
│   │   ├── budgets/
│   │   └── reports/
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários (validators, formatters, helpers)
│   ├── app.ts           # Configuração do Express
│   └── server.ts        # Inicialização do servidor
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
├── .env.example
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## 🚀 Deploy na Vercel

### 1. Instale a CLI da Vercel

```bash
npm i -g vercel
```

### 2. Faça build do projeto

```bash
npm run build
```

### 3. Deploy

```bash
vercel
```

### 4. Configure as variáveis de ambiente na Vercel

No painel da Vercel, adicione todas as variáveis do arquivo `.env`

## 📝 Scripts disponíveis

```bash
npm run dev              # Inicia em desenvolvimento (hot reload)
npm run build            # Compila TypeScript para JavaScript
npm start                # Inicia em produção
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Cria migration
npm run prisma:push      # Sincroniza schema com o banco
npm run prisma:studio    # Abre Prisma Studio (GUI do banco)
npm run lint             # Roda ESLint
npm run format           # Formata código com Prettier
```

## 🐛 Troubleshooting

### Erro de conexão com o banco

- Verifique se a `DATABASE_URL` está correta
- Confirme que você substituiu `[YOUR-PASSWORD]` pela senha correta do Supabase
- Verifique se o projeto no Supabase está ativo
- Teste a conexão: `npm run prisma:studio`

### Erro "JWT_SECRET undefined"

- Verifique se o arquivo `.env` existe
- Confirme que as variáveis `JWT_SECRET` e `JWT_REFRESH_SECRET` estão definidas

### Porta 3333 já em uso

- Mude a porta no arquivo `.env`: `PORT=3334`
- Ou mate o processo:
  - Linux/Mac: `lsof -ti:3333 | xargs kill`
  - Windows: `netstat -ano | findstr :3333` e depois `taskkill /PID <PID> /F`

## 📚 Documentação Adicional

- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de atualizações e mudanças
- **[docs/API_CONNECTION.md](./docs/API_CONNECTION.md)** - Guia completo de integração com frontend
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Guia de deploy e produção
- **[docs/TRANSACTION_STATUS_UPDATE.md](./docs/TRANSACTION_STATUS_UPDATE.md)** - Atualização de status de transações

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com TypeScript e Node.js

---

**FinançasBR** - Controle financeiro pessoal completo para brasileiros 🇧🇷
