import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // 1. remove all existing global categories (user_id IS NULL) to avoid duplicates
    await knex("categories").whereNull("user_id").del();

    // 2. insert common global categories
    await knex("categories").insert([
        // income categories
        { user_id: null, name: "Salary" },
        { user_id: null, name: "Business" },
        { user_id: null, name: "Investments" },
        { user_id: null, name: "Gifts" },
        { user_id: null, name: "Other Income" },

        // expense categories
        { user_id: null, name: "Groceries" },
        { user_id: null, name: "Utilities" },
        { user_id: null, name: "Rent" },
        { user_id: null, name: "Transportation" },
        { user_id: null, name: "Entertainment" },
        { user_id: null, name: "Dining Out" },
        { user_id: null, name: "Healthcare" },
        { user_id: null, name: "Insurance" },
        { user_id: null, name: "Education" },
        { user_id: null, name: "Travel" },
        { user_id: null, name: "Personal Care" },
        { user_id: null, name: "Miscellaneous" }
    ]);
}