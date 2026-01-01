/**
 * Rotas do módulo de usuários
 */

import { Router } from 'express';
import usersController from './users.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { updateProfileSchema, changePasswordSchema } from './users.validator';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/v1/users/me
router.get('/me', usersController.getProfile);

// PUT /api/v1/users/me
router.put('/me', validate(updateProfileSchema), usersController.updateProfile);

// PUT /api/v1/users/me/password
router.put('/me/password', validate(changePasswordSchema), usersController.changePassword);

// DELETE /api/v1/users/me
router.delete('/me', usersController.deleteAccount);

// PATCH /api/v1/users/:userId/status
// Altera o status de um usuário (para administradores)
router.patch('/:userId/status', usersController.updateUserStatus);

export default router;
