import stripe from "../config/stripe.js";
import Booking from "../models/Booking.js";

const SESSION_PRICE_CENTS = 12500;
const SESSION_DURATION_MINUTES = 45;

export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check for an existing active booking.
        // This prevents duplicate Stripe checkout sessions.
        const existingActiveBooking = await Booking.findOne({
            user: userId,
            paymentStatus: {
                $in: ["pending", "paid"],
            },
            bookingStatus: "pending",
        }).sort({
            createdAt: -1,
        });

        if (existingActiveBooking) {
            return res.status(400).json({
                success: false,
                code: "ACTIVE_BOOKING_EXISTS",
                message:
                    existingActiveBooking.paymentStatus === "paid"
                        ? "You already have a paid mentorship session waiting to be scheduled."
                        : "You already have a payment session in progress. Please complete or cancel your existing payment.",
                data: {
                    booking: existingActiveBooking,
                },
            });
        }

        // Create our internal booking.
        const booking = await Booking.create({
            user: userId,
            sessionType:
                "Canada RN Mentorship Session",
            durationMinutes:
                SESSION_DURATION_MINUTES,
            amount: 125,
            currency: "CAD",
            paymentStatus: "pending",
            bookingStatus: "pending",
        });

        const session =
            await stripe.checkout.sessions.create({
                mode: "payment",

                line_items: [
                    {
                        price_data: {
                            currency: "cad",

                            product_data: {
                                name:
                                    "Canada RN Mentorship Session",
                                description:
                                    "45-minute one-on-one mentorship session",
                            },

                            unit_amount:
                                SESSION_PRICE_CENTS,
                        },

                        quantity: 1,
                    },
                ],

                metadata: {
                    bookingId:
                        booking._id.toString(),

                    userId:
                        userId.toString(),
                },

                success_url:
                    `${process.env.FRONTEND_URL}` +
                    "/booking/success?session_id={CHECKOUT_SESSION_ID}",

                cancel_url:
                    `${process.env.FRONTEND_URL}/booking/cancelled?booking_id=${booking._id}`,
            });

        booking.stripePaymentId = session.id;

        await booking.save();

        return res.status(200).json({
            success: true,
            data: {
                checkoutUrl: session.url,
                bookingId: booking._id,
            },
        });

    } catch (error) {
        console.error(
            "CREATE CHECKOUT SESSION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create payment session",
        });
    }
};

export const cancelBookingPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required",
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            user: req.user._id,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message:
                    "This booking has already been paid and cannot be cancelled as a pending payment.",
            });
        }

        if (booking.paymentStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message:
                    "This payment session has already been cancelled.",
            });
        }

        booking.paymentStatus = "cancelled";

        await booking.save();

        return res.status(200).json({
            success: true,
            message:
                "Payment session cancelled successfully.",
            data: {
                booking,
            },
        });

    } catch (error) {
        console.error(
            "CANCEL BOOKING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const resumeCheckoutSession = async (req, res) => {
    try {
        const userId = req.user._id;

        /*
         * The Dashboard sends the specific booking ID.
         *
         * Example:
         * /resume-checkout-session?bookingId=123
         */
        const { bookingId } = req.query;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message:
                    "Booking ID is required.",
            });
        }

        /*
         * Find ONLY this user's pending booking.
         */
        const booking = await Booking.findOne({
            _id: bookingId,
            user: userId,
            paymentStatus: "pending",
            bookingStatus: "pending",
            stripePaymentId: {
                $ne: "",
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message:
                    "No pending payment session found for this booking.",
            });
        }

        /*
         * Retrieve the existing Stripe Checkout Session.
         */
        const session =
            await stripe.checkout.sessions.retrieve(
                booking.stripePaymentId
            );

        /*
         * Stripe says payment is already completed.
         */
        if (
            session.payment_status ===
            "paid"
        ) {
            return res.status(400).json({
                success: false,
                code:
                    "PAYMENT_ALREADY_COMPLETED",
                message:
                    "This payment has already been completed.",
            });
        }

        /*
         * Stripe Checkout Session expired.
         */
        if (
            session.status ===
            "expired"
        ) {
            return res.status(400).json({
                success: false,
                code:
                    "CHECKOUT_EXPIRED",
                message:
                    "This payment session has expired. Please cancel it and start a new payment.",
            });
        }

        /*
         * Make sure Stripe still gives us
         * a Checkout URL.
         */
        if (!session.url) {
            return res.status(400).json({
                success: false,
                message:
                    "This Stripe payment session cannot be resumed.",
            });
        }

        return res.status(200).json({
            success: true,

            data: {
                checkoutUrl:
                    session.url,

                bookingId:
                    booking._id,
            },
        });

    } catch (error) {
        console.error(
            "RESUME CHECKOUT SESSION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to resume payment session.",
        });
    }
};