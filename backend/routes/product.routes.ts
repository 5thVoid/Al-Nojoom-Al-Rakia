import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const controller = new ProductController();

// Public
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);

// Protected: Only Admin can Create/Update/Delete
router.post(
  "/",
  authenticate,
  authorize("createAny", "product"),
  controller.create
);

router.put(
  "/:id",
  authenticate,
  authorize("updateAny", "product"),
  controller.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("deleteAny", "product"),
  controller.delete
);

// Protected: Authenticated users can buy
router.post(
  "/:id/buy",
  authenticate,
  (req, res, next) => next(),
  controller.buy
);

// Protected: Only Admin can Restock
router.post(
  "/:id/restock",
  authenticate,
  authorize("updateAny", "inventory"),
  controller.restock
);

export default router;
