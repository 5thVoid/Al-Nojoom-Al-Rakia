import Category from "./Category";
import Manufacturer from "./Manufacturer";
import Product from "./Product";
import ProductType from "./ProductType";
import Inventory from "./Inventory";
import ProductDisplayView from "./ProductView";
import User from "./User";

const initAssociations = () => {
  // Recursive Category Logic
  Category.hasMany(Category, { as: "subcategories", foreignKey: "parentId" });
  Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" });

  // Product Relationships
  Product.belongsTo(Manufacturer, { foreignKey: "manufacturerId" });
  Product.belongsTo(Category, { foreignKey: "categoryId" });
  Product.belongsTo(ProductType, { foreignKey: "productTypeId" });

  // Inventory Relationship (One-to-One)
  Product.hasOne(Inventory, { foreignKey: "productId", onDelete: "CASCADE" });
  Inventory.belongsTo(Product, { foreignKey: "productId" });
};

// Run associations immediately
initAssociations();

export {
  Category,
  Manufacturer,
  Product,
  ProductType,
  Inventory,
  ProductDisplayView,
  User
};
