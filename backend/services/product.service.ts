import { BaseService } from "./base.service";
import { Product, Inventory, ProductDisplayView } from "../types";
import sequelize from "../config/database";

export class ProductService extends BaseService<Product> {
  constructor() {
    super(Product);
  }

  // Override getAll to use the VIEW (Faster, includes computed stock)
  async getAllProductsView(page: number, limit: number, filters: any = {}) {
    const offset = (page - 1) * limit;

    const { count, rows } = await ProductDisplayView.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    return {
      data: rows,
      meta: {
        totalItems: count,
        itemsPerPage: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
  }

  // Override Create to handle Inventory Transaction
  async createWithStock(data: any, initialStock: number) {
    const t = await sequelize.transaction();
    try {
      const product = await Product.create(data, { transaction: t });

      await Inventory.create(
        {
          productId: product.id,
          quantity: initialStock,
          reserved: 0,
        },
        { transaction: t }
      );

      await t.commit();
      return product;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Override GetById to include details
  async getFullDetails(id: number) {
    return await Product.findByPk(id, {
      include: ["manufacturer", "category", "product_type", "inventory"],
    });
  }
}
