import { Request, Response, NextFunction } from 'express';
import accountsService from './accounts.service';

class AccountsController {
  async getAllAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await accountsService.getAllAccounts(req.userId!);
      return res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await accountsService.getAccountById(req.userId!, req.params.id);
      return res.json({ success: true, data: account });
    } catch (error) {
      next(error);
    }
  }

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await accountsService.createAccount(req.userId!, req.body);
      return res.status(201).json({ success: true, message: 'Conta criada', data: account });
    } catch (error) {
      next(error);
    }
  }

  async updateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await accountsService.updateAccount(req.userId!, req.params.id, req.body);
      return res.json({ success: true, message: 'Conta atualizada', data: account });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      await accountsService.deleteAccount(req.userId!, req.params.id);
      return res.json({ success: true, message: 'Conta deletada' });
    } catch (error) {
      next(error);
    }
  }

  async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const transfer = await accountsService.createTransfer(req.userId!, req.body);
      return res.status(201).json({
        success: true,
        message: 'Transferência realizada',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AccountsController();
