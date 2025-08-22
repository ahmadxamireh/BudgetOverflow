import { rateLimit, ipKeyGenerator, type RateLimitRequestHandler } from "express-rate-limit";
import type { Request, Response } from "express";
import { NODE_ENV } from "../util/envVarCheck";

// normalise email from request body
const normEmail = (req: Request): string => {
    const email = (req.body?.email ?? "") as string;
    return email.trim().toLowerCase();
};

// generate IP-safe key with IPv6 support
const ipKey = (req: Request): string => `ip:${ ipKeyGenerator(req.ip ?? "") }`;

// limit registration requests per IP address
export const registerIpLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: NODE_ENV === "development" ? 1000 : 10, // up to 10 registration attempts per IP (1000 in dev mode)
    standardHeaders: true, // send RateLimit-* headers
    legacyHeaders: false, // disable legacy X-RateLimit-* headers
    message: { error: "Too many registration attempts. Please slow down." },
});

// limit failed registration attempts per email address
export const registerEmailLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    limit: 5, // 5 failed attempts per email
    keyGenerator: (req: Request): string => {
        const email = normEmail(req);
        return email ? `email:${ email }` : ipKey(req); // fallback to IP if email missing
    },
    skipSuccessfulRequests: true, // only failed attempts are counted
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response): void => {
        // generic message to avoid email enumeration
        res.status(429).json({ error: "Too many registration attempts. Try again later." });
    },
});

// limit login requests per IP address (burst limiter)
export const loginIpLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min per window
    limit: 50, // up to 50 login requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please slow down." },
});

// limit failed login attempts per email address (failure limiter)
export const loginEmailFailLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 5, // 5 failed attempts per email per window
    keyGenerator: (req: Request): string => {
        const email = normEmail(req);
        return email ? `email:${ email }` : ipKey(req); // fallback to IP
    },
    skipSuccessfulRequests: true, // only failed logins are counted
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response): void => {
        // generic message to avoid user enumeration
        res.status(429).json({ error: "Too many login attempts. Try again later." });
    },
});

// limit refresh attempts per IP per window
export const refreshLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 1000, // up to 1000 refreshes
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many token refresh requests. Please slow down." },
});