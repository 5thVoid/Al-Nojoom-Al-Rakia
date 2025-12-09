import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import type OrderItem from "./OrderItem";

export type OrderStatus = "pending" | "processing" | "completed" | "canceled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare status: OrderStatus;
  declare paymentStatus: PaymentStatus;
  declare currency: string;
  declare subtotal: number;
  declare tax: number;
  declare total: number;
  declare metadata: CreationOptional<Record<string, any> | null>;
  declare placedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare user?: NonAttribute<User>;
  declare items?: NonAttribute<OrderItem[]>;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "canceled"),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "paid", "refunded"),
      field: "payment_status",
      defaultValue: "unpaid",
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "SAR",
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    placedAt: {
      type: DataTypes.DATE,
      field: "placed_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "orders",
    underscored: true,
  }
);

export default Order;
