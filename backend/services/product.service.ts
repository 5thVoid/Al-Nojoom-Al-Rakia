import { BaseService } from "./base.service";
import {
  Product,
  Inventory,
  ProductDisplayView,
  Manufacturer,
  Category,
  ProductType,
  OrderItem,
} from "../types";
import sequelize from "../config/database";
import { Op } from "sequelize";

export class ProductService extends BaseService<Product> {
  constructor() {
    super(Product);
  }

  // Override getAll to use the VIEW (Faster, includes computed stock)
  async getAllProductsView(
    page: number,
    limit: number,
    filters: any = {},
    searchTerm?: string,
    sortByBestSelling: boolean = false
  ) {
    const offset = (page - 1) * limit;

    // If search term is provided, use full-text search on Product model
    // Otherwise use the optimized view
    if (searchTerm && searchTerm.trim()) {
      return this.searchProducts(
        page,
        limit,
        filters,
        searchTerm,
        sortByBestSelling
      );
    }

    // Determine sort order: best selling first or default by ID
    const orderBy = sortByBestSelling
      ? [
          ["salesCount30d", "DESC"],
          ["id", "DESC"],
        ]
      : [["id", "DESC"]];

    const { count, rows } = await ProductDisplayView.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: orderBy as any,
    });

    // Populate manufacturer, category, and productType names
    const populatedRows = await Promise.all(
      rows.map((row) => this.hydrateProductViewRow(row.toJSON()))
    );

    return {
      data: populatedRows,
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

  // Override GetById to include details from the optimized view
  async getFullDetails(id: number) {
    return this.getProductViewById(id);
  }

  async getProductViewById(id: number) {
    const row = await ProductDisplayView.findOne({ where: { id } });
    if (!row) return null;
    return this.hydrateProductViewRow(row.toJSON());
  }

  // Full-text search on products
  async searchProducts(
    page: number,
    limit: number,
    filters: any = {},
    searchTerm: string,
    sortByBestSelling: boolean = false
  ) {
    const offset = (page - 1) * limit;

    // Build WHERE conditions using Sequelize
    const whereConditions: any = {
      [Op.and]: [
        sequelize.literal(
          `search_vector @@ plainto_tsquery('simple', ${sequelize.escape(
            searchTerm
          )})`
        ),
      ],
    };

    if (filters.categoryId) {
      whereConditions.categoryId = filters.categoryId;
    }
    if (filters.manufacturerId) {
      whereConditions.manufacturerId = filters.manufacturerId;
    }
    if (filters.productTypeId) {
      whereConditions.productTypeId = filters.productTypeId;
    }

    // Build the query using Sequelize ORM
    const searchOptions: any = {
      attributes: [
        "id",
        "name",
        "sku",
        "price",
        "categoryId",
        "manufacturerId",
        "productTypeId",
        "stockStatusOverride",
        [
          sequelize.literal(`
            CASE 
              WHEN "Product"."stock_status_override" IS NOT NULL THEN CAST("Product"."stock_status_override" AS TEXT)
              WHEN COALESCE("Inventory"."quantity", 0) > 5 THEN 'in_stock'
              WHEN COALESCE("Inventory"."quantity", 0) > 0 THEN 'low_stock'
              ELSE 'out_of_stock'
            END
          `),
          "stockLabel",
        ],
        [
          sequelize.literal(`
            CASE 
              WHEN COALESCE("Inventory"."quantity", 0) > 0 OR "Product"."stock_status_override" = 'pre_order' THEN true
              ELSE false
            END
          `),
          "isPurchasable",
        ],
        [
          sequelize.literal(`
            CASE 
              WHEN COALESCE(
                (SELECT SUM(oi.quantity) 
                 FROM order_items oi 
                 WHERE oi.product_id = "Product"."id" 
                 AND oi.created_at >= NOW() - INTERVAL '30 days'
                ), 0
              ) >= 10 THEN true
              ELSE false
            END
          `),
          "isBestSelling",
        ],
        [
          sequelize.literal(`
            COALESCE(
              (SELECT SUM(oi.quantity) 
               FROM order_items oi 
               WHERE oi.product_id = "Product"."id" 
               AND oi.created_at >= NOW() - INTERVAL '30 days'
              ), 0
            )
          `),
          "salesCount30d",
        ],
        [
          sequelize.literal(
            `ts_rank(search_vector, plainto_tsquery('simple', ${sequelize.escape(
              searchTerm
            )}))`
          ),
          "rank",
        ],
      ],
      include: [
        {
          model: Inventory,
          attributes: ["quantity", "reserved"],
          required: false,
        },
      ],
      where: whereConditions,
      limit,
      offset,
      subQuery: false,
      raw: false,
    };

    // Apply filters for best selling and purchasable if needed
    if (filters.isBestSelling) {
      searchOptions.having = sequelize.literal(`
        COALESCE(
          (SELECT SUM(oi.quantity) 
           FROM order_items oi 
           WHERE oi.product_id = "Product"."id" 
           AND oi.created_at >= NOW() - INTERVAL '30 days'
          ), 0
        ) >= 10
      `);
    }

    if (filters.isPurchasable) {
      whereConditions[Op.or] = [
        sequelize.literal(`COALESCE("Inventory"."quantity", 0) > 0`),
        { stockStatusOverride: "pre_order" },
      ];
    }

    // Determine sort order
    if (sortByBestSelling) {
      searchOptions.order = [
        [sequelize.literal("sales_count_30d"), "DESC"],
        [sequelize.literal("rank"), "DESC"],
        ["id", "DESC"],
      ];
    } else {
      searchOptions.order = [
        [sequelize.literal("rank"), "DESC"],
        ["id", "DESC"],
      ];
    }

    const { count, rows } = await Product.findAndCountAll(searchOptions);

    // Populate manufacturer, category, and productType names
    const populatedRows = await Promise.all(
      rows.map(async (product) => {
        const productData = product.toJSON() as any;

        const [manufacturer, category, productType] = await Promise.all([
          productData.manufacturerId
            ? Manufacturer.findByPk(productData.manufacturerId)
            : null,
          productData.categoryId
            ? Category.findByPk(productData.categoryId)
            : null,
          productData.productTypeId
            ? ProductType.findByPk(productData.productTypeId)
            : null,
        ]);

        return {
          id: productData.id,
          name: productData.name,
          sku: productData.sku,
          price: productData.price,
          categoryId: productData.categoryId,
          manufacturerId: productData.manufacturerId,
          productTypeId: productData.productTypeId,
          stockStatusOverride: productData.stockStatusOverride,
          quantity: productData.Inventory?.quantity || 0,
          stockLabel: productData.stockLabel,
          isPurchasable: productData.isPurchasable,
          isBestSelling: productData.isBestSelling,
          salesCount30d: productData.salesCount30d,
          manufacturer: manufacturer
            ? { id: manufacturer.id, name: manufacturer.name }
            : null,
          category: category ? { id: category.id, name: category.name } : null,
          productType: productType
            ? { id: productType.id, name: productType.name }
            : null,
        };
      })
    );

    return {
      data: populatedRows,
      meta: {
        totalItems: count,
        itemsPerPage: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
  }

  private async hydrateProductViewRow(rowData: any) {
    const [manufacturer, category, productType] = await Promise.all([
      rowData.manufacturerId
        ? Manufacturer.findByPk(rowData.manufacturerId)
        : null,
      rowData.categoryId ? Category.findByPk(rowData.categoryId) : null,
      rowData.productTypeId
        ? ProductType.findByPk(rowData.productTypeId)
        : null,
    ]);

    return {
      ...rowData,
      manufacturer: manufacturer
        ? { id: manufacturer.id, name: manufacturer.name }
        : null,
      category: category ? { id: category.id, name: category.name } : null,
      productType: productType
        ? { id: productType.id, name: productType.name }
        : null,
    };
  }
}
