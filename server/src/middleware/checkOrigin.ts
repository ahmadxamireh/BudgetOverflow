import { Request, Response, NextFunction } from "express";
import { CORS_ORIGIN } from "../util/envVarCheck";

// middleware to verify the request origin before allowing sensitive actions (like token refresh)
// it guards routes like /api/auth/refresh against CSRF attacks.
export default function checkOrigin(req: Request, res: Response, next: NextFunction) {
    // get allowed frontend origin from env
    const allowed = CORS_ORIGIN;

    // extract Origin or Referer from request headers
    const origin = req.get("Origin") || req.get("Referer") || "";

    // deny request if the origin does not match the allowed origin
    if (allowed && origin && !origin.startsWith(allowed)) {
        return res.status(403).json({ error: "Forbidden origin" });
    }

    // proceed to the next middleware or route
    next();
}