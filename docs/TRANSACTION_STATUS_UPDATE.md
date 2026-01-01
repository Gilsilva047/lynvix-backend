# Documentação - Atualização de Status de Transações

## Visão Geral

Esta funcionalidade permite atualizar o status de uma transação (PENDING, SCHEDULED, PAID) de forma isolada, com atualização automática do saldo da conta bancária associada.

---

## Endpoint

### PATCH `/api/v1/transactions/:id/status`

Atualiza apenas o status de uma transação específica.

**Autenticação:** Obrigatória (Bearer Token)

---

## Requisição

### Parâmetros de URL

| Parâmetro | Tipo   | Obrigatório | Descrição                    |
|-----------|--------|-------------|------------------------------|
| `id`      | UUID   | Sim         | ID da transação a atualizar  |

### Body

```json
{
  "status": "PAID" | "PENDING" | "SCHEDULED"
}
```

| Campo    | Tipo   | Obrigatório | Descrição                                    |
|----------|--------|-------------|----------------------------------------------|
| `status` | string | Sim         | Novo status da transação (PAID/PENDING/SCHEDULED) |

---

## Respostas

### Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Status da transação atualizado com sucesso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Compra no supermercado",
    "amount": 150.50,
    "date": "2025-12-21T10:00:00.000Z",
    "type": "EXPENSE",
    "status": "PAID",
    "paymentMethod": "DEBIT_CARD",
    "categoryId": "660e8400-e29b-41d4-a716-446655440001",
    "bankAccountId": "770e8400-e29b-41d4-a716-446655440002",
    "creditCardId": null,
    "isRecurring": false,
    "recurrenceFreq": null,
    "recurrenceEnd": null,
    "installments": null,
    "installmentNum": null,
    "notes": "",
    "tags": ["mercado", "alimentação"],
    "userId": "880e8400-e29b-41d4-a716-446655440003",
    "createdAt": "2025-12-20T08:00:00.000Z",
    "updatedAt": "2025-12-21T15:30:00.000Z",
    "category": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Alimentação",
      "icon": "🍔",
      "color": "#FF5733"
    },
    "bankAccount": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Conta Corrente",
      "bank": "Banco do Brasil"
    },
    "creditCard": null
  }
}
```

### Erro - Transação não encontrada (404 Not Found)

```json
{
  "success": false,
  "error": "Transação não encontrada"
}
```

### Erro - Validação (400 Bad Request)

```json
{
  "success": false,
  "errors": [
    {
      "field": "status",
      "message": "Status deve ser PAID, PENDING ou SCHEDULED"
    }
  ]
}
```

### Erro - Não autorizado (401 Unauthorized)

```json
{
  "success": false,
  "error": "Token não fornecido"
}
```

---

## Comportamento Detalhado

### 1. Validações

- Verifica se a transação existe no banco de dados
- Verifica se a transação pertence ao usuário autenticado
- Valida se o status informado é um dos valores aceitos: `PAID`, `PENDING`, `SCHEDULED`

### 2. Atualização de Saldo

A funcionalidade atualiza automaticamente o saldo da conta bancária associada quando aplicável:

#### Cenário 1: Status muda de PENDING → PAID

- Se a transação tem `bankAccountId` associado:
  - **INCOME**: Adiciona o valor ao saldo da conta
  - **EXPENSE**: Subtrai o valor do saldo da conta

**Exemplo:**
```
Transação: R$ 500,00 (EXPENSE)
Status anterior: PENDING
Status novo: PAID
Conta antes: R$ 1.000,00
Conta depois: R$ 500,00 (descontado)
```

#### Cenário 2: Status muda de PAID → PENDING

- Se a transação tem `bankAccountId` associado:
  - **INCOME**: Remove o valor do saldo da conta
  - **EXPENSE**: Adiciona o valor de volta ao saldo da conta

**Exemplo:**
```
Transação: R$ 500,00 (EXPENSE)
Status anterior: PAID
Status novo: PENDING
Conta antes: R$ 500,00
Conta depois: R$ 1.000,00 (estornado)
```

#### Cenário 3: Outras mudanças de status

- Mudanças entre PENDING ↔ SCHEDULED: Não afeta o saldo
- Mudanças de PAID → SCHEDULED: Reverte o saldo
- Mudanças de SCHEDULED → PAID: Aplica o saldo

### 3. Transação do Banco de Dados

Todas as operações são executadas em uma transação do Prisma, garantindo:
- Atomicidade: Ou todas as operações são executadas, ou nenhuma
- Consistência: O saldo da conta sempre reflete corretamente o status das transações

---

## Exemplos de Uso

### Exemplo 1: Marcar transação pendente como paga

**Requisição:**
```bash
curl -X PATCH \
  http://localhost:3000/api/v1/transactions/550e8400-e29b-41d4-a716-446655440000/status \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "PAID"
  }'
```

### Exemplo 2: Reverter transação paga para pendente

**Requisição:**
```bash
curl -X PATCH \
  http://localhost:3000/api/v1/transactions/550e8400-e29b-41d4-a716-446655440000/status \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "PENDING"
  }'
```

### Exemplo 3: Agendar uma transação

**Requisição:**
```bash
curl -X PATCH \
  http://localhost:3000/api/v1/transactions/550e8400-e29b-41d4-a716-446655440000/status \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "SCHEDULED"
  }'
```

---

## Integração com Frontend

### JavaScript/TypeScript

```typescript
async function updateTransactionStatus(transactionId: string, status: 'PAID' | 'PENDING' | 'SCHEDULED') {
  const token = localStorage.getItem('token'); // ou sua forma de armazenar o token

  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/transactions/${transactionId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar status');
    }

    console.log('Status atualizado:', data.data);
    return data.data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}

// Uso
updateTransactionStatus('550e8400-e29b-41d4-a716-446655440000', 'PAID')
  .then(transaction => {
    console.log('Transação atualizada com sucesso!', transaction);
    // Atualizar UI
  })
  .catch(error => {
    console.error('Falha ao atualizar:', error);
    // Mostrar mensagem de erro
  });
```

### React Example

```tsx
import { useState } from 'react';

function TransactionStatusButton({ transactionId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/v1/transactions/${transactionId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus(newStatus);
        alert('Status atualizado com sucesso!');
      } else {
        alert(data.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={loading}
      >
        <option value="PENDING">Pendente</option>
        <option value="SCHEDULED">Agendado</option>
        <option value="PAID">Pago</option>
      </select>
      {loading && <span>Atualizando...</span>}
    </div>
  );
}
```

---

## Arquivos Modificados

### 1. `src/modules/transactions/transactions.validator.ts`
- Adicionado: `updateTransactionStatusSchema` (linha 81)

### 2. `src/modules/transactions/transactions.service.ts`
- Adicionado: `updateTransactionStatus()` (linha 290)

### 3. `src/modules/transactions/transactions.controller.ts`
- Adicionado: `updateTransactionStatus()` (linha 108)

### 4. `src/modules/transactions/transactions.routes.ts`
- Adicionado: Rota PATCH `/:id/status` (linha 34)

---

## Observações Importantes

1. **Segurança**: O endpoint verifica se a transação pertence ao usuário autenticado antes de permitir qualquer alteração

2. **Consistência**: Usa transações do banco de dados para garantir que o saldo da conta e o status da transação sejam atualizados de forma atômica

3. **Cartão de Crédito**: Transações com cartão de crédito não afetam o saldo da conta bancária automaticamente, pois seguem o ciclo de fatura do cartão

4. **Validação**: O status deve ser exatamente um dos três valores aceitos (case-sensitive): `PAID`, `PENDING`, `SCHEDULED`

5. **Idempotência**: Atualizar uma transação para o mesmo status atual não causará erros, mas também não fará alterações

---

## Possíveis Melhorias Futuras

- [ ] Adicionar webhook/notificação quando o status é alterado
- [ ] Histórico de mudanças de status
- [ ] Validação de regras de negócio específicas (ex: não permitir marcar como PAID transações futuras)
- [ ] Integração com sistema de notificações por email/SMS
- [ ] Logs de auditoria para rastreamento de alterações

---

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação completa da API
- Código fonte em: `src/modules/transactions/`
- Schema do banco de dados em: `prisma/schema.prisma`
