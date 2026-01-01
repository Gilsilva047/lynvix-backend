/**
 * Middleware de tratamento de erros
 *
 * Centraliza o tratamento de erros da aplicação
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Classe customizada para erros da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Middleware global de tratamento de erros
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // Erro customizado da aplicação
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Erro de validação do Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Erros do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Violação de unique constraint
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.[0] || 'campo';
      return res.status(409).json({
        success: false,
        message: `${field} já está em uso`,
      });
    }

    // Registro não encontrado
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado',
      });
    }

    // Violação de foreign key
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Referência inválida',
      });
    }
  }

  // Erro genérico do Prisma
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
    });
  }

  // Log do erro em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erro não tratado:', error);
  }

  // Erro genérico (não expõe detalhes em produção)
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack,
    }),
  });
};
