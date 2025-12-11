import { Transaction } from "sequelize";
import sequelize from "../config/database";
import Cart from "../types/Cart";
import CartItem from "../types/CartItem";
import Product from "../types/Product";
import Inventory from "../types/Inventory";

interface CartItemInput {
  productId: number;
  quantity: number;
}

interface CartWithItems extends Cart {
  items: CartItem[];
}

export class CartService {
  /**
   * Get or create a cart for a user
   */
  async getOrCreateCart(userId: number): Promise<Cart> {
    const [cart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
    });
    return cart;
  }

  /**
   * Get full cart with items and product details
   */
  async getCart(userId: number): Promise<{
    cart: Cart;
    items: CartItem[];
    totals: { subtotal: number; itemCount: number };
  }> {
    const cart = await this.getOrCreateCart(userId);

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "sku", "price", "imageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Calculate totals
    const totals = items.reduce(
      (acc, item) => {
        const price = Number((item.Product as any)?.price || 0);
        acc.subtotal += price * item.quantity;
        acc.itemCount += item.quantity;
        return acc;
      },
      { subtotal: 0, itemCount: 0 }
    );

    // Round subtotal to 2 decimal places
    totals.subtotal = Math.round(totals.subtotal * 100) / 100;

    return { cart, items, totals };
  }

  /**
   * Add item to cart or update quantity if already exists
   */
  async addItem(
    userId: number,
    productId: number,
    quantity: number = 1
  ): Promise<CartItem> {
    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    // Verify product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
      await existingItem.save();
      return existingItem;
    }

    // Create new cart item
    return await CartItem.create({
      cartId: cart.id,
      productId,
      quantity,
    });
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(
    userId: number,
    productId: number,
    quantity: number
  ): Promise<CartItem | null> {
    if (quantity < 1) {
      // If quantity is 0 or less, remove the item
      await this.removeItem(userId, productId);
      return null;
    }

    const cart = await this.getOrCreateCart(userId);

    const item = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!item) {
      throw new Error("Item not found in cart");
    }

    item.quantity = quantity;
    await item.save();
    return item;
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: number, productId: number): Promise<boolean> {
    const cart = await this.getOrCreateCart(userId);

    const deletedCount = await CartItem.destroy({
      where: { cartId: cart.id, productId },
    });

    return deletedCount > 0;
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: number): Promise<boolean> {
    const cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      return false;
    }

    await CartItem.destroy({
      where: { cartId: cart.id },
    });

    return true;
  }

  /**
   * Get cart item count
   */
  async getItemCount(userId: number): Promise<number> {
    const cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      return 0;
    }

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      attributes: ["quantity"],
    });

    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Validate cart items have sufficient stock
   * Returns items that don't have enough stock
   */
  async validateStock(
    userId: number
  ): Promise<{ valid: boolean; invalidItems: any[] }> {
    const { items } = await this.getCart(userId);

    const invalidItems: any[] = [];

    for (const item of items) {
      const inventory = await Inventory.findOne({
        where: { productId: item.productId },
      });

      if (!inventory || inventory.quantity < item.quantity) {
        invalidItems.push({
          productId: item.productId,
          productName: (item.Product as any)?.name,
          requestedQuantity: item.quantity,
          availableQuantity: inventory?.quantity || 0,
        });
      }
    }

    return {
      valid: invalidItems.length === 0,
      invalidItems,
    };
  }
}

export const cartService = new CartService();
