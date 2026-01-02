/**
 * Configuração do Express App
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';

// Importar todas as rotas
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import transactionsRoutes from './modules/transactions/transactions.routes';
import cardsRoutes from './modules/cards/cards.routes';
import accountsRoutes from './modules/accounts/accounts.routes';
import goalsRoutes from './modules/goals/goals.routes';
import budgetsRoutes from './modules/budgets/budgets.routes';
import reportsRoutes from './modules/reports/reports.routes';

const app: Application = express();

// ===== MIDDLEWARES =====

// Segurança
app.use(helmet());

// CORS
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:3000',
  'http://localhost:5173', // Vite
  'https://lyvinx-frontend-20.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: Postman, mobile apps)
      if (!origin) return callback(null, true);

      // Permite origens da lista
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Permite qualquer subdomínio do Vercel em produção
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Rate limiting (limita requisições)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos',
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== ROTAS =====

// Rota de health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'FinançasBR API - Backend de controle financeiro pessoal',
    version: '1.0.0',
    status: 'online',
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API v1
const API_V1 = '/api/v1';

app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/users`, usersRoutes);
app.use(`${API_V1}/categories`, categoriesRoutes);
app.use(`${API_V1}/transactions`, transactionsRoutes);
app.use(`${API_V1}/cards`, cardsRoutes);
app.use(`${API_V1}/accounts`, accountsRoutes);
app.use(`${API_V1}/goals`, goalsRoutes);
app.use(`${API_V1}/budgets`, budgetsRoutes);
app.use(`${API_V1}/reports`, reportsRoutes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

// ===== MIDDLEWARE DE ERRO (deve ser o último) =====
app.use(errorHandler);

export default app;
