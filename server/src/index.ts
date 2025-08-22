import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import txRoutes from "./routes/transactionsRoutes";
import catRoutes from "./routes/categoriesRoutes";
import { CORS_ORIGIN, NODE_ENV, PORT } from "./util/envVarCheck";

// create the express app instance
const app = express();

// configure express to trust proxy (important for Render and cookie security)
app.set("trust proxy", 1);

// apply helmet middleware for setting secure headers
app.use(helmet());

// enable cors with credentials from allowed origin
app.use(cors({
    origin: CORS_ORIGIN, // http://localhost:5173 in dev
    credentials: true // allow cookies to be sent
}));

// parse incoming json requests with size limit
app.use(express.json({ limit: "100kb" }));

// parse incoming cookies from client requests
app.use(cookieParser());

// global rate limit (auth-specific limits live in the auth router)
app.use(rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 300, // max 300 requests per IP per window
    standardHeaders: "draft-7", // enable RateLimit-* headers
    legacyHeaders: false // disable deprecated headers
}));

// quick health check endpoint for monitoring services
app.get("/healthz", (_req: Request, res: Response) => res.json({ ok: true }));

// mount authentication-related routes under /api/auth
app.use("/api/auth", authRoutes);

// mount transaction routes under /api/transactions
app.use("/api/transactions", txRoutes);

// mount category routes under /api/categories
app.use("/api/categories", catRoutes);

// catch all unmatched routes and return 404 not found
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

// centralized error handler for unhandled exceptions
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (NODE_ENV !== "production") console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// start the server and listen on the specified port
app.listen(Number(PORT), () => console.log(`Server running on port ${ PORT }`));