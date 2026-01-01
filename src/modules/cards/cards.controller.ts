import { Request, Response, NextFunction } from 'express';
import cardsService from './cards.service';

class CardsController {
  async getAllCards(req: Request, res: Response, next: NextFunction) {
    try {
      const cards = await cardsService.getAllCards(req.userId!);
      return res.json({ success: true, data: cards });
    } catch (error) {
      next(error);
    }
  }

  async getCardById(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await cardsService.getCardById(req.userId!, req.params.id);
      return res.json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  }

  async createCard(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await cardsService.createCard(req.userId!, req.body);
      return res.status(201).json({ success: true, message: 'Cartão criado', data: card });
    } catch (error) {
      next(error);
    }
  }

  async updateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await cardsService.updateCard(req.userId!, req.params.id, req.body);
      return res.json({ success: true, message: 'Cartão atualizado', data: card });
    } catch (error) {
      next(error);
    }
  }

  async deleteCard(req: Request, res: Response, next: NextFunction) {
    try {
      await cardsService.deleteCard(req.userId!, req.params.id);
      return res.json({ success: true, message: 'Cartão deletado' });
    } catch (error) {
      next(error);
    }
  }

  async getCardInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const invoice = await cardsService.getCardInvoice(req.userId!, id, month, year);
      return res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }
}

export default new CardsController();
