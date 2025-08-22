import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // enable gen_random_uuid()
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // USERS
    await knex.schema.createTable("users", (t) => {
        t.increments("id").primary(); // PK
        t.string("first_name").notNullable(); // user's first name
        t.string("last_name").notNullable(); // user's last name
        t.string("email").notNullable().unique(); // exact-case unique
        t.string("password_hash").notNullable(); // bcrypt hash
        t.timestamps(true, true); // created_at/updated_at
    });

    // Case-insensitive unique email (prevents "A@x.com" vs "a@x.com")
    await knex.schema.raw(`
        CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
            ON users (LOWER (email));
    `);

    // CATEGORIES (hybrid)
    await knex.schema.createTable("categories", (t) => {
        t.increments("id").primary(); // PK
        t.integer("user_id").nullable().references("users.id").onDelete("CASCADE"); // NULL = global
        t.string("name").notNullable(); // category display name
        // no timestamps needed, keep minimal
    });

    // Uniqueness:
    await knex.schema.raw(`
        CREATE UNIQUE INDEX IF NOT EXISTS categories_global_name_unique
            ON categories (name)
            WHERE user_id IS NULL;
    `);
    await knex.schema.raw(`
        CREATE UNIQUE INDEX IF NOT EXISTS categories_user_name_unique
            ON categories (user_id, name)
            WHERE user_id IS NOT NULL;
    `);

    // Postgres enum for transaction type
    await knex.schema.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'txn_type') THEN
        CREATE TYPE txn_type AS ENUM ('income', 'expense');
      END IF;
    END$$;
  `);

    // TRANSACTIONS
    await knex.schema.createTable("transactions", (t) => {
        t.increments("id").primary(); // PK
        t.integer("user_id").notNullable().references("users.id").onDelete("CASCADE"); // owner
        t.integer("category_id").nullable().references("categories.id").onDelete("SET NULL"); // optional category
        t.string("title").notNullable(); // short description/title
        t.decimal("amount", 14, 2).notNullable(); // positive amount
        t.specificType("type", "txn_type").notNullable(); // 'income' | 'expense'
        t.date("date").notNullable().defaultTo(knex.fn.now()); // transaction calendar date
        t.text("note"); // optional free-text note
        t.timestamps(true, true); // created_at/updated_at

        t.index([ "user_id", "date" ]); // accelerate per-user date queries
        t.index([ "user_id", "category_id" ]); // accelerate per-user category filters
    });

    // amount > 0
    await knex.schema.raw(`
        ALTER TABLE transactions
            ADD CONSTRAINT transactions_amount_positive CHECK (amount > 0);
    `);

    // signed_amount (computed)
    await knex.schema.raw(`
        ALTER TABLE transactions
            ADD COLUMN signed_amount NUMERIC(14, 2)
                GENERATED ALWAYS AS (
                    CASE type
                        WHEN 'income' THEN amount
                        WHEN 'expense' THEN -amount
                        END
                    ) STORED;
    `);

    // ==== MINIMAL REFRESH TOKENS (single-use) ====
    await knex.schema.createTable("refresh_tokens", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()")); // PK as UUID
        t.integer("user_id").notNullable().references("users.id").onDelete("CASCADE"); // owner
        t.text("token_hash").notNullable().unique(); // SHA-256 of the raw token
        t.timestamp("expires_at", { useTz: true }).notNullable(); // TTL
        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now()); // created at
    });

    await knex.schema.alterTable("refresh_tokens", (t) => {
        t.index([ "user_id" ], "refresh_tokens_user_id_idx"); // user lookups
        t.index([ "expires_at" ], "refresh_tokens_expires_at_idx"); // expiry sweeps
    });
}

export async function down(knex: Knex): Promise<void> {
    // drop refresh tokens first (depends on users)
    await knex.schema.dropTableIfExists("refresh_tokens");

    await knex.schema.dropTableIfExists("transactions");
    await knex.schema.dropTableIfExists("categories");
    await knex.schema.dropTableIfExists("users");

    await knex.schema.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'txn_type') THEN
        DROP TYPE txn_type;
      END IF;
    END$$;
  `);
}