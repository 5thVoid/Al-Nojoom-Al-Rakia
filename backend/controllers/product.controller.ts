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

      // Build filters from query params
      const filters: any = {};

      // Filter by purchasable status
      if (req.query.in_stock === "true") {
        filters.isPurchasable = true;
      }

      // Filter by category
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }

      // Filter by manufacturer
      if (req.query.manufacturerId) {
        filters.manufacturerId = parseInt(req.query.manufacturerId as string);
      }

      // Filter by product type
      if (req.query.productTypeId) {
        filters.productTypeId = parseInt(req.query.productTypeId as string);
      }

      // Filter by stock label (in_stock, low_stock, out_of_stock, pre_order)
      if (req.query.stockLabel) {
        filters.stockLabel = req.query.stockLabel;
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
