import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { listCategories, createCategory } from "../controllers/categoriesController";

// create a new express router instance
const router = Router();

// protect all routes in this file using JWT authentication
router.use(authenticateToken);

// handle GET /api/categories to list global + user-owned categories
router.get("/", listCategories);

// handle POST /api/categories to create a new user-specific category
router.post("/", createCategory);

// export the router for use in main route file
export default router;