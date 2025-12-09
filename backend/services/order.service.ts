import { Op, Transaction } from "sequelize";
import sequelize from "../config/database";
import {
  Cart,
  CartItem,
  Inventory,
  Order,
  OrderItem,
  Product,
  User,
} from "../types";
import { buildDateRange, DatePeriod } from "../utils/dateRange";

interface OrderFilters {
  userId?: number;
  status?: string;
  period?: DatePeriod;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export class OrderService {
  private toPlain(order: Order | null) {
    return order ? order.get({ plain: true }) : null;
  }

  private async getCartWithItems(userId: number, transaction: Transaction) {
    const [cart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, attributes: ["id", "name", "price"] }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    return { cart, items };
  }

  async checkout(userId: number) {
    const t = await sequelize.transaction();
    try {
      const { cart, items } = await this.getCartWithItems(userId, t);

      if (!items.length) {
        throw new Error("Cart is empty");
      }

      const productIds = items.map((item) => item.productId);
      const inventories = await Inventory.findAll({
        where: { productId: productIds },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      const inventoryMap = new Map(
        inventories.map((inv) => [inv.productId, inv])
      );

      for (const item of items) {
        const inventory = inventoryMap.get(item.productId);
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${item.productId}`
          );
        }
      }

      const subtotal = items.reduce((total, item) => {
        const price = Number((item.Product as any)?.price || 0);
        return total + price * item.quantity;
      }, 0);

      const order = await Order.create(
        {
          userId,
          subtotal,
          tax: 0,
          total: subtotal,
          currency: "SAR",
          status: "pending",
          paymentStatus: "unpaid",
          placedAt: new Date(),
        },
        { transaction: t }
      );

      await OrderItem.bulkCreate(
        items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: (item.Product as any)?.price || 0,
        })),
        { transaction: t }
      );

      for (const item of items) {
        await Inventory.increment(
          { quantity: -item.quantity },
          { where: { productId: item.productId }, transaction: t }
        );
      }

      await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

      const created = await Order.findByPk(order.id, {
        include: [
          { model: OrderItem, as: "items" },
          { model: User, as: "user", attributes: ["id", "email", "role"] },
        ],
        transaction: t,
      });

      await t.commit();
      return this.toPlain(created);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async listOrders(page = 1, limit = 10, filters: OrderFilters = {}) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.period && filters.period !== "all") {
      const range = buildDateRange(filters.period, {
        date: filters.date,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      if (range.start && range.end) {
        where.placedAt = {
          [Op.between]: [range.start, range.end],
        };
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "email", "role"] },
        { model: OrderItem, as: "items" },
      ],
      order: [["placedAt", "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows.map((row) => row.get({ plain: true })),
      meta: {
        totalItems: count,
        itemsPerPage: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
  }

  async getOrderById(id: number) {
    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "email", "role"] },
        { model: OrderItem, as: "items" },
      ],
    });
    return this.toPlain(order);
  }
}

export const orderService = new OrderService();
