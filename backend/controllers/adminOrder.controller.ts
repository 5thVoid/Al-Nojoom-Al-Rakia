import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { orderAnalyticsService } from "../services/orderAnalytics.service";

export class AdminOrderController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await orderService.listOrders(page, limit, {
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        status: req.query.status as string,
        period: (req.query.period as any) || undefined,
        date: req.query.date as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  detail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.getOrderById(Number(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  analytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await orderAnalyticsService.getSummary({
        period: (req.query.period as any) || undefined,
        date: req.query.date as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };
}

export const adminOrderController = new AdminOrderController();
