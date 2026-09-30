import express from "express";

import {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
} from "../controllers/authController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// =========================================================
// PUBLIC AUTH ROUTES
// =========================================================

router.post("/register", register);

router.post("/login", login);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/reset-password",
    resetPassword
);


// =========================================================
// PROTECTED ROUTES
// =========================================================

router.get(
    "/me",
    protect,
    getMe
);

router.get(
    "/nurse-test",
    protect,
    authorize("nurse"),
    (req, res) => {
        res.json({
            success: true,
            message:
                "Welcome to the nurse area",
            user: req.user,
        });
    }
);

router.get(
    "/admin-test",
    protect,
    authorize("admin"),
    (req, res) => {
        res.json({
            success: true,
            message:
                "Welcome to the admin area",
            user: req.user,
        });
    }
);

export default router;