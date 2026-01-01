/**
 * Service do módulo de autenticação
 * Contém toda a lógica de negócio
 */

import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { hashPassword, comparePassword } from '../../utils/helpers';
import { isValidCPF } from '../../utils/validators';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../config/jwt';
import { LoginResponse, RefreshTokenResponse } from '../../types';
import { addDays } from 'date-fns';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf?: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    const { name, email, password, cpf } = data;

    // Valida CPF se fornecido
    if (cpf && !isValidCPF(cpf)) {
      throw new AppError('CPF inválido', 400);
    }

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email já cadastrado', 409);
    }

    // Verifica se o CPF já existe (se fornecido)
    if (cpf) {
      const existingCPF = await prisma.user.findUnique({
        where: { cpf },
      });

      if (existingCPF) {
        throw new AppError('CPF já cadastrado', 409);
      }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf: cpf || null,
      },
    });

    // Gera tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Salva o refresh token no banco
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: addDays(new Date(), 7), // 7 dias
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
      },
    };
  }

  /**
   * Faz login de um usuário
   */
  async login(data: LoginData): Promise<LoginResponse> {
    const { email, password } = data;

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Verifica a senha
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Verifica o status da conta
    if (user.status === 'PENDING') {
      throw new AppError('Sua conta está pendente de ativação. Aguarde a aprovação do administrador.', 403);
    }

    if (user.status === 'INACTIVE') {
      throw new AppError('Sua conta foi desativada. Entre em contato com o suporte.', 403);
    }

    // Gera tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Salva o refresh token no banco
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: addDays(new Date(), 7),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
      },
    };
  }

  /**
   * Atualiza os tokens usando o refresh token
   */
  async refreshToken(oldRefreshToken: string): Promise<RefreshTokenResponse> {
    // Verifica se o refresh token é válido
    const decoded = verifyRefreshToken(oldRefreshToken);

    // Busca o refresh token no banco
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
    });

    if (!storedToken) {
      throw new AppError('Refresh token inválido', 401);
    }

    // Verifica se não expirou
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expirado', 401);
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Gera novos tokens
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Remove o refresh token antigo
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Salva o novo refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: addDays(new Date(), 7),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout (invalida o refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Solicita recuperação de senha
   * TODO: Implementar envio de email
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return;
    }

    // TODO: Gerar token de recuperação e enviar email
    console.log('TODO: Enviar email de recuperação de senha para:', email);
  }

  /**
   * Redefine a senha
   * TODO: Implementar validação do token de recuperação
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Validar token de recuperação
    console.log('TODO: Implementar reset de senha com token:', token);

    const hashedPassword = await hashPassword(newPassword);

    // TODO: Atualizar senha do usuário
    console.log('Nova senha hasheada:', hashedPassword);
  }
}

export default new AuthService();
