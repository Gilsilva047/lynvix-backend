/**
 * Controller do módulo de usuários
 */

import { Request, Response, NextFunction } from 'express';
import usersService from './users.service';

class UsersController {
  /**
   * GET /api/v1/users/me
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const user = await usersService.getProfile(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/me
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const user = await usersService.updateProfile(userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/me/password
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      await usersService.changePassword(userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/users/me
   */
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      await usersService.deleteAccount(userId);

      return res.status(200).json({
        success: true,
        message: 'Conta deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:userId/status
   * Altera o status de um usuário (apenas para administradores)
   */
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!status || !['PENDING', 'ACTIVE', 'INACTIVE'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido. Use: PENDING, ACTIVE ou INACTIVE',
        });
      }

      const user = await usersService.updateUserStatus(userId, status);

      return res.status(200).json({
        success: true,
        message: 'Status do usuário atualizado com sucesso',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();
