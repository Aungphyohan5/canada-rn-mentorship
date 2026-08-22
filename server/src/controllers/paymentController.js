import stripe from "../config/stripe.js";
import Booking from "../models/Booking.js";


// ============================================================
// CONSTANTS
// ============================================================

const SESSION_PRICE_CENTS = 12500;
const SESSION_DURATION_MINUTES = 45;

const SESSION_TYPE =
    "Canada RN Mentorship Session";


// ============================================================
// CREATE CHECKOUT SESSION
// ============================================================

export const createCheckoutSession = async (
    req,
    res
) => {

    try {

        const userId =
            req.user._id;


        // --------------------------------------------------------
        // Prevent duplicate active bookings
        // --------------------------------------------------------

        const existingActiveBooking =
            await Booking.findOne({

                user: userId,

                paymentStatus: {
                    $in: [
                        "pending",
                        "paid",
                    ],
                },

                bookingStatus: "pending",

                sessionType:
                    SESSION_TYPE,

            }).sort({
                createdAt: -1,
            });


        if (existingActiveBooking) {

            return res.status(400).json({

                success: false,

                code:
                    "ACTIVE_BOOKING_EXISTS",

                message:
                    existingActiveBooking.paymentStatus ===
                        "paid"

                        ? "You already have a paid mentorship session waiting to be scheduled."

                        : "You already have a payment session in progress. Please complete your existing payment.",

                data: {
                    booking:
                        existingActiveBooking,
                },

            });
        }


        // --------------------------------------------------------
        // Create internal booking
        // --------------------------------------------------------

        const booking =
            await Booking.create({

                user: userId,

                sessionType:
                    SESSION_TYPE,

                durationMinutes:
                    SESSION_DURATION_MINUTES,

                amount: 125,

                currency: "CAD",

                paymentStatus:
                    "pending",

                bookingStatus:
                    "pending",

            });


        // --------------------------------------------------------
        // Create Stripe Checkout
        // --------------------------------------------------------

        const session =
            await stripe.checkout.sessions.create({

                mode: "payment",

                line_items: [

                    {

                        price_data: {

                            currency: "cad",

                            product_data: {

                                name:
                                    SESSION_TYPE,

                                description:
                                    "45-minute one-on-one mentorship session",

                            },

                            unit_amount:
                                SESSION_PRICE_CENTS,

                        },

                        quantity: 1,

                    },

                ],


                // ------------------------------------------------
                // IMPORTANT
                // ------------------------------------------------

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
                    `${process.env.FRONTEND_URL}` +
                    `/booking/cancelled?booking_id=${booking._id}`,

            });


        // --------------------------------------------------------
        // Save Stripe Checkout Session ID
        // --------------------------------------------------------

        booking.stripePaymentId =
            session.id;


        await booking.save();


        console.log(
            "✅ STRIPE CHECKOUT CREATED"
        );

        console.log(
            "Booking:",
            booking._id.toString()
        );

        console.log(
            "Stripe Session:",
            session.id
        );


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


// ============================================================
// CANCEL PAYMENT
// ============================================================

export const cancelBookingPayment = async (
    req,
    res
) => {

    try {

        const {
            bookingId,
        } = req.body;


        if (!bookingId) {

            return res.status(400).json({

                success: false,

                message:
                    "Booking ID is required",

            });

        }


        const booking =
            await Booking.findOne({

                _id: bookingId,

                user: req.user._id,

            });


        if (!booking) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found",

            });

        }


        if (
            booking.paymentStatus ===
            "paid"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This booking has already been paid and cannot be cancelled.",

            });

        }


        if (
            booking.paymentStatus ===
            "cancelled"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This payment session has already been cancelled.",

            });

        }


        booking.paymentStatus =
            "cancelled";


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

            message:
                "Server Error",

        });

    }

};


// ============================================================
// RESUME / VERIFY CHECKOUT SESSION
// ============================================================
//
// IMPORTANT:
// This endpoint also repairs the booking if Stripe says
// the payment has already been completed.
//
// This protects against a delayed/missed webhook.
// ============================================================

export const resumeCheckoutSession = async (
    req,
    res
) => {

    try {

        const userId =
            req.user._id;


        const {
            bookingId,
        } = req.query;


        // --------------------------------------------------------
        // Validate booking ID
        // --------------------------------------------------------

        if (!bookingId) {

            return res.status(400).json({

                success: false,

                message:
                    "Booking ID is required.",

            });

        }


        // --------------------------------------------------------
        // Find user's booking
        // --------------------------------------------------------

        const booking =
            await Booking.findOne({

                _id: bookingId,

                user: userId,

            });


        if (!booking) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found.",

            });

        }


        // --------------------------------------------------------
        // If MongoDB already knows payment is paid,
        // there is nothing to resume.
        // --------------------------------------------------------

        if (
            booking.paymentStatus ===
            "paid"
        ) {

            return res.status(200).json({

                success: true,

                code:
                    "ALREADY_PAID",

                message:
                    "This booking has already been paid.",

                data: {
                    booking,
                },

            });

        }


        // --------------------------------------------------------
        // Make sure Stripe session exists
        // --------------------------------------------------------

        if (
            !booking.stripePaymentId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Stripe payment session is missing.",

            });

        }


        // --------------------------------------------------------
        // Retrieve Stripe Checkout Session
        // --------------------------------------------------------

        const session =
            await stripe.checkout.sessions.retrieve(
                booking.stripePaymentId
            );


        console.log(
            "STRIPE SESSION STATUS:",
            session.status
        );

        console.log(
            "STRIPE PAYMENT STATUS:",
            session.payment_status
        );


        // ========================================================
        // PAYMENT ALREADY COMPLETED
        // ========================================================

        if (
            session.payment_status ===
            "paid"
        ) {

            /*
             * IMPORTANT:
             *
             * Repair MongoDB here.
             */

            booking.paymentStatus =
                "paid";


            await booking.save();


            console.log(
                "✅ PAYMENT RECOVERED FROM STRIPE"
            );

            console.log(
                "Booking:",
                booking._id.toString()
            );


            return res.status(200).json({

                success: true,

                code:
                    "PAYMENT_RECOVERED",

                message:
                    "Payment was already completed. Your booking has been updated.",

                data: {
                    booking,
                },

            });

        }


        // ========================================================
        // EXPIRED
        // ========================================================

        if (
            session.status ===
            "expired"
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "CHECKOUT_EXPIRED",

                message:
                    "This payment session has expired. Please start a new payment.",

            });

        }


        // ========================================================
        // CHECKOUT URL
        // ========================================================

        if (!session.url) {

            return res.status(400).json({

                success: false,

                message:
                    "This Stripe payment session cannot be resumed.",

            });

        }


        // ========================================================
        // RETURN CHECKOUT URL
        // ========================================================

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