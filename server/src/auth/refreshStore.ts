import crypto from "crypto"; // for secure token generation and hashing
import db from "../config/knex"; // for DB queries

// define refresh token time-to-live (7 days in milliseconds)
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// generate a cryptographically secure random token (not stored in DB directly)
export function generateRawRefresh(): string {
    // generate a 48-byte base64url string (~64 characters)
    return crypto.randomBytes(48).toString("base64url");
}

// hash the token using SHA-256 before storing in DB (avoid storing raw tokens)
export function hashToken(raw: string): string {
    return crypto.createHash("sha256").update(raw).digest("base64url");
}

// insert a hashed refresh token into the database for a specific user
export async function insertRefreshToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await db("refresh_tokens").insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
    });
}

// find a refresh token in the database by its hashed value
export async function findByHash(tokenHash: string): Promise<{
    id: string;
    user_id: number;
    token_hash: string;
    expires_at: Date;
    created_at: Date;
} | undefined> {
    return db("refresh_tokens")
        .where({ token_hash: tokenHash })
        .first();
}

// delete a refresh token from the database by its hashed value
export async function deleteByHash(tokenHash: string): Promise<void> {
    await db("refresh_tokens")
        .where({ token_hash: tokenHash })
        .del();
}