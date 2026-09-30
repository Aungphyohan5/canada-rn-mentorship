import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

import {
    sendPasswordResetEmail,
    sendAccountCreatedEmail,
} from "../services/emailService.js";


// =========================================================
// REGISTER
// =========================================================

export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
        } = req.body;

        // -----------------------------------------------------
        // Validate required fields
        // -----------------------------------------------------

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // -----------------------------------------------------
        // Normalize email
        // -----------------------------------------------------

        const normalizedEmail =
            email.toLowerCase().trim();

        // -----------------------------------------------------
        // Check if email already exists
        // -----------------------------------------------------

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // -----------------------------------------------------
        // Hash password
        // -----------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // -----------------------------------------------------
        // Create user
        // -----------------------------------------------------

        const user = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        // -----------------------------------------------------
        // Send account-created email
        //
        // This runs after the account is successfully created.
        //
        // If Resend has a temporary problem, the user's
        // registration will still succeed.
        // -----------------------------------------------------

        void sendAccountCreatedEmail({
            to: user.email,
            name: user.firstName,
        })
            .then(() => {
                console.log(
                    "ACCOUNT CREATED EMAIL SENT:",
                    user.email
                );
            })
            .catch((emailError) => {
                console.error(
                    "ACCOUNT CREATED EMAIL ERROR:",
                    emailError
                );
            });

        // -----------------------------------------------------
        // Registration response
        // -----------------------------------------------------

        return res.status(201).json({
            success: true,
            message:
                "Account created successfully.",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });

    } catch (error) {
        console.error(
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// =========================================================
// LOGIN
// =========================================================

export const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        // -----------------------------------------------------
        // Validate fields
        // -----------------------------------------------------

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        // -----------------------------------------------------
        // Find user
        // -----------------------------------------------------

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        // -----------------------------------------------------
        // Check password
        // -----------------------------------------------------

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        // -----------------------------------------------------
        // Generate JWT
        // -----------------------------------------------------

        const token =
            generateToken(user._id.toString());

        // -----------------------------------------------------
        // Login response
        // -----------------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Login successful",

            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },

                token,
            },
        });

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// =========================================================
// FORGOT PASSWORD
// =========================================================

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // -----------------------------------------------------
        // Validate email
        // -----------------------------------------------------

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email address is required.",
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        // -----------------------------------------------------
        // Find user
        // -----------------------------------------------------

        const user = await User.findOne({
            email: normalizedEmail,
        });

        /*
         * Always return the same response whether
         * the email exists or not.
         *
         * This prevents email/account enumeration.
         */

        if (!user) {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists with that email address, you will receive a password reset link shortly.",
            });
        }

        // -----------------------------------------------------
        // Generate secure reset token
        // -----------------------------------------------------

        const resetToken =
            crypto.randomBytes(32).toString("hex");

        // -----------------------------------------------------
        // Hash reset token before storing it
        // -----------------------------------------------------

        const hashedToken =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

        user.passwordResetToken = hashedToken;

        // Token expires after 1 hour
        user.passwordResetExpires =
            new Date(
                Date.now() +
                60 * 60 * 1000
            );

        await user.save();

        // -----------------------------------------------------
        // Create frontend reset URL
        // -----------------------------------------------------

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";

        const resetUrl =
            `${frontendUrl}/reset-password?token=${resetToken}`;

        // -----------------------------------------------------
        // Send reset email
        // -----------------------------------------------------

        try {
            await sendPasswordResetEmail({
                to: user.email,
                name: user.firstName,
                resetUrl,
            });

        } catch (emailError) {
            console.error(
                "PASSWORD RESET EMAIL ERROR:",
                emailError
            );

            // Remove unused reset token
            user.passwordResetToken = null;
            user.passwordResetExpires = null;

            await user.save();

            return res.status(500).json({
                success: false,
                message:
                    "We could not send the password reset email. Please try again later.",
            });
        }

        // -----------------------------------------------------
        // Success
        // -----------------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "If an account exists with that email address, you will receive a password reset link shortly.",
        });

    } catch (error) {
        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// =========================================================
// RESET PASSWORD
// =========================================================

export const resetPassword = async (req, res) => {
    try {
        const {
            token,
            password,
        } = req.body;

        // -----------------------------------------------------
        // Validate request
        // -----------------------------------------------------

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Reset token and new password are required.",
            });
        }

        // -----------------------------------------------------
        // Validate password length
        // -----------------------------------------------------

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters.",
            });
        }

        // -----------------------------------------------------
        // Hash token received from frontend
        // -----------------------------------------------------

        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        // -----------------------------------------------------
        // Find user with valid token
        // -----------------------------------------------------

        const user = await User.findOne({
            passwordResetToken: hashedToken,

            passwordResetExpires: {
                $gt: new Date(),
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message:
                    "This password reset link is invalid or has expired.",
            });
        }

        // -----------------------------------------------------
        // Hash new password
        // -----------------------------------------------------

        user.password =
            await bcrypt.hash(password, 10);

        // -----------------------------------------------------
        // Invalidate reset token
        // -----------------------------------------------------

        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        // -----------------------------------------------------
        // Success
        // -----------------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "Your password has been reset successfully.",
        });

    } catch (error) {
        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// =========================================================
// GET CURRENT USER
// =========================================================

export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,

            data: {
                user: req.user,
            },
        });

    } catch (error) {
        console.error(
            "GET ME ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};