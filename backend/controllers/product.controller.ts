import { BaseController } from "./base.controller";
import { ProductService } from "../services/product.service";
import { InventoryService } from "../services/inventory.service";
import { Request, Response, NextFunction } from "express";

export class ProductController extends BaseController<ProductService> {
  private prodService: ProductService;
  private invService: InventoryService;

  constructor() {
    const service = new ProductService();
    super(service);
    this.prodService = service;
    this.invService = new InventoryService();
  }

  // Override Create to handle stock
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { initialStock, ...productData } = req.body;
      const result = await this.prodService.createWithStock(
        productData,
        initialStock || 0
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  // Override GetAll to use View
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Optional: Handle filtering (e.g. ?in_stock=true)
      const filters: any = {};
      if (req.query.in_stock === "true") {
        filters.isPurchasable = true;
      }

      const result = await this.prodService.getAllProductsView(
        page,
        limit,
        filters
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  // Buy Action
  buy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.invService.decreaseStock(
        Number(req.params.id),
        1
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  // Admin Restock
  restock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quantity } = req.body;

      // Call addStock instead of adjustStock
      const result = await this.invService.addStock(
        Number(req.params.id),
        quantity
      );

      res.json({
        message: "Restock successful",
        newStockLevel: result.quantity,
      });
    } catch (err) {
      next(err);
    }
  };
}
