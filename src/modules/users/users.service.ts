/**
 * Service do módulo de usuários
 */

import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { hashPassword, comparePassword } from '../../utils/helpers';
import { isValidCPF } from '../../utils/validators';

interface UpdateProfileData {
  name?: string;
  cpf?: string;
  avatar?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class UsersService {
  /**
   * Busca o perfil do usuário autenticado
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }

  /**
   * Atualiza o perfil do usuário
   */
  async updateProfile(userId: string, data: UpdateProfileData) {
    const { name, cpf, avatar } = data;

    // Valida CPF se fornecido
    if (cpf && !isValidCPF(cpf)) {
      throw new AppError('CPF inválido', 400);
    }

    // Verifica se o CPF já está em uso por outro usuário
    if (cpf) {
      const existingCPF = await prisma.user.findFirst({
        where: {
          cpf,
          NOT: { id: userId },
        },
      });

      if (existingCPF) {
        throw new AppError('CPF já está em uso', 409);
      }
    }

    // Atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(cpf && { cpf }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Altera a senha do usuário
   */
  async changePassword(userId: string, data: ChangePasswordData) {
    const { currentPassword, newPassword } = data;

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verifica a senha atual
    const passwordMatch = await comparePassword(currentPassword, user.password);

    if (!passwordMatch) {
      throw new AppError('Senha atual incorreta', 401);
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualiza a senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Deleta a conta do usuário
   */
  async deleteAccount(userId: string) {
    // Deleta o usuário (cascade deleta tudo relacionado)
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Altera o status de um usuário (PENDING, ACTIVE, INACTIVE)
   */
  async updateUserStatus(userId: string, status: 'PENDING' | 'ACTIVE' | 'INACTIVE') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}

export default new UsersService();
