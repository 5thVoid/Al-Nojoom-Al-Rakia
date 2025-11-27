import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../config/database";

// READ-ONLY Model
class ProductDisplayView extends Model<
  InferAttributes<ProductDisplayView>,
  InferCreationAttributes<ProductDisplayView>
> {
  declare id: number;
  declare name: string;
  declare price: number;
  declare stockStatusOverride: string | null;
  declare quantity: number;
  declare stockLabel: "in_stock" | "low_stock" | "out_of_stock" | "pre_order";
  declare isPurchasable: boolean;
}

ProductDisplayView.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    stockStatusOverride: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    stockLabel: DataTypes.STRING,
    isPurchasable: DataTypes.BOOLEAN,
  },
  {
    sequelize,
    tableName: "product_display_view",
    timestamps: false,
    freezeTableName: true, // Prevent pluralization
  }
);

export default ProductDisplayView;
