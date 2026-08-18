import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import api from "../services/api";

import "./Bookings.css";

const MENTORSHIP_SESSION_TYPE =
    "Canada RN Mentorship Session";

const CALENDLY_URL =
    "https://calendly.com/canadarnmentorshipbytz/canada-rn-mentorship";

const Bookings = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paymentError, setPaymentError] = useState("");

    // =========================================================
    // LOAD BOOKINGS
    // =========================================================

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await api.get("/bookings/me");

                const userBookings =
                    response.data?.data?.bookings || [];

                setBookings(userBookings);

            } catch (error) {
                console.error(
                    "BOOKINGS PAGE ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load your bookings."
                );

            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

    // =========================================================
    // CONTINUE STRIPE PAYMENT
    // =========================================================

    const handleContinuePayment = async (
        bookingId
    ) => {
        try {
            setPaymentError("");

            const response =
                await api.get(
                    "/payments/resume-checkout-session",
                    {
                        params: {
                            bookingId,
                        },
                    }
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
                "CONTINUE PAYMENT ERROR:",
                error
            );

            setPaymentError(
                error.response?.data?.message ||
                error.message ||
                "Unable to resume payment."
            );
        }
    };

    // =========================================================
    // SCHEDULE
    // =========================================================

    const handleScheduleSession = () => {
        window.location.href =
            CALENDLY_URL;
    };

    // =========================================================
    // JOIN ZOOM
    // =========================================================

    const handleJoinZoom = (
        zoomJoinUrl
    ) => {
        if (!zoomJoinUrl) {
            return;
        }

        window.open(
            zoomJoinUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =========================================================
    // FILTER
    // =========================================================

    const mentorshipBookings =
        bookings.filter(
            (booking) =>
                booking.sessionType ===
                MENTORSHIP_SESSION_TYPE &&
                booking.paymentStatus !==
                "cancelled"
        );

    const upcomingBookings =
        mentorshipBookings.filter(
            (booking) =>
                booking.paymentStatus === "paid" &&
                (
                    booking.bookingStatus ===
                    "pending" ||
                    booking.bookingStatus ===
                    "scheduled"
                )
        );

    const completedBookings =
        mentorshipBookings.filter(
            (booking) =>
                booking.bookingStatus ===
                "completed"
        );

    const hasActiveBooking =
        mentorshipBookings.some(
            (booking) =>
                booking.paymentStatus ===
                "pending" ||
                (
                    booking.paymentStatus ===
                    "paid" &&
                    (
                        booking.bookingStatus ===
                        "pending" ||
                        booking.bookingStatus ===
                        "scheduled"
                    )
                )
        );

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <DashboardLayout>

                <div className="bookings-page">

                    <div className="bookings-loading">
                        Loading your bookings...
                    </div>

                </div>

            </DashboardLayout>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <DashboardLayout>

                <div className="bookings-page">

                    <div className="dashboard-card">

                        <p className="booking-error">
                            {error}
                        </p>

                    </div>

                </div>

            </DashboardLayout>
        );
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <DashboardLayout>

            <div className="bookings-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="bookings-header">

                    <div>

                        <p className="eyebrow">
                            MY BOOKINGS
                        </p>

                        <h1>
                            Mentorship Sessions
                        </h1>

                        <p>
                            View your upcoming and
                            previous Canada RN mentorship
                            sessions.
                        </p>

                    </div>


                    {!hasActiveBooking && (

                        <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/book-session"
                                )
                            }
                        >
                            Book a Session →
                        </button>

                    )}

                </div>


                {/* =================================================
                    PAYMENT ERROR
                ================================================= */}

                {paymentError && (

                    <div className="booking-error">
                        {paymentError}
                    </div>

                )}


                {/* =================================================
                    UPCOMING
                ================================================= */}

                <section className="booking-section">

                    <div className="booking-section-header">

                        <div>

                            <p className="card-eyebrow">
                                UPCOMING
                            </p>

                            <h2>
                                Your Next Session
                            </h2>

                        </div>

                    </div>


                    {upcomingBookings.length ===
                        0 ? (

                        <div className="empty-bookings">

                            <div className="empty-bookings-icon">
                                +
                            </div>

                            <h3>
                                No upcoming sessions
                            </h3>

                            <p>
                                When you book a mentorship
                                session, it will appear
                                here.
                            </p>


                            {!hasActiveBooking && (

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/book-session"
                                        )
                                    }
                                >
                                    Book a Session
                                </button>

                            )}

                        </div>

                    ) : (

                        <div className="booking-list">

                            {upcomingBookings.map(
                                (booking) => {

                                    const isPaid =
                                        booking.paymentStatus ===
                                        "paid";

                                    const isScheduled =
                                        booking.bookingStatus ===
                                        "scheduled";

                                    return (

                                        <article
                                            className="booking-item upcoming-booking"
                                            key={
                                                booking._id
                                            }
                                        >

                                            <div className="booking-item-main">

                                                <div className="booking-item-title">

                                                    <div className="booking-calendar-icon">
                                                        📅
                                                    </div>

                                                    <div>

                                                        <h3>
                                                            Canada RN
                                                            Mentorship
                                                        </h3>

                                                        <p>
                                                            45-minute
                                                            one-on-one
                                                            session
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="booking-details">

                                                    <div>
                                                        <span>
                                                            Payment
                                                        </span>

                                                        <strong>
                                                            {isPaid
                                                                ? "✓ Paid"
                                                                : "Payment Pending"}
                                                        </strong>
                                                    </div>


                                                    <div>
                                                        <span>
                                                            Status
                                                        </span>

                                                        <strong>
                                                            {isScheduled
                                                                ? "Scheduled"
                                                                : "Ready to Schedule"}
                                                        </strong>
                                                    </div>


                                                    <div>
                                                        <span>
                                                            Amount
                                                        </span>

                                                        <strong>
                                                            CA$
                                                            {
                                                                booking.amount
                                                            }{" "}
                                                            {
                                                                booking.currency
                                                            }
                                                        </strong>
                                                    </div>

                                                </div>


                                                {isScheduled &&
                                                    booking.scheduledAt && (

                                                        <div className="booking-date">

                                                            <span>
                                                                Scheduled for
                                                            </span>

                                                            <strong>
                                                                {formatDate(
                                                                    booking.scheduledAt
                                                                )}
                                                            </strong>

                                                        </div>

                                                    )}

                                            </div>


                                            <div className="booking-item-actions">

                                                {isPaid &&
                                                    !isScheduled && (

                                                        <button
                                                            type="button"
                                                            className="primary-button"
                                                            onClick={
                                                                handleScheduleSession
                                                            }
                                                        >
                                                            Schedule Session →
                                                        </button>

                                                    )}


                                                {isScheduled &&
                                                    booking.zoomJoinUrl && (

                                                        <button
                                                            type="button"
                                                            className="primary-button"
                                                            onClick={() =>
                                                                handleJoinZoom(
                                                                    booking.zoomJoinUrl
                                                                )
                                                            }
                                                        >
                                                            Join Zoom →
                                                        </button>

                                                    )}


                                                {isScheduled &&
                                                    !booking.zoomJoinUrl && (

                                                        <span className="booking-waiting">
                                                            Zoom link pending
                                                        </span>

                                                    )}

                                            </div>

                                        </article>

                                    );
                                }
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    HISTORY
                ================================================= */}

                <section className="booking-section">

                    <div className="booking-section-header">

                        <div>

                            <p className="card-eyebrow">
                                HISTORY
                            </p>

                            <h2>
                                Previous Sessions
                            </h2>

                        </div>

                    </div>


                    {completedBookings.length ===
                        0 ? (

                        <div className="empty-history">

                            <p>
                                You don't have any
                                completed mentorship
                                sessions yet.
                            </p>

                        </div>

                    ) : (

                        <div className="booking-list">

                            {completedBookings.map(
                                (booking) => (

                                    <article
                                        className="booking-item"
                                        key={
                                            booking._id
                                        }
                                    >

                                        <div>

                                            <h3>
                                                Canada RN
                                                Mentorship
                                                Session
                                            </h3>

                                            <p>
                                                {
                                                    booking.durationMinutes
                                                }{" "}
                                                minutes
                                            </p>

                                        </div>


                                        <div className="booking-history-meta">

                                            <span className="status-badge completed">
                                                ✓ Completed
                                            </span>

                                            {booking.scheduledAt && (

                                                <span>
                                                    {formatDate(
                                                        booking.scheduledAt
                                                    )}
                                                </span>

                                            )}

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    PENDING PAYMENT
                ================================================= */}

                {mentorshipBookings.some(
                    (booking) =>
                        booking.paymentStatus ===
                        "pending"
                ) && (

                        <section className="booking-section">

                            <div className="booking-section-header">

                                <div>

                                    <p className="card-eyebrow">
                                        PAYMENT
                                    </p>

                                    <h2>
                                        Payment in Progress
                                    </h2>

                                </div>

                            </div>


                            <div className="pending-payment-card">

                                <div>

                                    <h3>
                                        Complete your
                                        mentorship payment
                                    </h3>

                                    <p>
                                        You have a payment
                                        session that has not
                                        been completed yet.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        handleContinuePayment(
                                            mentorshipBookings.find(
                                                (booking) =>
                                                    booking.paymentStatus ===
                                                    "pending"
                                            )?._id
                                        )
                                    }
                                >
                                    Continue Payment →
                                </button>

                            </div>

                        </section>

                    )}

            </div>

        </DashboardLayout>
    );
};

export default Bookings;