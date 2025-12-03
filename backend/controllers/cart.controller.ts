import { Request, Response, NextFunction } from "express";
import { cartService } from "../services/cart.service";

export class CartController {
  /**
   * GET /cart
   * Get the current user's cart with all items
   */
  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const result = await cartService.getCart(userId);

      res.json({
        cartId: result.cart.id,
        items: result.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          product: item.Product,
          quantity: item.quantity,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        totals: result.totals,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /cart/items
   * Add an item to cart
   * Body: { productId: number, quantity?: number }
   */
  addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: "productId is required" });
      }

      const item = await cartService.addItem(userId, productId, quantity);

      res.status(201).json({
        message: "Item added to cart",
        item: {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    } catch (err: any) {
      if (err.message === "Product not found") {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  };

  /**
   * PUT /cart/items/:productId
   * Update item quantity
   * Body: { quantity: number }
   */
  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const productId = Number(req.params.productId);
      const { quantity } = req.body;

      if (quantity === undefined || quantity === null) {
        return res.status(400).json({ error: "quantity is required" });
      }

      const item = await cartService.updateItemQuantity(
        userId,
        productId,
        quantity
      );

      if (!item) {
        return res.json({ message: "Item removed from cart" });
      }

      res.json({
        message: "Item quantity updated",
        item: {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    } catch (err: any) {
      if (err.message === "Item not found in cart") {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  };

  /**
   * DELETE /cart/items/:productId
   * Remove an item from cart
   */
  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const productId = Number(req.params.productId);

      const removed = await cartService.removeItem(userId, productId);

      if (!removed) {
        return res.status(404).json({ error: "Item not found in cart" });
      }

      res.json({ message: "Item removed from cart" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /cart
   * Clear all items from cart
   */
  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;

      await cartService.clearCart(userId);

      res.json({ message: "Cart cleared" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /cart/count
   * Get the number of items in cart
   */
  getItemCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const count = await cartService.getItemCount(userId);

      res.json({ count });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /cart/validate
   * Validate that all cart items have sufficient stock
   */
  validateCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const result = await cartService.validateStock(userId);

      if (!result.valid) {
        return res.status(400).json({
          valid: false,
          message: "Some items have insufficient stock",
          invalidItems: result.invalidItems,
        });
      }

      res.json({
        valid: true,
        message: "All items have sufficient stock",
      });
    } catch (err) {
      next(err);
    }
  };
}

export const cartController = new CartController();
