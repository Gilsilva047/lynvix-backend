/**
 * Middleware de autenticação
 *
 * Verifica se o usuário está autenticado através do JWT
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import prisma from '../config/database';

// Estende a interface Request do Express para incluir o userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Middleware que verifica se o usuário está autenticado
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
      });
    }

    // Verifica e decodifica o token
    const decoded = verifyAccessToken(token);

    // Verifica o status do usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, status: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Verifica se a conta está ativa
    if (user.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: 'Sua conta está pendente de ativação. Aguarde a aprovação do administrador.',
      });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Sua conta foi desativada. Entre em contato com o suporte.',
      });
    }

    // Adiciona os dados do usuário na request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
  }
};
