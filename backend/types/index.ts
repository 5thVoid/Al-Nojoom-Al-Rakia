import Category from "./Category";
import Manufacturer from "./Manufacturer";
import Product from "./Product";
import ProductType from "./ProductType";
import Inventory from "./Inventory";
import ProductDisplayView from "./ProductView";
import User from "./User";
import Cart from "./Cart";
import CartItem from "./CartItem";
import UserAddress from "./UserAddress";

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

  // Cart Relationships
  User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
  Cart.belongsTo(User, { foreignKey: "userId" });

  Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items", onDelete: "CASCADE" });
  CartItem.belongsTo(Cart, { foreignKey: "cartId" });

  CartItem.belongsTo(Product, { foreignKey: "productId" });
  Product.hasMany(CartItem, { foreignKey: "productId" });

  // User Address Relationships (One-to-Many: user can have multiple addresses)
  User.hasMany(UserAddress, { foreignKey: "userId", as: "addresses", onDelete: "CASCADE" });
  UserAddress.belongsTo(User, { foreignKey: "userId" });
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
  User,
  Cart,
  CartItem,
  UserAddress
};
