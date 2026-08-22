import stripe from "../config/stripe.js";
import Booking from "../models/Booking.js";


// ============================================================
// STRIPE WEBHOOK
// ============================================================

export const handleStripeWebhook = async (req, res) => {

    const signature =
        req.headers["stripe-signature"];


    // ============================================================
    // VERIFY STRIPE WEBHOOK
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
            // CHECKOUT COMPLETED
            // ======================================================

            case "checkout.session.completed": {

                const session =
                    event.data.object;


                console.log(
                    "STRIPE CHECKOUT SESSION:",
                    session.id
                );


                // --------------------------------------------------
                // Get booking ID
                // --------------------------------------------------

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
                    );


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
                // Check payment
                // --------------------------------------------------

                if (
                    session.payment_status ===
                    "paid"
                ) {

                    /*
                     * IMPORTANT:
                     *
                     * We only update paymentStatus.
                     *
                     * We DO NOT change bookingStatus here.
                     *
                     * Calendly synchronization is responsible
                     * for changing bookingStatus from:
                     *
                     * pending → scheduled
                     *
                     * after the client books a time.
                     */


                    if (
                        booking.paymentStatus !==
                        "paid"
                    ) {

                        booking.paymentStatus =
                            "paid";

                        await booking.save();


                        console.log(
                            "✅ BOOKING MARKED AS PAID"
                        );

                        console.log(
                            "Booking:",
                            booking._id.toString()
                        );

                    } else {

                        console.log(
                            "ℹ️ Booking was already marked as paid."
                        );

                    }

                } else {

                    console.log(
                        "⚠️ Checkout completed but payment status is:",
                        session.payment_status
                    );

                }


                break;
            }


            // ======================================================
            // ASYNC PAYMENT SUCCEEDED
            // ======================================================

            case "checkout.session.async_payment_succeeded": {

                const session =
                    event.data.object;


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
                    );


                if (!booking) {

                    console.error(
                        "❌ Booking not found:",
                        bookingId
                    );

                    break;
                }


                booking.paymentStatus =
                    "paid";


                await booking.save();


                console.log(
                    "✅ ASYNC PAYMENT SUCCEEDED"
                );

                console.log(
                    "Booking:",
                    booking._id.toString()
                );


                break;
            }


            // ======================================================
            // ASYNC PAYMENT FAILED
            // ======================================================

            case "checkout.session.async_payment_failed": {

                const session =
                    event.data.object;


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
                 * Do not mark an already-paid booking
                 * as failed.
                 */

                if (
                    booking.paymentStatus !==
                    "paid"
                ) {

                    booking.paymentStatus =
                        "failed";


                    await booking.save();

                    console.log(
                        "❌ ASYNC PAYMENT FAILED"
                    );

                    console.log(
                        "Booking:",
                        booking._id.toString()
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
                 * Only mark expired if payment
                 * has NOT already completed.
                 */

                if (
                    booking.paymentStatus !==
                    "paid"
                ) {

                    booking.paymentStatus =
                        "expired";


                    await booking.save();


                    console.log(
                        "⌛ CHECKOUT SESSION EXPIRED"
                    );

                    console.log(
                        "Booking:",
                        booking._id.toString()
                    );

                }


                break;
            }


            // ======================================================
            // OTHER EVENTS
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