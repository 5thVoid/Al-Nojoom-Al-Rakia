import { Router } from "express";
import manufacturerRoutes from "./manufacturer.routes";
import productTypeRoutes from "./productType.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/manufacturers", manufacturerRoutes);
router.use("/product-types", productTypeRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/auth", authRoutes);

export default router;
