import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
    listTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from "../controllers/transactionsController";

// create a new express router instance
const router = Router();

// protect all routes below with jwt auth middleware
router.use(authenticateToken);

// handle fetching user transactions (supports filters and pagination)
router.get("/", listTransactions);

// handle creating a new transaction for the authenticated user
router.post("/", createTransaction);

// handle updating an existing transaction by id
router.patch("/:id", updateTransaction);

// handle deleting a transaction by id
router.delete("/:id", deleteTransaction);

// export the router for use in main app
export default router;