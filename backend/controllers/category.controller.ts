import { BaseController } from "./base.controller";
import { CategoryService } from "../services/category.service";
import { Request, Response, NextFunction } from "express";

export class CategoryController extends BaseController<CategoryService> {
  private catService: CategoryService;

  constructor() {
    const service = new CategoryService();
    super(service);
    this.catService = service;
  }

  // Custom Endpoint for Tree View
  getTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tree = await this.catService.getTree();
      res.json(tree);
    } catch (err) {
      next(err);
    }
  };
}
