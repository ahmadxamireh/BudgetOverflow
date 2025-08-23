import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nameCheck from "../util/nameCheck";
import isValidEmail from "../util/emailCheck";
import isStrongPassword from "../util/passwordCheck";
import db from "../config/knex";
import { JWT_SECRET, NODE_ENV } from "../util/envVarCheck";
import {
    deleteByHash,
    findByHash,
    generateRawRefresh,
    hashToken,
    insertRefreshToken,
    REFRESH_TTL_MS
} from "../auth/refreshStore";

// handle user registration
export const registerUser = async (req: Request, res: Response) => {
    try {
        // extract inputs from request body
        let { firstName, lastName, email, password } = req.body as {
            firstName?: string;
            lastName?: string;
            email?: string;
            password?: string;
        };

        // ensure all fields are present
        if (!firstName || !lastName || !email || !password)
            return res.status(400).json({ error: "First name, last name, email and password are required!" });

        // trim and normalize inputs
        firstName = firstName.trim();
        lastName = lastName.trim();
        email = email.trim().toLowerCase();

        // validate first name
        if (firstName.length < 2 || firstName.length > 20 || !nameCheck(firstName))
            return res.status(400).json({
                error: "First name is invalid! Must be at least 2 characters long and has no symbols!"
            });

        // validate last name
        if (lastName.length < 2 || lastName.length > 20 || !nameCheck(lastName))
            return res.status(400).json({
                error: "Last name is invalid! Must be at least 2 characters long and has no symbols!"
            });

        // validate email
        if (email.length > 254 || !isValidEmail(email))
            return res.status(400).json({ error: "Email format is invalid!" });

        // validate password strength
        if (!isStrongPassword(password))
            return res.status(400).json({
                error: "Password must be between 8-20 characters and include uppercase, lowercase, number, and special character."
            });

        // check for duplicate email in database
        const existingEmail = await db("users").select("email").where({ email }).first();
        if (existingEmail)
            return res.status(409).json({ error: "Email already exists!" });

        // hash the password securely
        const passwordHash = await bcrypt.hash(password, 10);

        // insert user into database
        const [ newUser ] = await db("users")
            .insert({
                first_name: firstName,
                last_name: lastName,
                email: email,
                password_hash: passwordHash
            })
            .returning([ "id", "first_name", "last_name", "email", "created_at" ]);

        // send success response with user data
        return res.status(201).json({
            message: "New user has been registered!",
            user: {
                id: newUser.id,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                email: newUser.email,
                createdAt: newUser.created_at,
            }
        });
    } catch (err: any) {
        // handle unique violation race (Postgres) in the case of two users simultaneously registered with the same email
        if (err?.code === "23505") {
            return res.status(409).json({ error: "Email already exists!" });
        }
        // handle all other errors
        console.error("Registration error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// constant hash of a fake password for consistent bcrypt timing
const DUMMY_HASH = "$2b$10$0pX4S9b0h6sKQm0m6w9gOe1m3r6yK4u7XH2l2XwRZ7k0mSBU1rQ6C";

// handle user login
export const loginUser = async (req: Request, res: Response) => {
    try {
        // extract login fields from request body
        let { email, password } = req.body as {
            email?: string;
            password?: string;
        };

        // return error if either field is missing
        if (!email || !password)
            return res.status(400).json({ error: "Email and password are required!" });

        // trim and normalize the email
        email = email.trim().toLowerCase();

        // validate email format
        if (email.length > 254 || !isValidEmail(email))
            return res.status(400).json({ error: "Email format is invalid!" });

        // fetch user by email
        const existingUser = await db("users")
            .select("id", "password_hash")
            .where({ email })
            .first();

        // use real hash if user exists, dummy otherwise
        const hashToCompare = existingUser?.password_hash ?? DUMMY_HASH;

        // compare password input to hash
        const isMatch = await bcrypt.compare(password, hashToCompare);

        // return error if no match or no user
        if (!existingUser || !isMatch)
            return res.status(401).json({ error: "Invalid email or password." });

        // define jwt claims
        const jwtOpts = { issuer: "budget-overflow.api", audience: "budget-overflow.client" } as const;

        // generate access token
        const accessToken = jwt.sign(
            { sub: String(existingUser.id), userId: existingUser.id },
            JWT_SECRET,
            { expiresIn: "15m", ...jwtOpts }
        );

        // generate a raw refresh token
        const rawRefresh = generateRawRefresh();

        // hash the refresh token
        const refreshHash = hashToken(rawRefresh);

        // insert hashed token into DB
        await insertRefreshToken(existingUser.id, refreshHash, new Date(Date.now() + REFRESH_TTL_MS));

        // set secure http-only access token cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,     // must be true for SameSite=none {secure: NODE_ENV === "production",}
            sameSite: "none", // allow cross-site usage
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        // set secure http-only refresh token cookie
        res.cookie("refreshToken", rawRefresh, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/api/auth/refresh",
            maxAge: REFRESH_TTL_MS,
        });

        // respond with success message
        return res.json({ message: "Login successful" });
    } catch (err: any) {
        // catch and log any unexpected errors
        console.error("Login error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// handle refresh token rotation and re-authentication
export const refreshToken = async (req: Request, res: Response) => {
    try {
        // get the raw refresh token from cookie
        const raw = req.cookies.refreshToken;

        // clear the cookie and return if missing
        if (!raw) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/api/auth/refresh",
            });
            return res.status(403).json({ error: "Missing refresh token." });
        }

        // hash the raw token to lookup in database
        const tokenHash = hashToken(raw);

        // find token row in the database
        const row = await findByHash(tokenHash);

        // if not found, treat as expired or reused and clear cookie
        if (!row) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/api/auth/refresh",
            });
            return res.status(403).json({ error: "Invalid refresh token. Please log in again." });
        }

        // check server-side expiration
        if (new Date(row.expires_at) <= new Date()) {
            await deleteByHash(tokenHash);
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/api/auth/refresh",
            });
            return res.status(403).json({ error: "Refresh token expired. Please log in again." });
        }

        // delete old token as part of rotation policy
        await deleteByHash(tokenHash);

        // generate a new raw refresh token
        const newRaw = generateRawRefresh();

        // hash the new token before storing
        const newHash = hashToken(newRaw);

        // insert new token into DB with new expiration
        await insertRefreshToken(row.user_id, newHash, new Date(Date.now() + REFRESH_TTL_MS));

        // generate new access token
        const accessToken = jwt.sign(
            { sub: String(row.user_id), userId: row.user_id },
            JWT_SECRET,
            {
                expiresIn: "15m",
                issuer: "budget-overflow.api",
                audience: "budget-overflow.client",
            }
        );

        // set new refresh token cookie
        res.cookie("refreshToken", newRaw, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/api/auth/refresh",
            maxAge: REFRESH_TTL_MS,
        });

        // set new access token cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        // respond with new access token
        return res.json({ accessToken });
    } catch (err: any) {
        // catch and log any unexpected errors
        console.error("Refresh error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// handle fetch of current logged-in user's profile
export const getMe = async (req: Request, res: Response) => {
    // extract user id from request (injected by auth middleware)
    const userId = (req as any).user?.id as number | undefined;

    // if missing, return 401 unauthorized
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });

    // look up the user in the database
    const user = await db("users")
        .select("id", "first_name", "last_name", "email", "created_at")
        .where({ id: userId })
        .first();

    // if not found, return 404
    if (!user)
        return res.status(404).json({ error: "User not found" });

    // return user info in frontend-friendly camelCase format
    return res.json({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        createdAt: user.created_at,
    });
};

// handle user profile update
export const updateUserProfile = async (req: Request, res: Response) => {
    // extract user id from request (injected by auth middleware)
    const userId = (req as any).user?.id;

    // if user is not authenticated
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });

    // get firstName and lastName from request body
    let { firstName, lastName } = req.body as {
        firstName?: string;
        lastName?: string;
    };

    // make sure both fields are provided
    if (!firstName || !lastName)
        return res.status(400).json({ error: "First and last name are required." });

    // trim both names
    firstName = firstName.trim();
    lastName = lastName.trim();

    // validate first name
    if (firstName.length < 2 || firstName.length > 20 || !nameCheck(firstName))
        return res.status(400).json({ error: "Invalid first name." });

    // validate last name
    if (lastName.length < 2 || lastName.length > 20 || !nameCheck(lastName))
        return res.status(400).json({ error: "Invalid last name." });

    try {
        // update user record in database and return updated row
        const [ updatedUser ] = await db("users")
            .update({ first_name: firstName, last_name: lastName })
            .where({ id: userId })
            .returning([ "id", "first_name", "last_name", "email", "created_at" ]);

        // respond with updated user info in camelCase format
        return res.json({
            id: updatedUser.id,
            firstName: updatedUser.first_name,
            lastName: updatedUser.last_name,
            email: updatedUser.email,
            createdAt: updatedUser.created_at,
        });
    } catch (err: any) {
        // catch and log any unexpected errors
        console.error("Profile update error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// change user password (POST /api/auth/change-password)
export const changeUserPassword = async (req: Request, res: Response) => {
    // extract user id from request (injected by auth middleware)
    const userId = (req as any).user?.id;

    // reject if no user found
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });

    // extract current and new password from body
    const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
    };

    // reject if missing fields
    if (!currentPassword || !newPassword)
        return res.status(400).json({ error: "Current and new passwords are required." });

    // validate password strength
    if (!isStrongPassword(newPassword))
        return res.status(400).json({ error: "New password is not strong enough." });

    try {
        // fetch user password hash from database
        const user = await db("users")
            .select("password_hash")
            .where({ id: userId })
            .first();

        // reject if user not found
        if (!user)
            return res.status(404).json({ error: "User not found." });

        // compare current password with stored hash
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch)
            return res.status(403).json({ error: "Current password is incorrect." });

        // compare new password with existing hash to prevent reuse
        const isSame = await bcrypt.compare(newPassword, user.password_hash);
        if (isSame)
            return res.status(400).json({ error: "New password must be different from the current password." });

        // hash new password
        const newHash = await bcrypt.hash(newPassword, 10);

        // update user password in database
        await db("users").update({ password_hash: newHash }).where({ id: userId });

        // respond with success
        return res.json({ message: "Password changed successfully." });
    } catch (err: any) {
        // catch and log any unexpected errors
        console.error("Password change error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// handle logout and clear refresh and access tokens
export const logoutUser = async (req: Request, res: Response) => {
    try {
        // get raw refresh token from cookies
        const raw = req.cookies.refreshToken as string | undefined;

        // if token exists, delete it from the database using its hashed value
        if (raw) {
            await deleteByHash(hashToken(raw));
        }

        // clear refresh token cookie from the browser
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/api/auth/refresh", // must match refresh route
        });

        // clear access token cookie from the browser
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        // respond with success message
        return res.json({ message: "Logged out." });
    } catch (err: any) {
        // log error and respond with internal server error
        console.error("Logout error:", err?.message ?? err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};