import { Router } from "express";
import {
    getMe,
    loginUser,
    logoutUser,
    refreshToken,
    registerUser,
    updateUserProfile,
    changeUserPassword
} from "../controllers/authController";
import {
    loginEmailFailLimiter,
    loginIpLimiter,
    refreshLimiter,
    registerEmailLimiter,
    registerIpLimiter
} from "../middleware/rateLimits";
import checkOrigin from "../middleware/checkOrigin";
import { authenticateToken } from "../middleware/auth";

// create a new express router
const router = Router();

// handle user registration with both IP and email rate limits
router.post("/register", registerIpLimiter, registerEmailLimiter, registerUser);

// handle user login with IP-based and failed email login rate limits
router.post("/login", loginIpLimiter, loginEmailFailLimiter, loginUser);

// handle access token refresh with origin check and refresh limiter
router.post("/refresh", checkOrigin, refreshLimiter, refreshToken);

// return current logged-in user info if authenticated
router.get("/me", authenticateToken, getMe);

// update user's first and last name (requires auth)
router.patch("/profile", authenticateToken, updateUserProfile);

// allow authenticated user to change their password
router.post("/change-password", authenticateToken, changeUserPassword);

// log out user by deleting refresh token and clearing cookies (requires origin check)
router.post("/logout", checkOrigin, logoutUser);

// export the router for use in app
export default router;