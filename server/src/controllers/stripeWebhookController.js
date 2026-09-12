import stripe from "../config/stripe.js";
import Booking from "../models/Booking.js";

import {
    sendPaymentReceivedEmail,
} from "../services/emailService.js";


// ============================================================
// MARK BOOKING AS PAID
// ============================================================

const markBookingAsPaid = async ({
    session,
    requirePaidStatus = false,
}) => {

    const bookingId =
        session.metadata?.bookingId;


    if (!bookingId) {

        console.error(
            "❌ Stripe session has no bookingId metadata:",
            session.id
        );

        return null;
    }


    console.log(
        "Booking ID:",
        bookingId
    );


    const booking =
        await Booking.findById(
            bookingId
        ).populate("user");


    if (!booking) {

        console.error(
            "❌ Booking not found:",
            bookingId
        );

        return null;
    }


    console.log(
        "Current payment status:",
        booking.paymentStatus
    );

    console.log(
        "Current booking status:",
        booking.bookingStatus
    );


    // ========================================================
    // CHECK PAYMENT STATUS
    // ========================================================

    if (
        requirePaidStatus &&
        session.payment_status !== "paid"
    ) {

        console.log(
            "⚠️ Checkout session is not paid yet:",
            session.payment_status
        );

        return booking;
    }


    // ========================================================
    // MARK PAYMENT AS PAID
    // ========================================================

    const wasAlreadyPaid =
        booking.paymentStatus === "paid";


    if (!wasAlreadyPaid) {

        booking.paymentStatus =
            "paid";


        /*
         * IMPORTANT:
         *
         * Save the Checkout Session ID.
         *
         * The resume-checkout-session endpoint
         * retrieves this value using Stripe:
         *
         * stripe.checkout.sessions.retrieve(...)
         *
         * Do not replace this with payment_intent.
         */

        booking.stripePaymentId =
            session.id;


        await booking.save();


        console.log(
            "✅ BOOKING MARKED AS PAID:",
            booking._id.toString()
        );

    } else {

        console.log(
            "ℹ️ Booking was already marked as paid."
        );


        /*
         * Repair older records if stripePaymentId
         * was previously saved as a PaymentIntent ID.
         */

        if (
            session.id &&
            booking.stripePaymentId !== session.id
        ) {

            booking.stripePaymentId =
                session.id;

            await booking.save();


            console.log(
                "🔧 Checkout Session ID repaired:",
                session.id
            );

        }

    }


    // ============================================================
    // SEND PAYMENT CONFIRMATION EMAIL WITHOUT BLOCKING WEBHOOK
    // ============================================================

    if (
        booking.user?.email &&
        !booking.paymentConfirmationSent
    ) {
        const emailData = {
            to: booking.user.email,
            firstName: booking.user.firstName,
            amount: booking.amount,
            currency: booking.currency,
            sessionType: booking.sessionType,
        };

        // Do not await this.
        // Email failure must not delay Stripe's webhook response.
        void sendPaymentReceivedEmail(emailData)
            .then(async () => {
                await Booking.updateOne(
                    {
                        _id: booking._id,
                        paymentConfirmationSent: false,
                    },
                    {
                        $set: {
                            paymentConfirmationSent: true,
                        },
                    }
                );

                console.log(
                    "📧 PAYMENT CONFIRMATION EMAIL SENT TO:",
                    booking.user.email
                );
            })
            .catch((emailError) => {
                console.error(
                    "❌ PAYMENT CONFIRMATION EMAIL FAILED:",
                    emailError.message
                );
            });

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


    return booking;
};


// ============================================================
// STRIPE WEBHOOK
// ============================================================

export const handleStripeWebhook = async (
    req,
    res
) => {

    const signature =
        req.headers["stripe-signature"];


    // ========================================================
    // VERIFY STRIPE SIGNATURE
    // ========================================================

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


    // ========================================================
    // LOG EVENT
    // ========================================================

    console.log(
        "================================================"
    );

    console.log(
        "STRIPE WEBHOOK RECEIVED"
    );

    console.log(
        "Event type:",
        event.type
    );

    console.log(
        "Event ID:",
        event.id
    );

    console.log(
        "================================================"
    );


    // ========================================================
    // PROCESS EVENT
    // ========================================================

    try {

        switch (event.type) {


            // ==================================================
            // CHECKOUT SESSION COMPLETED
            // ==================================================

            case "checkout.session.completed": {

                const session =
                    event.data.object;


                console.log(
                    "Stripe Checkout Session:",
                    session.id
                );


                await markBookingAsPaid({

                    session,

                    requirePaidStatus: true,

                });


                break;
            }


            // ==================================================
            // ASYNC PAYMENT SUCCEEDED
            // ==================================================

            case "checkout.session.async_payment_succeeded": {

                const session =
                    event.data.object;


                console.log(
                    "Async payment succeeded:",
                    session.id
                );


                /*
                 * This event itself confirms that the
                 * asynchronous payment succeeded.
                 */

                await markBookingAsPaid({

                    session,

                    requirePaidStatus: false,

                });


                break;
            }


            // ==================================================
            // ASYNC PAYMENT FAILED
            // ==================================================

            case "checkout.session.async_payment_failed": {

                const session =
                    event.data.object;


                console.log(
                    "⚠️ Async payment failed:",
                    session.id
                );


                const bookingId =
                    session.metadata?.bookingId;


                if (!bookingId) {

                    console.warn(
                        "⚠️ Failed payment has no bookingId:",
                        session.id
                    );

                    break;
                }


                const booking =
                    await Booking.findById(
                        bookingId
                    );


                if (!booking) {

                    console.warn(
                        "⚠️ Booking not found:",
                        bookingId
                    );

                    break;
                }


                if (
                    booking.paymentStatus === "paid"
                ) {

                    console.log(
                        "ℹ️ Booking is already paid. No changes made."
                    );

                } else {

                    console.log(
                        "Payment remains pending after async failure."
                    );

                }


                break;
            }


            // ==================================================
            // CHECKOUT SESSION EXPIRED
            // ==================================================

            case "checkout.session.expired": {

                const session =
                    event.data.object;


                console.log(
                    "⌛ Checkout session expired:",
                    session.id
                );


                const bookingId =
                    session.metadata?.bookingId;


                if (!bookingId) {

                    console.warn(
                        "⚠️ Expired session has no bookingId:",
                        session.id
                    );

                    break;
                }


                const booking =
                    await Booking.findById(
                        bookingId
                    );


                if (!booking) {

                    console.warn(
                        "⚠️ Booking not found:",
                        bookingId
                    );

                    break;
                }


                if (
                    booking.paymentStatus === "paid"
                ) {

                    console.log(
                        "ℹ️ Expired session belongs to an already-paid booking."
                    );

                } else {

                    console.log(
                        "Booking remains pending after checkout expiration."
                    );

                }


                break;
            }


            // ==================================================
            // OTHER EVENTS
            // ==================================================

            default: {

                console.log(
                    "ℹ️ Stripe event ignored:",
                    event.type
                );

                break;
            }

        }


        // ========================================================
        // ACKNOWLEDGE STRIPE
        // ========================================================

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