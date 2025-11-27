import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();
const controller = new CategoryController();

router.get("/tree", controller.getTree); // Specialized endpoint first
router.get("/", controller.getAll); // Flat list
router.get("/:id", controller.getOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
