import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../util/envVarCheck";

// middleware to authenticate user based on JWT in header or cookie
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    // check for token in Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token =
        authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : req.cookies.accessToken; // fallback to cookie

    // if no token is found, reject with 401 Unauthorized
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        // verify the token and extract the payload
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

        // attach the user ID to the request object
        (req as any).user = { id: payload.userId };

        // proceed to the next middleware or route
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
}