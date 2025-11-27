import { InventoryService } from "../../services/inventory.service";
import { Inventory } from "../../types";
import sequelize from "../../config/database";

describe("InventoryService", () => {
  let service: InventoryService;

  // Mock Transaction Object
  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  beforeEach(() => {
    service = new InventoryService();
    jest.clearAllMocks();
    // Spy on sequelize.transaction to return our mock object
    jest
      .spyOn(sequelize, "transaction")
      .mockResolvedValue(mockTransaction as any);
  });

  describe("decreaseStock", () => {
    it("should successfully decrease stock and commit transaction", async () => {
      const productId = 1;
      const remainingStock = 5;

      // 1. Mock Increment (Static version used in service)
      jest
        .spyOn(Inventory, "increment")
        .mockResolvedValue([[undefined, 1]] as any);

      // 2. Mock findByPk returning VALID stock
      jest.spyOn(Inventory, "findByPk").mockResolvedValue({
        productId,
        quantity: remainingStock,
      } as any);

      // 3. Run
      const result = await service.decreaseStock(productId, 1);

      // 4. Assertions
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(Inventory.increment).toHaveBeenCalledWith(
        { quantity: -1 },
        { where: { productId }, transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled(); // CRITICAL
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result.quantity).toBe(remainingStock);
    });

    it("should rollback and throw error if stock drops below zero", async () => {
      const productId = 1;

      jest.spyOn(Inventory, "increment").mockResolvedValue([] as any);

      // Mock findByPk returning NEGATIVE stock
      jest.spyOn(Inventory, "findByPk").mockResolvedValue({
        productId,
        quantity: -1,
      } as any);

      // Expect the service to throw
      await expect(service.decreaseStock(productId, 1)).rejects.toThrow(
        "OUT_OF_STOCK"
      );

      // Assert Rollback
      expect(mockTransaction.rollback).toHaveBeenCalled(); // CRITICAL
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe("adjustStock", () => {
    it("should update specific product stock", async () => {
      const mockInventory = {
        update: jest.fn().mockResolvedValue({ quantity: 50 }),
      };
      jest.spyOn(Inventory, "findByPk").mockResolvedValue(mockInventory as any);

      const result = await service.addStock(1, 50);

      expect(mockInventory.update).toHaveBeenCalledWith({ quantity: 50 });
      expect(result.quantity).toBe(50);
    });

    it("should throw error if inventory record missing", async () => {
      jest.spyOn(Inventory, "findByPk").mockResolvedValue(null);

      await expect(service.addStock(1, 50)).rejects.toThrow();
    });
  });
});
