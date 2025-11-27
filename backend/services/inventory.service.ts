import { Inventory } from "../types";
import sequelize from "../config/database";

export class InventoryService {
  async getStock(productId: number) {
    return await Inventory.findByPk(productId);
  }

  // Admin: Manually set stock (e.g., new shipment arrived)
  async addStock(productId: number, quantityToAdd: number) {
    // 1. Validate input
    if (quantityToAdd <= 0) {
      throw new Error("Restock quantity must be positive");
    }

    // 2. Check if inventory record exists first
    const inventory = await Inventory.findByPk(productId);
    if (!inventory) throw new Error("Product inventory not found");

    // 3. Atomic Update: SQL "UPDATE inventories SET quantity = quantity + X"
    await inventory.increment("quantity", { by: quantityToAdd });

    // 4. Return the refreshed record
    return await inventory.reload();
  }

  // User: Buy Item
  async decreaseStock(productId: number, quantity: number) {
    const t = await sequelize.transaction();
    try {
      await Inventory.increment(
        { quantity: -quantity },
        { where: { productId }, transaction: t }
      );

      const updated = await Inventory.findByPk(productId, { transaction: t });
      if (!updated || updated.quantity < 0) throw new Error("OUT_OF_STOCK");

      await t.commit();
      return updated;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
