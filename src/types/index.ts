/**
 * Tipos TypeScript compartilhados em toda a aplicação
 */

// ===== RESPOSTAS PADRÃO DA API =====

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== QUERY PARAMS =====

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface TransactionFilters extends PaginationParams, DateRangeParams {
  type?: 'INCOME' | 'EXPENSE';
  status?: 'PAID' | 'PENDING' | 'SCHEDULED';
  categoryId?: string;
  paymentMethod?: string;
  search?: string;
}

// ===== AUTH =====

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ===== DASHBOARD / RELATÓRIOS =====

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
  }>;
  topExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    date: Date;
    category: string;
  }>;
}

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  icon?: string;
  color?: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface PaymentMethodReport {
  paymentMethod: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface EvolutionData {
  month: string; // "Jan/24", "Fev/24", etc
  income: number;
  expense: number;
  balance: number;
}

// ===== BUDGET STATUS =====

export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  alert: 'none' | 'warning' | 'danger' | 'exceeded'; // <70%, 70-90%, 90-100%, >100%
}

// ===== INVOICE (FATURA DO CARTÃO) =====

export interface CardInvoice {
  cardId: string;
  cardName: string;
  month: number;
  year: number;
  total: number;
  dueDate: Date;
  closingDate: Date;
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: Date;
    installments?: string; // "3/12"
  }>;
}

// ===== CATEGORIAS PADRÃO =====

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  subcategories?: string[];
}
