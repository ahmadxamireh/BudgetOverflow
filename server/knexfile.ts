import type { Knex } from "knex";
import { DB_URL, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "./src/util/envVarCheck";

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "pg",
        connection: {
            host: DB_HOST,
            port: Number(DB_PORT),
            user: DB_USER,
            password: DB_PASSWORD || undefined,
            database: DB_NAME
        },
        migrations: { directory: "./migrations" },
        seeds: { directory: "./seeds" }
    },
    production: {
        client: "pg",
        connection: {
            connectionString: DB_URL!,
            ssl: { rejectUnauthorized: false },
        },
        migrations: { directory: "./migrations" },
        seeds: { directory: "./seeds" }
    },
};

export default config;