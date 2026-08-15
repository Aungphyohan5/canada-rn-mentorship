import express from "express";

import {
    createCheckoutSession,
} from "../controllers/paymentController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/create-checkout-session",
    protect,
    authorize("nurse"),
    createCheckoutSession
);

export default router;