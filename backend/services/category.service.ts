import { BaseService } from "./base.service";
import { Category } from "../types";

export class CategoryService extends BaseService<Category> {
  constructor() {
    super(Category);
  }

  async getTree() {
    return await Category.findAll({
      where: { parentId: null },
      include: [
        {
          model: Category,
          as: "subcategories",
          include: [{ model: Category, as: "subcategories" }], // 3 levels deep
        },
      ],
    });
  }
}
