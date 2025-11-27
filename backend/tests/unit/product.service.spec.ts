import { ProductService } from "../../services/product.service";
import { Product, Inventory, ProductDisplayView } from "../../types";
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
      const mockRows = [{ id: 1, stockLabel: "in_stock" }];
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
        data: mockRows,
        meta: {
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1
        }
      });
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
