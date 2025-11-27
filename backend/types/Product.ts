import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import Manufacturer from "./Manufacturer";
import Category from "./Category";
import ProductType from "./ProductType";

class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare sku: string;
  declare price: number;
  declare specs: Record<string, any>;
  declare stockStatusOverride: CreationOptional<
    "pre_order" | "discontinued" | null
  >;

  // Foreign Keys
  declare manufacturerId: ForeignKey<Manufacturer["id"]>;
  declare categoryId: ForeignKey<Category["id"]>;
  declare productTypeId: ForeignKey<ProductType["id"]>;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, unique: true, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    specs: { type: DataTypes.JSONB, defaultValue: {} },
    stockStatusOverride: {
      type: DataTypes.ENUM(
        "pre_order",
        "discontinued",
        "call_for_availability"
      ),
      allowNull: true,
    },
  },
  { sequelize, tableName: "products" }
);

export default Product;
