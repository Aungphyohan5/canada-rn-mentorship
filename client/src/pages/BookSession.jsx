import { useEffect, useState } from "react";
import api from "../services/api";

const CALENDLY_URL =
    "https://calendly.com/canadarnmentorshipbytz/canada-rn-mentorship";

const BookSession = () => {
    const [checkingBooking, setCheckingBooking] = useState(true);
    const [activeBooking, setActiveBooking] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /*
     * Check whether the user already has:
     *
     * 1. A paid booking waiting for scheduling
     * 2. A pending payment session
     */
    useEffect(() => {
        const checkExistingBooking = async () => {
            try {
                setCheckingBooking(true);
                setError("");

                const response = await api.get(
                    "/scheduling/my-active-booking"
                );

                const booking =
                    response.data?.data?.booking;

                setActiveBooking(
                    booking || null
                );
            } catch (error) {
                /*
                 * 404 simply means there is no
                 * active booking.
                 */
                if (
                    error.response?.status === 404
                ) {
                    setActiveBooking(null);
                } else {
                    console.error(
                        "CHECK ACTIVE BOOKING ERROR:",
                        error
                    );

                    setError(
                        error.response?.data?.message ||
                        "Unable to check your booking."
                    );
                }
            } finally {
                setCheckingBooking(false);
            }
        };

        checkExistingBooking();
    }, []);

    /*
     * Start payment or continue to scheduling.
     */
    const handleBookSession = async () => {
        try {
            setLoading(true);
            setError("");

            /*
             * If the user has already paid,
             * don't create another Stripe payment.
             */
            if (
                activeBooking?.paymentStatus ===
                "paid"
            ) {
                window.location.href =
                    CALENDLY_URL;

                return;
            }

            /*
             * If a payment session is already pending,
             * don't create another booking.
             */
            if (
                activeBooking?.paymentStatus ===
                "pending"
            ) {
                const response = await api.get(
                    "/payments/resume-checkout-session"
                );

                const checkoutUrl =
                    response.data?.data?.checkoutUrl;

                if (!checkoutUrl) {
                    throw new Error(
                        "Existing Stripe checkout URL was not returned."
                    );
                }

                window.location.href =
                    checkoutUrl;

                return;
            }

            /*
             * No active booking.
             *
             * Create a new Stripe Checkout session.
             */
            const response = await api.post(
                "/payments/create-checkout-session"
            );

            const checkoutUrl =
                response.data?.data?.checkoutUrl;

            if (!checkoutUrl) {
                throw new Error(
                    "Stripe checkout URL was not returned."
                );
            }

            window.location.href =
                checkoutUrl;

        } catch (error) {
            console.error(
                "BOOK SESSION ERROR:",
                error
            );

            /*
             * Backend duplicate protection.
             */
            if (
                error.response?.data?.code ===
                "ACTIVE_BOOKING_EXISTS"
            ) {
                const existingBooking =
                    error.response?.data?.data?.booking;

                if (existingBooking) {
                    setActiveBooking(
                        existingBooking
                    );
                }

                setError(
                    error.response?.data?.message ||
                    "You already have an active booking."
                );

                return;
            }

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to start booking."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * Cancel an existing pending payment session.
     */
    const handleCancelBooking = async () => {
        if (!activeBooking?._id) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            await api.post(
                "/payments/cancel-booking",
                {
                    bookingId:
                        activeBooking._id,
                }
            );

            /*
             * Remove the active booking from
             * the current page.
             */
            setActiveBooking(null);

        } catch (error) {
            console.error(
                "CANCEL BOOKING ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to cancel the payment session."
            );
        } finally {
            setLoading(false);
        }
    };

    const isPaid =
        activeBooking?.paymentStatus === "paid";

    const isPending =
        activeBooking?.paymentStatus === "pending";

    return (
        <div className="booking-page">

            <div className="booking-card">

                {/* Header */}
                <p className="card-eyebrow">
                    ONE-ON-ONE MENTORSHIP
                </p>

                <h1>
                    Canada RN Mentorship Session
                </h1>

                <p className="booking-description">
                    Get personalized guidance on your
                    Canadian RN pathway, registration
                    requirements, and immigration options
                    for internationally educated nurses.
                </p>

                {/* Session Details */}
                <div className="booking-details">

                    <div>
                        <span>
                            Session
                        </span>

                        <strong>
                            45 minutes
                        </strong>
                    </div>

                    <div>
                        <span>
                            Investment
                        </span>

                        <strong>
                            CA$125 CAD
                        </strong>
                    </div>

                </div>

                {/* Checking booking */}
                {checkingBooking && (
                    <div className="booking-status-message">
                        Checking your booking status...
                    </div>
                )}

                {/* Paid Booking */}
                {!checkingBooking && isPaid && (
                    <div className="already-paid-message">

                        <div className="already-paid-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Payment already received
                            </strong>

                            <p>
                                Your mentorship session is
                                ready to be scheduled.
                            </p>
                        </div>

                    </div>
                )}

                {/* Pending Payment */}
                {!checkingBooking && isPending && (
                    <div className="payment-pending-message">

                        <div className="payment-pending-icon">
                            !
                        </div>

                        <div>
                            <strong>
                                Payment session in progress
                            </strong>

                            <p>
                                You already started a payment
                                session. Please complete it or
                                cancel it before starting a new
                                payment.
                            </p>
                        </div>

                    </div>
                )}

                {/* Main Action */}
                <button
                    type="button"
                    className="primary-button"
                    onClick={handleBookSession}
                    disabled={
                        checkingBooking ||
                        loading
                    }
                >
                    {checkingBooking
                        ? "Checking booking..."
                        : loading
                            ? isPaid
                                ? "Opening Calendly..."
                                : "Please wait..."
                            : isPaid
                                ? "Schedule My Session →"
                                : isPending
                                    ? "Continue Existing Payment"
                                    : "Continue to Payment →"}
                </button>

                {/* Cancel Pending Payment */}
                {!checkingBooking && isPending && (
                    <button
                        type="button"
                        className="secondary-button cancel-booking-button"
                        onClick={handleCancelBooking}
                        disabled={loading}
                    >
                        {loading
                            ? "Cancelling..."
                            : "Cancel Payment Session"}
                    </button>
                )}

                {/* Error */}
                {error && (
                    <p className="booking-error">
                        {error}
                    </p>
                )}

                {/* Bottom Note */}
                <p className="booking-note">
                    {isPaid
                        ? "Your payment has already been received. You'll be taken to Calendly to choose your session time."
                        : isPending
                            ? "Complete your existing payment session or cancel it before starting a new booking."
                            : "After successful payment, you'll be able to continue to scheduling."}
                </p>

            </div>

        </div>
    );
};

export default BookSession;