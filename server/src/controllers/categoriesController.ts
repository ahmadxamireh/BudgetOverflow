import type { Request, Response } from "express";
import db from "../config/knex";

// extend express request to include user id from auth middleware
type AuthedRequest = Request & { user?: { id: number } };

// handle GET /api/categories
export async function listCategories(req: AuthedRequest, res: Response) {
    try {
        // return unauthorized if no user found on request
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        // extract authenticated user id
        const userId = req.user.id;

        // query global and user-owned categories sorted by name
        const cats = await db("categories")
            .whereNull("user_id") // get global categories (user_id is null)
            .orWhere("user_id", userId) // get categories created by this user
            .orderByRaw(
                "CASE WHEN user_id IS NULL THEN 0 ELSE 1 END, name asc" // sort global first, then user categories
            )
            .select("id", "name", "user_id as userId"); // select category fields

        // return the combined list of categories
        return res.json({ message: "Categories fetched successfully", data: cats });
    } catch (err: any) {
        // log and return generic error
        console.error("listCategories error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// handle POST /api/categories
export async function createCategory(req: AuthedRequest, res: Response) {
    try {
        // return unauthorized if no user found on request
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        // extract authenticated user id
        const userId = req.user.id;

        // extract category name from request body
        const { name } = req.body as { name?: string };

        // clean and trim name
        const cleanName = (name ?? "").trim();

        // validate presence of name
        if (!cleanName) return res.status(400).json({ error: "Name is required." });

        // check if category already exists (case-insensitive)
        const exists = await db("categories")
            .whereRaw("LOWER(name) = LOWER(?)", [ cleanName ])
            .andWhere(function () {
                // match global or user-specific categories
                this.whereNull("user_id").orWhere("user_id", userId);
            })
            .first();

        // return conflict if category already exists
        if (exists) return res.status(409).json({ error: "Category already exists." });

        // insert the new category for the user
        const [ created ] = await db("categories")
            .insert({ name: cleanName, user_id: userId })
            .returning([ "id", "name", "user_id as userId" ]);

        // return created category
        return res.status(201).json({ message: "Category created successfully.", data: created });
    } catch (err: any) {
        // log and return generic error
        console.error("createCategory error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}