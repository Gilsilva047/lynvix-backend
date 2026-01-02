# Guia de Conexão com a API

Este documento explica como conectar seu frontend (React, Next.js, Vue, etc.) com o backend FinançasBR.

## 📡 URLs da API

### Desenvolvimento (Local)
```
http://localhost:3333/api/v1
```

### Produção (Vercel)
```
https://seu-projeto.vercel.app/api/v1
```

> **Nota**: Substitua `seu-projeto` pelo nome real do seu projeto no Vercel.

---

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)** para autenticação. Todos os endpoints (exceto registro e login) exigem um token de acesso.

### Fluxo de Autenticação

1. **Registro ou Login** → Recebe `accessToken` e `refreshToken`
2. **Armazenar tokens** → localStorage, cookies, ou gerenciador de estado
3. **Enviar token** → Em todas as requisições autenticadas
4. **Renovar token** → Quando o `accessToken` expirar (15 minutos)

### Exemplo de Headers

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🚀 Exemplos de Integração

### 1. JavaScript Puro (Fetch API)

#### Configuração Base

```javascript
const API_URL = 'http://localhost:3333/api/v1';

// Armazenar tokens
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

// Helper para fazer requisições
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // Se token expirou, tenta renovar
  if (response.status === 401) {
    const renewed = await renewAccessToken();
    if (renewed) {
      // Tenta novamente com novo token
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      return fetch(url, config);
    }
  }

  return response;
}
```

#### Registro de Usuário

```javascript
async function register(name, email, password) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (data.success) {
    // Salvar tokens
    accessToken = data.data.accessToken;
    refreshToken = data.data.refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return data.data.user;
  }

  throw new Error(data.message);
}
```

#### Login

```javascript
async function login(email, password) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    accessToken = data.data.accessToken;
    refreshToken = data.data.refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return data.data.user;
  }

  throw new Error(data.message);
}
```

#### Renovar Token

```javascript
async function renewAccessToken() {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success) {
      accessToken = data.data.accessToken;
      refreshToken = data.data.refreshToken;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return true;
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
  }

  return false;
}
```

#### Buscar Transações

```javascript
async function getTransactions(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await apiRequest(`/transactions?${queryParams}`);
  const data = await response.json();

  return data.data;
}

// Uso
const transactions = await getTransactions({
  type: 'EXPENSE',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  page: 1,
  limit: 20
});
```

---

### 2. Axios (Recomendado)

#### Instalação

```bash
npm install axios
```

#### Configuração com Interceptors

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para renovar token quando expirar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          'http://localhost:3333/api/v1/auth/refresh-token',
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh falhou, redirecionar para login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

#### Exemplos de Uso

```javascript
// Registro
const register = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  return data.data.user;
};

// Login
const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  return data.data.user;
};

// Buscar perfil
const getProfile = async () => {
  const { data } = await api.get('/users/me');
  return data.data;
};

// Criar transação
const createTransaction = async (transactionData) => {
  const { data } = await api.post('/transactions', transactionData);
  return data.data;
};

// Listar categorias
const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data.data;
};

// Buscar resumo mensal
const getMonthlySummary = async (month, year) => {
  const { data } = await api.get('/reports/summary', {
    params: { month, year }
  });
  return data.data;
};
```

---

### 3. React + Context API

#### Criar Context de Autenticação

```javascript
// contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        try {
          const { data } = await api.get('/users/me');
          setUser(data.data);
        } catch (error) {
          localStorage.clear();
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);

    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Hook Personalizado

```javascript
// hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
```

#### Usar no Componente

```javascript
// pages/Dashboard.js
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const { data } = await api.get('/transactions');
    setTransactions(data.data);
  };

  return (
    <div>
      <h1>Bem-vindo, {user?.name}</h1>
      <button onClick={logout}>Sair</button>

      {/* Lista de transações */}
    </div>
  );
}
```

---

### 4. Next.js (App Router)

#### Configuração de API Route

```javascript
// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export async function GET(request: NextRequest, { params }: any) {
  const path = params.path.join('/');
  const token = request.headers.get('authorization');

  const response = await fetch(`${API_URL}/${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: token }),
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: any) {
  const path = params.path.join('/');
  const token = request.headers.get('authorization');
  const body = await request.json();

  const response = await fetch(`${API_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: token }),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

---

## 🔒 Segurança e Boas Práticas

### 1. Armazenamento de Tokens

#### ✅ Recomendado
- **HttpOnly Cookies** (mais seguro contra XSS)
- **Secure + SameSite** cookies

#### ⚠️ Aceitável (com cuidado)
- **localStorage** (vulnerável a XSS, mas mais simples)
- **sessionStorage** (melhor que localStorage)

#### ❌ Evitar
- Variáveis globais JavaScript
- Cookies sem flags de segurança

### 2. CORS

O backend já está configurado com CORS. Para desenvolvimento local, certifique-se de que seu frontend está na lista de origens permitidas.

### 3. HTTPS em Produção

Sempre use HTTPS em produção. O Vercel fornece isso automaticamente.

### 4. Rate Limiting

A API tem rate limiting configurado. Não faça mais de 100 requisições por 15 minutos da mesma origem.

---

## 📊 Tratamento de Erros

### Formato de Resposta de Erro

```json
{
  "success": false,
  "message": "Mensagem do erro",
  "error": "CODIGO_DO_ERRO"
}
```

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `409` - Conflito (ex: email já existe)
- `422` - Validação falhou
- `429` - Rate limit excedido
- `500` - Erro interno do servidor

### Exemplo de Tratamento

```javascript
try {
  const response = await api.post('/transactions', data);
  return response.data;
} catch (error) {
  if (error.response) {
    // Erro da API
    switch (error.response.status) {
      case 400:
        alert('Dados inválidos');
        break;
      case 401:
        alert('Sessão expirada. Faça login novamente');
        redirectToLogin();
        break;
      case 422:
        alert(`Validação: ${error.response.data.message}`);
        break;
      default:
        alert('Erro ao processar requisição');
    }
  } else if (error.request) {
    // Sem resposta do servidor
    alert('Servidor não respondeu. Verifique sua conexão');
  } else {
    // Erro na configuração da requisição
    console.error('Erro:', error.message);
  }
}
```

---

## 🌐 Variáveis de Ambiente

### Frontend (.env.local)

```env
# URL da API
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1

# Produção
# NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app/api/v1
```

### Usando no Código

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';
```

---

## 📝 Checklist de Integração

- [ ] Instalar biblioteca HTTP (axios/fetch)
- [ ] Configurar baseURL da API
- [ ] Implementar sistema de autenticação
- [ ] Adicionar interceptors para tokens
- [ ] Configurar renovação automática de tokens
- [ ] Implementar tratamento de erros
- [ ] Configurar CORS no backend (se necessário)
- [ ] Testar todos os endpoints principais
- [ ] Adicionar loading states
- [ ] Implementar feedback visual de erros
- [ ] Configurar variáveis de ambiente
- [ ] Testar em produção

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se o backend está rodando (`http://localhost:3333`)
2. Confira os logs no console do navegador
3. Valide se os tokens estão sendo enviados corretamente
4. Teste os endpoints diretamente (Postman, Insomnia, Thunder Client)
5. Verifique a documentação completa no [README.md](../README.md)

---

**FinançasBR Backend** - API de Controle Financeiro 🚀
