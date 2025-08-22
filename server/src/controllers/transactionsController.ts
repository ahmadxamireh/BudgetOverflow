import type { Request, Response } from "express";
import db from "../config/knex";
import { isValidIsoDate, isValidTxType, num } from "../util/txValidation";

// define extended request type with user object injected by auth middleware
type AuthedRequest = Request & { user?: { id: number } };

// PostgreSQL returns NUMERIC fields as strings by default for precision
// convert transaction amount from string to number for frontend use
function normalizeAmount<T extends { amount: any }>(tx: T): T & { amount: number } {
    return { ...tx, amount: Number(tx.amount) };
}

// handle GET /api/transactions?from={}&to={}&categoryId={}&type={}&page={}&limit={}
export const listTransactions = async (req: AuthedRequest, res: Response) => {
    try {
        // ensure request is authenticated
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id; // authenticated user id (from middleware)

        // parse pagination with defaults + caps
        const pageNum = Math.max(1, num(req.query.page) || 1);
        const limitNum = Math.min(100, num(req.query.limit) || 20);

        // filter query strings
        const from = req.query.from as string | undefined; // date lower bound (inclusive)
        const to = req.query.to as string | undefined; // date upper bound (inclusive)
        const categoryIdRaw = req.query.categoryId as string | undefined;
        const type = req.query.type as string | undefined; // "income" | "expense"

        // validate filters with early exit if things are wrong
        if (from && !isValidIsoDate(from)) return res.status(400).json({ error: "Invalid 'from' date." });
        if (to && !isValidIsoDate(to)) return res.status(400).json({ error: "Invalid 'to' date." });
        if (type && !isValidTxType(type)) return res.status(400).json({ error: "Invalid 'type'." });

        // coerce categoryId to number if present
        const categoryId = categoryIdRaw ? Number(categoryIdRaw) : undefined;
        if (categoryIdRaw && Number.isNaN(categoryId)) return res.status(400).json({ error: "Invalid 'categoryId'." });

        // base query: enforce row ownership (only this user's rows)
        const q = db("transactions").where({ user_id: userId });

        // apply filters if provided to query
        if (from) q.andWhere("date", ">=", from);
        if (to) q.andWhere("date", "<=", to);
        if (categoryId) q.andWhere("category_id", "=", categoryId);
        if (type) q.andWhere("type", "=", type);

        // total count for pagination metadata
        const [ { count } ] = await q.clone().count<{ count: string }>({ count: "*" });
        const total = Number(count); // total matching rows
        const pages = Math.max(1, Math.ceil(total / limitNum)); // total transaction pages
        const offset = (pageNum - 1) * limitNum; // rows to skip for each page (page 1 first 10 tx, page 2 second 10 tx)

        // fetch paginated results, sorted by date descending
        const data = await q.clone()
            .orderBy("date", "desc")
            .limit(limitNum)
            .offset(offset)
            .select(
                "id", "title", "amount", "type", "date", "note",
                "category_id as categoryId", "created_at as createdAt"
            );

        // convert all amount fields from string to number
        const normalized = data.map(normalizeAmount);

        // respond with paginated transaction data
        return res.json({ data: normalized, pagination: { page: pageNum, limit: limitNum, total, pages } });
    } catch (err: any) {
        console.error("listTransactions error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// handle POST /api/transactions to create a new transaction
export const createTransaction = async (req: AuthedRequest, res: Response) => {
    try {
        // ensure request is authenticated
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;

        // extract fields from request body
        const { title, amount, type, date, categoryId, note } = req.body as {
            title?: string; amount?: number | string; type?: string; date?: string;
            categoryId?: number | string, note?: string | null;
        };

        // validate title
        if (!title || title.trim() === "") return res.status(400).json({ error: "Title is required." });
        const cleanTitle = title.trim(); // normalise title once

        // validate amount
        const amt = num(amount);
        if (Number.isNaN(amt) || amt <= 0) return res.status(400).json({ error: "Amount must be > 0." });

        // validate type
        if (!isValidTxType(type)) return res.status(400).json({ error: "Type must be 'income' or 'expense'." });

        // validate date
        if (!date || !isValidIsoDate(date)) return res.status(400).json({ error: "Invalid date." });

        // validate category: categoryId must be provided and numeric
        if (categoryId == null) return res.status(400).json({ error: "Valid categoryId required." });
        const categoryIdNum = Number(categoryId);
        if (Number.isNaN(categoryIdNum)) return res.status(400).json({ error: "Valid categoryId required." });

        // verify category is accessible (global user_id NULL or belongs to this user)
        const category = await db("categories")
            .where(function () { // scope: global OR user-owned
                this.whereNull("user_id").orWhere("user_id", userId);
            })
            .andWhere({ id: categoryIdNum })
            .first();

        if (!category) return res.status(400).json({ error: "Category not found or not accessible." });

        // insert new transaction row
        const [ created ] = await db("transactions")
            .insert({
                user_id: userId, // enforce ownership from server-side
                category_id: categoryIdNum, // FK to categories
                title: cleanTitle,
                amount: amt,
                type,
                date,
                note: note?.trim() || null
            })
            .returning([
                "id", "title", "amount", "type", "date", "note",
                "category_id as categoryId", "created_at as createdAt"
            ]);

        // return created row with converted amount
        return res.status(201).json({ message: "Transaction created successfully.", data: normalizeAmount(created) });
    } catch (err: any) {
        console.error("createTransaction error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// handle PATCH /api/transactions/:id to update a transaction
export const updateTransaction = async (req: AuthedRequest, res: Response) => {
    try {
        // ensure request is authenticated
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;

        // extract transaction id from url
        const id = Number(req.params.id);
        if (Number.isNaN(id)) // reject if id is not a number
            return res.status(400).json({ error: "Invalid id." });

        // extract optional fields from body
        const payload = req.body as Partial<{
            title: string; amount: number | string; type: string; date: string;
            categoryId: number | string | null, note: string | null;
        }>;

        // collect valid fields to update
        const updates: Record<string, unknown> = {};

        // validate and add title
        if (payload.title !== undefined) { // field present in request
            const clean = payload.title.trim(); // normalise
            if (!clean) return res.status(400).json({ error: "Title cannot be empty." });
            updates.title = clean;  // add to updates
        }

        // validate and add amount
        if (payload.amount !== undefined) {
            const amt = num(payload.amount); // coerce to number
            if (Number.isNaN(amt) || amt <= 0) return res.status(400).json({ error: "Amount must be > 0." });
            updates.amount = amt; // add to updates
        }

        // validate and add type (must be "income" or "expense")
        if (payload.type !== undefined) {
            const t = payload.type.trim().toLowerCase();
            if (!isValidTxType(t)) return res.status(400).json({ error: "Invalid type." });
            updates.type = t; // add to updates
        }

        // validate and add date
        if (payload.date !== undefined) {
            if (!isValidIsoDate(payload.date)) return res.status(400).json({ error: "Invalid date." });
            updates.date = payload.date; // add to updates
        }

        // update note
        if (payload.note !== undefined) {
            updates.note = payload.note?.trim() || null;  // add to updates
        }

        // handle optional category update (including null to clear)
        if (payload.categoryId !== undefined) {
            if (payload.categoryId === null) {
                updates.category_id = null;
            } else {
                const categoryIdNum = Number(payload.categoryId); // coerce to number
                if (Number.isNaN(categoryIdNum)) return res.status(400).json({ error: "Valid categoryId required." });

                // verify category accessible (global or user-owned)
                const category = await db("categories")
                    .where(function () {
                        this.whereNull("user_id").orWhere("user_id", userId); // must be global or owned by user
                    })
                    .andWhere({ id: categoryIdNum })
                    .first();

                if (!category) return res.status(400).json({ error: "Category not found or not accessible." });
                updates.category_id = categoryIdNum; // add to updates (DB column name uses snake_case)
            }
        }

        // reject request if no valid fields were given
        if (Object.keys(updates).length === 0)
            return res.status(400).json({ error: "No valid fields to update." });

        // update the transaction in DB
        const [ updated ] = await db("transactions")
            .where({ id, user_id: userId })  // enforce row ownership
            .update(updates) // set only the validated fields
            .returning([
                "id", "title", "amount", "type", "date", "note",
                "category_id as categoryId", "created_at as createdAt"
            ]);

        if (!updated) return res.status(404).json({ error: "Transaction not found." }); // not found or not owned

        // return the updated transaction with amount converted to number
        return res.json({ message: "Transaction updated successfully.", data: normalizeAmount(updated) });
    } catch (err: any) {
        console.error("updateTransaction error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// handle DELETE /api/transactions/:id to remove a transaction
export async function deleteTransaction(req: AuthedRequest, res: Response) {
    try {
        // ensure request is authenticated
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;

        // extract transaction id from url
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id." });

        // delete transaction if it belongs to the authenticated user
        const [ deleted ] = await db("transactions")
            .where({ id, user_id: userId }) // enforce ownership
            .delete()
            .returning([ "id" ]);

        // if no row was deleted, transaction doesn't exist or doesn't belong to user
        if (!deleted) return res.status(404).json({ error: "Transaction not found." });

        // return deleted transaction id to the client
        return res.json({ id: deleted.id });
    } catch (err: any) {
        console.error("deleteTransaction error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}