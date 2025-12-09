import { Router } from "express";
import adminUserRoutes from "./adminUser.routes";
import adminOrderRoutes from "./adminOrder.routes";

const router = Router();

router.use("/users", adminUserRoutes);
router.use("/orders", adminOrderRoutes);

export default router;
