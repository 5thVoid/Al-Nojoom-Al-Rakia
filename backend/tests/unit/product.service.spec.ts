import { ProductService } from "../../services/product.service";
import {
  Product,
  Inventory,
  ProductDisplayView,
  Manufacturer,
  Category,
  ProductType,
} from "../../types";
import sequelize from "../../config/database";

describe("ProductService", () => {
  let service: ProductService;
  const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

  beforeEach(() => {
    service = new ProductService();
    jest.clearAllMocks();
    jest
      .spyOn(sequelize, "transaction")
      .mockResolvedValue(mockTransaction as any);
  });


  describe("getAllProductsView", () => {
    it("should query the View model using findAndCountAll with pagination", async () => {
      // 1. Setup Mock Data (Sequelize findAndCountAll returns { rows, count })
      const mockRowData = {
        id: 1,
        stockLabel: "in_stock",
        manufacturerId: null,
        categoryId: null,
        productTypeId: null,
        isBestSelling: false,
        salesCount30d: 5,
      };
      
      const mockRows = [
        {
          toJSON: jest.fn().mockReturnValue(mockRowData),
        },
      ];
      const mockCount = 1;

      const viewSpy = jest
        .spyOn(ProductDisplayView, "findAndCountAll")
        .mockResolvedValue({ count: mockCount, rows: mockRows } as any);

      // 2. Call the service with Page (1), Limit (10), and Filters
      const page = 1;
      const limit = 10;
      const filters = { stockLabel: "in_stock" };
      
      const result = await service.getAllProductsView(page, limit, filters);

      // 3. Assert correct Sequelize parameters (limit, offset, order, where)
      expect(viewSpy).toHaveBeenCalledWith({
        where: filters,
        limit: 10,
        offset: 0, // (Page 1 - 1) * 10
        order: [['id', 'DESC']]
      });

      // 4. Assert the result matches the new Pagination Structure
      expect(result).toEqual({
        data: [
          {
            ...mockRowData,
            manufacturer: null,
            category: null,
            productType: null,
          },
        ],
        meta: {
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1
        }
      });
    });

    it("should sort by best selling when sortByBestSelling is true", async () => {
      const mockRowData = {
        id: 1,
        stockLabel: "in_stock",
        manufacturerId: null,
        categoryId: null,
        productTypeId: null,
        isBestSelling: true,
        salesCount30d: 50,
      };
      
      const mockRows = [
        {
          toJSON: jest.fn().mockReturnValue(mockRowData),
        },
      ];

      const viewSpy = jest
        .spyOn(ProductDisplayView, "findAndCountAll")
        .mockResolvedValue({ count: 1, rows: mockRows } as any);

      await service.getAllProductsView(1, 10, {}, undefined, true);

      expect(viewSpy).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['salesCount30d', 'DESC'], ['id', 'DESC']]
      });
    });
  });

  describe("getProductViewById", () => {
    it("should return populated product data when found", async () => {
      const mockRowData = {
        id: 1,
        name: "Gaming Laptop",
        sku: "LAP-001",
        price: 1999.99,
        manufacturerId: 2,
        categoryId: 3,
        productTypeId: 4,
        quantity: 5,
        stockLabel: "in_stock",
        isPurchasable: true,
        isBestSelling: false,
        salesCount30d: 2,
      };

      jest.spyOn(ProductDisplayView, "findOne").mockResolvedValue({
        toJSON: jest.fn().mockReturnValue(mockRowData),
      } as any);
      jest
        .spyOn(Manufacturer, "findByPk")
        .mockResolvedValue({ id: 2, name: "Brand" } as any);
      jest
        .spyOn(Category, "findByPk")
        .mockResolvedValue({ id: 3, name: "Laptops" } as any);
      jest
        .spyOn(ProductType, "findByPk")
        .mockResolvedValue({ id: 4, name: "Gaming" } as any);

      const result = await service.getProductViewById(1);

      expect(ProductDisplayView.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toMatchObject({
        id: 1,
        manufacturer: { id: 2, name: "Brand" },
        category: { id: 3, name: "Laptops" },
        productType: { id: 4, name: "Gaming" },
      });
    });

    it("should return null when product is not found", async () => {
      jest.spyOn(ProductDisplayView, "findOne").mockResolvedValue(null);

      const result = await service.getProductViewById(999);

      expect(result).toBeNull();
    });
  });

  describe("createWithStock", () => {
    it("should create product and inventory in a transaction", async () => {
      const productData = { name: "GPU", price: 500 };
      const initialStock = 10;
      const createdProduct = { id: 100, ...productData };

      // Spies
      const productCreateSpy = jest
        .spyOn(Product, "create")
        .mockResolvedValue(createdProduct as any);
      const inventoryCreateSpy = jest
        .spyOn(Inventory, "create")
        .mockResolvedValue({} as any);

      // Exec
      const result = await service.createWithStock(productData, initialStock);

      // Assert
      expect(productCreateSpy).toHaveBeenCalledWith(productData, {
        transaction: mockTransaction,
      });
      // Ensure Inventory is created with the new Product ID
      expect(inventoryCreateSpy).toHaveBeenCalledWith(
        { productId: 100, quantity: initialStock, reserved: 0 },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(createdProduct);
    });

    it("should rollback if product creation fails", async () => {
      jest.spyOn(Product, "create").mockRejectedValue(new Error("DB Error"));

      await expect(service.createWithStock({}, 10)).rejects.toThrow("DB Error");

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(Inventory.create).not.toHaveBeenCalled();
    });
  });
});
