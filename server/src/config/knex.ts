import knex from "knex";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../util/envVarCheck";

// initialize and configure knex connection
const db = knex({
    client: "pg",
    connection: {
        host: DB_HOST,
        port: Number(DB_PORT),
        user: DB_USER,
        password: DB_PASSWORD || undefined,
        database: DB_NAME
    }
});

export default db;