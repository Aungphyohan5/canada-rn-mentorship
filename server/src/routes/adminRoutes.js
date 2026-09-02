import express from "express";

import {
    getAllNurses,
    getNurseById,
} from "../controllers/adminController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ============================================================
// ADMIN ONLY
// ============================================================

// Get all nurse customers
router.get(
    "/nurses",
    protect,
    authorize("admin"),
    getAllNurses
);


// Get one nurse customer
router.get(
    "/nurses/:id",
    protect,
    authorize("admin"),
    getNurseById
);


export default router;