// load environment variables from .env file into process.env
import dotenv from "dotenv";

dotenv.config();

// utility function to ensure an environment variable is defined
function getEnvVarOrThrow(key: string): string {
    const value = process.env[key];

    // throw if the env var is missing or empty
    if (value === undefined || value === null || value === "") {
        throw new Error(`Environment variable "${ key }" is required but was not provided`);
    }
    return value;
}

// ====== Database configuration ======

// use full Postgres connection string (used in production)
export const DB_URL = getEnvVarOrThrow("DB_URL");

// individual Postgres connection details (used by knex config)
export const DB_HOST = getEnvVarOrThrow("DB_HOST");
export const DB_PORT = getEnvVarOrThrow("DB_PORT");
export const DB_USER = getEnvVarOrThrow("DB_USER");

// db password can be optional for local dev (empty string fallback)
export const DB_PASSWORD = process.env.DB_PASSWORD ?? "";

export const DB_NAME = getEnvVarOrThrow("DB_NAME");

// ====== JWT secrets ======
export const JWT_SECRET = getEnvVarOrThrow("JWT_SECRET");
export const REFRESH_SECRET = getEnvVarOrThrow("REFRESH_SECRET");

// ====== App environment ======
export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || "3000";

// ====== CORS / CSRF ======
export const CORS_ORIGIN = getEnvVarOrThrow("CORS_ORIGIN");