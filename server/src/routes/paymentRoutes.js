import express from "express";

import {
    createCheckoutSession,
    cancelBookingPayment,
    resumeCheckoutSession,
} from "../controllers/paymentController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


/*
 * Create new Stripe Checkout
 */
router.post(
    "/create-checkout-session",
    protect,
    authorize("nurse"),
    createCheckoutSession
);


/*
 * Resume existing pending Stripe Checkout
 */
router.get(
    "/resume-checkout-session",
    protect,
    authorize("nurse"),
    resumeCheckoutSession
);


/*
 * Cancel pending payment
 */
router.post(
    "/cancel-booking",
    protect,
    authorize("nurse"),
    cancelBookingPayment
);


export default router;