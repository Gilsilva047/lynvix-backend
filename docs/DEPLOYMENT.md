# Guia de Deploy - FinançasBR Backend

Este documento descreve como fazer o deploy do backend para produção usando Vercel.

## 🚀 Deploy Atual

### Status
- ✅ **Deploy Ativo**: https://seu-projeto.vercel.app
- ✅ **Build**: Passando sem erros
- ✅ **Segurança**: Todas as vulnerabilidades corrigidas
- ✅ **Node.js**: 20.x

### Última Atualização
- **Data**: 2026-01-02
- **Commit**: `1eae9ca` - Atualização de dependências e correções de segurança
- **Tempo de Build**: ~8 segundos

---

## 📋 Pré-requisitos

### 1. Conta no Vercel
- Crie uma conta em [vercel.com](https://vercel.com)
- Conecte sua conta do GitHub

### 2. Banco de Dados
- Projeto no [Supabase](https://supabase.com) configurado
- String de conexão `DATABASE_URL` disponível

### 3. Repositório Git
- Código versionado no GitHub
- Branch `main` ou `master` configurada

---

## 🔧 Configuração Inicial

### 1. Instalar Vercel CLI (Opcional)

```bash
npm install -g vercel
```

### 2. Conectar ao GitHub

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em "Import Git Repository"
3. Selecione seu repositório `lynvix-backend`
4. Clique em "Import"

### 3. Configurar Projeto

#### Framework Preset
- **Framework**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Root Directory
- Deixe em branco se o backend está na raiz
- Ou especifique a pasta (ex: `backend/`)

---

## 🔐 Variáveis de Ambiente

### Adicionar no Painel da Vercel

1. Vá em **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

```env
# Ambiente
NODE_ENV=production

# Porta (Vercel define automaticamente, mas é bom ter)
PORT=3333

# Banco de dados (Supabase)
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.hljbpdlrxuimelznijzi.supabase.co:5432/postgres

# JWT Secrets (GERE NOVOS VALORES SEGUROS PARA PRODUÇÃO!)
JWT_SECRET=sua_chave_super_secreta_com_no_minimo_32_caracteres_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_token_super_secreta_32_caracteres

# Tempo de expiração dos tokens
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# URL do Frontend (para CORS)
FRONTEND_URL=https://seu-frontend.vercel.app
```

### ⚠️ IMPORTANTE - Segurança

1. **Nunca use os mesmos secrets de desenvolvimento em produção**
2. **Gere novos valores aleatórios seguros**:

```bash
# Gerar secrets seguros no terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Execute esse comando 2 vezes para gerar:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

3. **Database URL**: Use a string de conexão do Supabase (com senha real)

---

## 📦 Arquivos de Configuração

### vercel.json

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/server.js"
    }
  ]
}
```

### package.json (scripts importantes)

```json
{
  "scripts": {
    "build": "prisma generate && tsc",
    "start": "node dist/server.js"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## 🚢 Processo de Deploy

### Deploy Automático (Recomendado)

Toda vez que você fizer `git push` para a branch `main`, o Vercel automaticamente:

1. **Clona** o repositório
2. **Instala** as dependências (`npm install`)
3. **Gera** o Prisma Client (`prisma generate`)
4. **Compila** TypeScript (`tsc`)
5. **Faz Deploy** da pasta `dist/`

### Deploy Manual via CLI

```bash
# Login (primeira vez)
vercel login

# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

---

## 🗄️ Configuração do Banco de Dados

### Aplicar Schema (Primeira vez)

Depois do primeiro deploy, você precisa aplicar o schema do Prisma no banco:

#### Opção 1: Via Prisma Studio

```bash
# No terminal local, conectado ao banco de produção
npx prisma db push --skip-generate
```

#### Opção 2: Via Migrations

```bash
# Criar migration
npx prisma migrate dev --name init

# Aplicar no banco de produção
DATABASE_URL="sua_url_de_producao" npx prisma migrate deploy
```

#### Opção 3: Usar Vercel CLI

```bash
# Executar comando no ambiente Vercel
vercel env pull .env.production
npx prisma db push --skip-generate
```

### Sincronizar Schema (Atualizações)

Quando alterar o `schema.prisma`:

```bash
# 1. Atualizar localmente
npm run prisma:generate

# 2. Fazer commit e push
git add prisma/schema.prisma
git commit -m "chore: atualizar schema do banco"
git push

# 3. Aplicar no banco de produção
DATABASE_URL="url_producao" npx prisma db push
```

---

## 🔍 Monitoramento e Logs

### Ver Logs no Painel Vercel

1. Acesse seu projeto no [dashboard Vercel](https://vercel.com/dashboard)
2. Vá em **Deployments**
3. Clique no deploy ativo
4. Veja os **Build Logs** e **Function Logs**

### Ver Logs em Tempo Real (CLI)

```bash
vercel logs
```

### Monitorar Erros

- Configure integração com **Sentry** ou **LogRocket**
- Use o sistema de logs do Vercel

---

## 🐛 Troubleshooting

### Build Falhou

#### Erro: "Cannot find module 'xxx'"

**Solução**: Certifique-se de que a dependência está em `dependencies` (não em `devDependencies`)

```bash
npm install xxx --save
```

#### Erro: Prisma Client não gerado

**Solução**: O script de build já inclui `prisma generate`, mas se falhar:

```json
{
  "scripts": {
    "build": "prisma generate && tsc",
    "vercel-build": "prisma generate && npm run build"
  }
}
```

#### Erro: TypeScript compilation failed

**Solução**: Rode localmente para ver os erros

```bash
npm run build
```

Corrija os erros de tipo e faça commit.

### Erro de Conexão com Banco

#### Prisma Error: "Can't reach database server"

**Soluções**:

1. Verifique se a `DATABASE_URL` está correta nas env vars do Vercel
2. Confirme que a senha está correta (sem espaços extras)
3. Teste a conexão localmente com a mesma URL
4. Verifique se o IP da Vercel não está bloqueado no Supabase

#### Timeout ao conectar

**Solução**: Aumente o timeout do Prisma

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Adicione estas opções
  relationMode = "prisma"
}
```

### Variáveis de Ambiente Não Carregadas

**Soluções**:

1. Verifique se adicionou as variáveis no painel Vercel
2. Confira se está usando o ambiente correto (Production/Preview)
3. Faça **Redeploy** após adicionar variáveis

### Deploy Lento

**Otimizações**:

1. Use cache do Vercel (já configurado automaticamente)
2. Remova dependências não utilizadas:

```bash
npm prune --production
```

3. Use `.vercelignore` para ignorar arquivos grandes:

```
# .vercelignore
node_modules
.git
*.log
.env*
docs
```

---

## 📊 Métricas do Deploy

### Build Atual (2026-01-02)

```
✅ Cloning: 238ms
✅ Installing dependencies: 3s
✅ Build: 4s
✅ Total: ~8s
✅ Cache: Disponível
✅ Size: 42.14 MB
```

### Melhorias Aplicadas

- ✅ Removidos 49 pacotes desnecessários
- ✅ Atualizado 34 pacotes
- ✅ Zero vulnerabilidades
- ✅ Zero warnings de pacotes depreciados
- ✅ Build otimizado

---

## 🔄 Rollback (Reverter Deploy)

### Via Painel Vercel

1. Vá em **Deployments**
2. Encontre o deploy anterior (funcionando)
3. Clique em **⋯** (três pontos)
4. Selecione **Promote to Production**

### Via CLI

```bash
# Listar deployments
vercel ls

# Promover um deployment específico
vercel promote <deployment-url>
```

---

## 🌍 Domínio Customizado

### Adicionar Domínio

1. Vá em **Settings** → **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `api.financasbr.com`)
4. Siga as instruções para configurar DNS

### Configuração DNS

Adicione um registro **CNAME**:

```
Nome: api
Tipo: CNAME
Valor: cname.vercel-dns.com
```

---

## 📈 Próximos Passos

Após o deploy:

- [ ] Testar todos os endpoints principais
- [ ] Configurar monitoramento de erros
- [ ] Configurar alertas de uptime
- [ ] Implementar CI/CD com testes
- [ ] Configurar backup automático do banco
- [ ] Documentar endpoints públicos
- [ ] Configurar rate limiting por usuário
- [ ] Adicionar logging estruturado
- [ ] Configurar SSL pinning (se necessário)

---

## 📞 Suporte

### Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)

### Comandos Úteis

```bash
# Ver informações do projeto
vercel

# Ver logs
vercel logs

# Listar deployments
vercel ls

# Listar variáveis de ambiente
vercel env ls

# Baixar variáveis de ambiente
vercel env pull .env.production

# Remover deployment
vercel remove <deployment-url>
```

---

## ✅ Checklist de Deploy

### Antes do Deploy

- [ ] Código testado localmente
- [ ] Build passando (`npm run build`)
- [ ] Variáveis de ambiente documentadas
- [ ] Secrets de produção gerados
- [ ] Banco de dados configurado
- [ ] CORS configurado para frontend

### Durante o Deploy

- [ ] Variáveis adicionadas no Vercel
- [ ] Build passou sem erros
- [ ] Logs verificados

### Após o Deploy

- [ ] Endpoints testados (Postman/Insomnia)
- [ ] Schema aplicado no banco
- [ ] Frontend conectado com sucesso
- [ ] Monitoramento configurado
- [ ] Documentação atualizada

---

**FinançasBR Backend** - Deploy Vercel 🚀

**URL de Produção**: https://seu-projeto.vercel.app/api/v1
