import { Request, Response, NextFunction } from 'express';
import reportsService from './reports.service';

class ReportsController {
  async getMonthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      let startDate: Date;
      let endDate: Date;

      // Suporta tanto startDate/endDate quanto month/year para retrocompatibilidade
      if (req.query.startDate && req.query.endDate) {
        // Usa as datas ISO diretamente do frontend
        startDate = new Date(req.query.startDate as string);
        endDate = new Date(req.query.endDate as string);
        // Ajusta endDate para incluir o dia inteiro (23:59:59)
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Formato antigo: month/year
        const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
      }

      const summary = await reportsService.getMonthlySummaryByDates(req.userId!, startDate, endDate);
      return res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async getExpensesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      let startDate: Date;
      let endDate: Date;

      // Suporta tanto startDate/endDate quanto month/year para retrocompatibilidade
      if (req.query.startDate && req.query.endDate) {
        // Usa as datas ISO diretamente do frontend
        startDate = new Date(req.query.startDate as string);
        endDate = new Date(req.query.endDate as string);
        // Ajusta endDate para incluir o dia inteiro (23:59:59)
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Formato antigo: month/year
        const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
      }

      const report = await reportsService.getExpensesByCategoryByDates(req.userId!, startDate, endDate);
      return res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getExpensesByPaymentMethod(req: Request, res: Response, next: NextFunction) {
    try {
      let startDate: Date;
      let endDate: Date;

      // Suporta tanto startDate/endDate quanto month/year para retrocompatibilidade
      if (req.query.startDate && req.query.endDate) {
        // Usa as datas ISO diretamente do frontend
        startDate = new Date(req.query.startDate as string);
        endDate = new Date(req.query.endDate as string);
        // Ajusta endDate para incluir o dia inteiro (23:59:59)
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Formato antigo: month/year
        const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
      }

      const report = await reportsService.getExpensesByPaymentMethodByDates(req.userId!, startDate, endDate);
      return res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getEvolution(req: Request, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const evolution = await reportsService.getEvolution(req.userId!, months);
      return res.json({ success: true, data: evolution });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportsController();
