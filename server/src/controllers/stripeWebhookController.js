import stripe from "../config/stripe.js";
import Booking from "../models/Booking.js";
import {
    sendPaymentReceivedEmail,
} from "../services/emailService.js";


// ============================================================
// STRIPE WEBHOOK
// ============================================================

export const handleStripeWebhook = async (req, res) => {

    const signature =
        req.headers["stripe-signature"];


    // ============================================================
    // VERIFY STRIPE WEBHOOK SIGNATURE
    // ============================================================

    let event;

    try {

        event =
            stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );

    } catch (error) {

        console.error(
            "❌ STRIPE WEBHOOK SIGNATURE ERROR:",
            error.message
        );

        return res.status(400).send(
            `Webhook Error: ${error.message}`
        );
    }


    // ============================================================
    // LOG EVENT
    // ============================================================

    console.log(
        "================================================"
    );

    console.log(
        "STRIPE WEBHOOK RECEIVED"
    );

    console.log(
        "Event:",
        event.type
    );

    console.log(
        "Event ID:",
        event.id
    );

    console.log(
        "================================================"
    );


    // ============================================================
    // PROCESS EVENT
    // ============================================================

    try {

        switch (event.type) {


            // ======================================================
            // CHECKOUT SESSION COMPLETED
            // ======================================================

            case "checkout.session.completed": {

                const session =
                    event.data.object;

                console.log(
                    "STRIPE CHECKOUT SESSION:",
                    session.id
                );


                const bookingId =
                    session.metadata?.bookingId;


                if (!bookingId) {

                    console.error(
                        "❌ Stripe session has no bookingId metadata:",
                        session.id
                    );

                    break;
                }


                console.log(
                    "Booking ID:",
                    bookingId
                );


                // --------------------------------------------------
                // Find booking
                // --------------------------------------------------

                const booking =
                    await Booking.findById(
                        bookingId
                    ).populate("user");


                if (!booking) {

                    console.error(
                        "❌ Booking not found:",
                        bookingId
                    );

                    break;
                }


                console.log(
                    "Current booking payment status:",
                    booking.paymentStatus
                );

                console.log(
                    "Current booking status:",
                    booking.bookingStatus
                );


                // --------------------------------------------------
                // Only process successful payment
                // --------------------------------------------------

                if (
                    session.payment_status !==
                    "paid"
                ) {

                    console.log(
                        "⚠️ Checkout completed but payment status is:",
                        session.payment_status
                    );

                    break;
                }


                // ==================================================
                // MARK BOOKING AS PAID
                // ==================================================

                const wasAlreadyPaid =
                    booking.paymentStatus === "paid";


                if (!wasAlreadyPaid) {

                    booking.paymentStatus =
                        "paid";


                    if (session.payment_intent) {

                        booking.stripePaymentId =
                            session.payment_intent;

                    }


                    await booking.save();


                    console.log(
                        "✅ BOOKING MARKED AS PAID"
                    );

                } else {

                    console.log(
                        "ℹ️ Booking was already marked as paid."
                    );

                }


                // ==================================================
                // PAYMENT CONFIRMATION EMAIL
                // ==================================================

                if (
                    booking.user?.email &&
                    !booking.paymentConfirmationSent
                ) {

                    try {

                        await sendPaymentReceivedEmail({

                            to:
                                booking.user.email,

                            firstName:
                                booking.user.firstName,

                            amount:
                                booking.amount,

                            currency:
                                booking.currency,

                            sessionType:
                                booking.sessionType,

                        });


                        booking.paymentConfirmationSent =
                            true;


                        await booking.save();


                        console.log(
                            "📧 PAYMENT CONFIRMATION EMAIL SENT"
                        );


                    } catch (emailError) {

                        /*
                         * Email failure must NOT
                         * make the payment fail.
                         */

                        console.error(
                            "❌ PAYMENT CONFIRMATION EMAIL FAILED:",
                            emailError.message
                        );

                    }

                } else if (
                    booking.paymentConfirmationSent
                ) {

                    console.log(
                        "ℹ️ Payment confirmation email already sent."
                    );

                } else {

                    console.warn(
                        "⚠️ No customer email found. Payment email not sent."
                    );

                }


                /*
                 * IMPORTANT:
                 *
                 * We do NOT change bookingStatus here.
                 *
                 * Payment:
                 * pending → paid
                 *
                 * Booking:
                 * pending → scheduled
                 *
                 * Calendly synchronization handles
                 * the scheduling status.
                 */

                break;
            }


            // ======================================================
            // ASYNC PAYMENT SUCCEEDED
            // ======================================================

            case "checkout.session.async_payment_succeeded": {

                const session =
                    event.data.object;


                console.log(
                    "ASYNC PAYMENT SESSION:",
                    session.id
                );


                const bookingId =
                    session.metadata?.bookingId;


                if (!bookingId) {

                    console.error(
                        "❌ Async payment succeeded but no bookingId:",
                        session.id
                    );

                    break;
                }


                const booking =
                    await Booking.findById(
                        bookingId
                    ).populate("user");


                if (!booking) {

                    console.error(
                        "❌ Booking not found:",
                        bookingId
                    );

                    break;
                }


                // --------------------------------------------------
                // Mark paid
                // --------------------------------------------------

                if (
                    booking.paymentStatus !==
                    "paid"
                ) {

                    booking.paymentStatus =
                        "paid";


                    if (session.payment_intent) {

                        booking.stripePaymentId =
                            session.payment_intent;

                    }


                    await booking.save();


                    console.log(
                        "✅ ASYNC PAYMENT SUCCEEDED"
                    );

                } else {

                    console.log(
                        "ℹ️ Booking was already paid."
                    );

                }


                // ==================================================
                // PAYMENT CONFIRMATION EMAIL
                // ==================================================

                if (
                    booking.user?.email &&
                    !booking.paymentConfirmationSent
                ) {

                    try {

                        await sendPaymentReceivedEmail({

                            to:
                                booking.user.email,

                            firstName:
                                booking.user.firstName,

                            amount:
                                booking.amount,

                            currency:
                                booking.currency,

                            sessionType:
                                booking.sessionType,

                        });


                        booking.paymentConfirmationSent =
                            true;


                        await booking.save();


                        console.log(
                            "📧 PAYMENT CONFIRMATION EMAIL SENT"
                        );


                    } catch (emailError) {

                        console.error(
                            "❌ PAYMENT CONFIRMATION EMAIL FAILED:",
                            emailError.message
                        );

                    }

                } else if (
                    booking.paymentConfirmationSent
                ) {

                    console.log(
                        "ℹ️ Payment confirmation email already sent."
                    );

                }


                break;
            }


            // ======================================================
            // ASYNC PAYMENT FAILED
            // ======================================================

            case "checkout.session.async_payment_failed": {

                const session =
                    event.data.object;


                console.log(
                    "ASYNC PAYMENT FAILED SESSION:",
                    session.id
                );


                const bookingId =
                    session.metadata?.bookingId;


                if (!bookingId) {

                    console.error(
                        "❌ Async payment failed but no bookingId:",
                        session.id
                    );

                    break;
                }


                const booking =
                    await Booking.findById(
                        bookingId
                    );


                if (!booking) {

                    console.error(
                        "❌ Booking not found:",
                        bookingId
                    );

                    break;
                }


                /*
                 * IMPORTANT:
                 *
                 * Do not set paymentStatus to "failed"
                 * because "failed" is not part of the
                 * Booking schema enum.
                 *
                 * We simply log the failure.
                 */

                if (
                    booking.paymentStatus ===
                    "paid"
                ) {

                    console.log(
                        "ℹ️ Booking is already paid. Ignoring async payment failure."
                    );

                } else {

                    console.log(
                        "⚠️ Async payment failed. Booking remains pending."
                    );

                }


                break;
            }


            // ======================================================
            // CHECKOUT SESSION EXPIRED
            // ======================================================

            case "checkout.session.expired": {

                const session =
                    event.data.object;


                console.log(
                    "EXPIRED CHECKOUT SESSION:",
                    session.id
                );


                const bookingId =
                    session.metadata?.bookingId;


                if (!bookingId) {

                    console.error(
                        "❌ Expired checkout has no bookingId:",
                        session.id
                    );

                    break;
                }


                const booking =
                    await Booking.findById(
                        bookingId
                    );


                if (!booking) {

                    console.error(
                        "❌ Booking not found:",
                        bookingId
                    );

                    break;
                }


                /*
                 * IMPORTANT:
                 *
                 * Do not set paymentStatus to "expired"
                 * because "expired" is not part of the
                 * Booking schema enum.
                 *
                 * Keep the booking pending.
                 *
                 * Your application can later reuse or
                 * cancel stale pending bookings.
                 */

                if (
                    booking.paymentStatus ===
                    "paid"
                ) {

                    console.log(
                        "ℹ️ Checkout expired event received, but booking is already paid."
                    );

                } else {

                    console.log(
                        "⌛ Checkout session expired. Booking remains pending."
                    );

                }


                break;
            }


            // ======================================================
            // OTHER STRIPE EVENTS
            // ======================================================

            default: {

                console.log(
                    "ℹ️ Stripe event ignored:",
                    event.type
                );

                break;
            }

        }


        // ============================================================
        // STRIPE ACKNOWLEDGEMENT
        // ============================================================

        return res.status(200).json({

            received: true,

        });


    } catch (error) {

        console.error(
            "================================================"
        );

        console.error(
            "❌ STRIPE WEBHOOK PROCESSING ERROR"
        );

        console.error(
            error
        );

        console.error(
            "================================================"
        );


        return res.status(500).json({

            success: false,

            message:
                "Webhook processing failed",

        });

    }

};