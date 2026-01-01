# 🚀 Guia Rápido - FinançasBR Backend

Este guia mostra como colocar o backend no ar em **menos de 5 minutos**.

## ⚡ Início Rápido

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o banco de dados no Supabase

O arquivo `.env` já está criado com a configuração do Supabase.

**IMPORTANTE**: Edite o arquivo `.env` e substitua `[YOUR-PASSWORD]` pela senha do seu banco Supabase:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.hljbpdlrxuimelznijzi.supabase.co:5432/postgres
```

**Onde encontrar a senha:**
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em Settings > Database
4. Copie a senha do banco (ou redefina se necessário)

### 3. JWT Secrets

Os JWT secrets já estão configurados no arquivo `.env`. Você pode alterá-los se preferir valores diferentes.

### 4. Configure o banco de dados

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 5. Inicie o servidor

```bash
npm run dev
```

✅ Pronto! O servidor está rodando em `http://localhost:3333`

## 🧪 Testando a API

### 1. Registrar usuário

```bash
curl -X POST http://localhost:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### 2. Fazer login

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

Copie o `accessToken` da resposta.

### 3. Listar categorias (autenticado)

```bash
curl -X GET http://localhost:3333/api/v1/categories \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

## 📚 Próximos Passos

- Leia o [README.md](./README.md) completo para ver toda a documentação da API
- Explore os endpoints em `http://localhost:3333/api/v1`
- Use o Prisma Studio para visualizar os dados: `npm run prisma:studio`

## ❓ Problemas Comuns

**Erro: "JWT_SECRET undefined"**
→ Verifique se o arquivo `.env` existe e tem as variáveis corretas

**Erro de conexão com o banco**
→ Verifique se você substituiu `[YOUR-PASSWORD]` pela senha correta do Supabase
→ Confirme se o projeto no Supabase está ativo

**Porta 3333 já em uso**
→ Mude a `PORT` no `.env` ou mate o processo na porta 3333

---

Boa codificação! 🎉
