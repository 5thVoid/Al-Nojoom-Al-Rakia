import { Router } from "express";
import manufacturerRoutes from "./manufacturer.routes";
import productTypeRoutes from "./productType.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import authRoutes from "./auth.routes";
import cartRoutes from "./cart.routes";
import userAddressRoutes from "./userAddress.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/manufacturers", manufacturerRoutes);
router.use("/product-types", productTypeRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/addresses", userAddressRoutes);
router.use("/admin", adminRoutes);

export default router;
