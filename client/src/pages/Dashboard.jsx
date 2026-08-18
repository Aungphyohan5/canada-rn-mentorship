import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";

const CALENDLY_URL =
    "https://calendly.com/canadarnmentorshipbytz/canada-rn-mentorship";

const MENTORSHIP_SESSION_TYPE =
    "Canada RN Mentorship Session";

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ============================================
    // STATE
    // ============================================

    const [profile, setProfile] = useState(null);
    const [pathway, setPathway] = useState(null);
    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paymentError, setPaymentError] = useState("");

    // ============================================
    // LOAD DASHBOARD DATA
    // ============================================

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");
                setPaymentError("");

                // ----------------------------------------
                // Load profile, pathway and bookings
                // ----------------------------------------

                const [
                    profileResponse,
                    pathwayResponse,
                    bookingsResponse,
                ] = await Promise.all([
                    api.get("/nurse-profile/me"),
                    api.get("/pathway/me"),
                    api.get("/bookings/me"),
                ]);

                setProfile(
                    profileResponse.data?.data?.profile ||
                    null
                );

                setPathway(
                    pathwayResponse.data?.data ||
                    null
                );

                let userBookings =
                    bookingsResponse.data?.data?.bookings ||
                    [];

                // ----------------------------------------
                // Check whether Calendly sync is needed
                // ----------------------------------------

                const bookingToSync =
                    userBookings.find(
                        (booking) =>
                            booking.sessionType ===
                            MENTORSHIP_SESSION_TYPE &&
                            booking.paymentStatus === "paid" &&
                            (
                                booking.bookingStatus ===
                                "pending" ||
                                (
                                    booking.bookingStatus ===
                                    "scheduled" &&
                                    !booking.zoomJoinUrl
                                )
                            )
                    );

                // ----------------------------------------
                // Sync Calendly if necessary
                // ----------------------------------------

                if (bookingToSync) {
                    try {
                        console.log(
                            "Checking Calendly for booking:",
                            bookingToSync._id
                        );

                        const syncResponse =
                            await api.get(
                                "/scheduling/sync-calendly"
                            );

                        console.log(
                            "CALENDLY SYNC RESPONSE:",
                            syncResponse.data
                        );

                        // --------------------------------
                        // Reload bookings after sync
                        // --------------------------------

                        const updatedBookingsResponse =
                            await api.get(
                                "/bookings/me"
                            );

                        userBookings =
                            updatedBookingsResponse.data
                                ?.data?.bookings || [];

                    } catch (calendlyError) {
                        /*
                         * Calendly failure should NOT prevent
                         * the dashboard from loading.
                         */
                        console.error(
                            "CALENDLY SYNC ERROR:",
                            calendlyError.response?.data ||
                            calendlyError.message ||
                            calendlyError
                        );
                    }
                }

                // ----------------------------------------
                // Save final bookings
                // ----------------------------------------

                setBookings(userBookings);

            } catch (error) {
                console.error(
                    "DASHBOARD DATA ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard data."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // ============================================
    // CONTINUE EXISTING STRIPE PAYMENT
    // ============================================

    const handleContinuePayment = async (
        bookingId
    ) => {
        try {
            setPaymentError("");

            if (!bookingId) {
                throw new Error(
                    "Booking ID is missing."
                );
            }

            const response = await api.get(
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

            window.location.href = checkoutUrl;

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

    // ============================================
    // OPEN CALENDLY
    // ============================================

    const handleScheduleSession = () => {
        window.location.href =
            CALENDLY_URL;
    };

    // ============================================
    // OPEN ZOOM
    // ============================================

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

    // ============================================
    // LOADING
    // ============================================

    if (loading) {
        return (
            <DashboardLayout>
                <div className="dashboard-page">
                    <p>
                        Loading dashboard...
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    // ============================================
    // ERROR
    // ============================================

    if (error) {
        return (
            <DashboardLayout>
                <div className="dashboard-page">

                    <div className="dashboard-card">

                        <p className="booking-error">
                            {error}
                        </p>

                    </div>

                </div>
            </DashboardLayout>
        );
    }

    // ============================================
    // MENTORSHIP BOOKINGS
    // ============================================

    /*
     * Only mentorship bookings.
     *
     * Cancelled bookings are hidden.
     */
    const mentorshipBookings =
        bookings.filter(
            (booking) =>
                booking.sessionType ===
                MENTORSHIP_SESSION_TYPE &&
                booking.paymentStatus !==
                "cancelled"
        );

    // ============================================
    // LATEST ACTIVE PAID BOOKING
    // ============================================

    /*
     * Used for the prominent booking card.
     *
     * Paid + pending
     * OR
     * Paid + scheduled
     */
    const paidBooking =
        mentorshipBookings.find(
            (booking) =>
                booking.paymentStatus === "paid" &&
                (
                    booking.bookingStatus ===
                    "pending" ||
                    booking.bookingStatus ===
                    "scheduled"
                )
        );

    // ============================================
    // ACTIVE BOOKING EXISTS
    // ============================================

    /*
     * Prevent user from starting another session
     * while an existing mentorship session is active.
     */
    const hasActiveMentorshipBooking =
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


    // ============================================
    // RENDER
    // ============================================

    return (
        <DashboardLayout>

            <div className="dashboard-page">

                {/* ========================================
                    WELCOME
                ========================================= */}

                <div className="dashboard-welcome">

                    <p className="eyebrow">
                        CANADA RN MENTORSHIP
                    </p>

                    <h1>
                        Welcome back,{" "}
                        {user?.firstName ||
                            "there"}{" "}
                        👋
                    </h1>

                    <p>
                        Continue your journey toward
                        becoming an RN in Canada.
                    </p>

                </div>


                {/* ========================================
                    JOURNEY PROGRESS
                ========================================= */}

                <div className="dashboard-card journey-card">

                    <div className="card-header">

                        <div>

                            <p className="card-eyebrow">
                                YOUR JOURNEY
                            </p>

                            <h2>
                                Canada RN Pathway
                            </h2>

                        </div>

                        <div className="progress-number">
                            {
                                pathway
                                    ?.completionPercentage ??
                                0
                            }
                            %
                        </div>

                    </div>


                    <div className="progress-bar">

                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${pathway
                                    ?.completionPercentage ??
                                    0
                                    }%`,
                            }}
                        />

                    </div>


                    <p className="progress-text">

                        {
                            pathway?.completedSteps ??
                            0
                        }{" "}
                        of{" "}
                        {
                            pathway?.totalSteps ??
                            0
                        }{" "}
                        steps completed

                    </p>


                    <div className="journey-steps">

                        {pathway?.steps?.map(
                            (step) => {

                                const completed =
                                    step.status ===
                                    "Completed" ||
                                    step.status ===
                                    "Passed";

                                return (
                                    <div
                                        className="journey-step"
                                        key={step.key}
                                    >

                                        <div
                                            className={
                                                completed
                                                    ? "step-icon completed"
                                                    : "step-icon"
                                            }
                                        >
                                            {completed
                                                ? "✓"
                                                : "○"}
                                        </div>

                                        <div>

                                            <strong>
                                                {step.name}
                                            </strong>

                                            <span>
                                                {step.status}
                                            </span>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>


                {/* ========================================
                    CURRENT MENTORSHIP BOOKING
                ========================================= */}

                {paidBooking && (

                    <div className="dashboard-card booking-card">

                        <div className="card-header">

                            <div>

                                <p className="card-eyebrow">
                                    MENTORSHIP BOOKING
                                </p>

                                <h2>
                                    Canada RN Mentorship
                                    Session
                                </h2>

                            </div>

                            <div className="booking-paid-badge">
                                ✓ Paid
                            </div>

                        </div>


                        <div className="booking-summary">

                            <div>

                                <span>
                                    Duration
                                </span>

                                <strong>
                                    {
                                        paidBooking.durationMinutes
                                    }{" "}
                                    minutes
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Amount
                                </span>

                                <strong>
                                    CA$
                                    {paidBooking.amount}{" "}
                                    {paidBooking.currency}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Status
                                </span>

                                <strong>
                                    {
                                        paidBooking.bookingStatus ===
                                            "scheduled"
                                            ? "Scheduled"
                                            : "Ready to Schedule"
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* =================================
                            PAID + SCHEDULED
                        ================================= */}

                        {paidBooking.bookingStatus ===
                            "scheduled" && (

                                <div className="booking-next-step">

                                    {paidBooking.scheduledAt && (

                                        <p>
                                            Your session is
                                            scheduled for{" "}

                                            <strong>
                                                {new Date(
                                                    paidBooking.scheduledAt
                                                ).toLocaleString(
                                                    undefined,
                                                    {
                                                        dateStyle:
                                                            "medium",
                                                        timeStyle:
                                                            "short",
                                                    }
                                                )}
                                            </strong>
                                            .
                                        </p>

                                    )}


                                    {paidBooking.zoomJoinUrl ? (

                                        <button
                                            type="button"
                                            className="primary-button"
                                            onClick={() =>
                                                handleJoinZoom(
                                                    paidBooking.zoomJoinUrl
                                                )
                                            }
                                        >
                                            Join Zoom Meeting →
                                        </button>

                                    ) : (

                                        <p className="booking-status-message">
                                            Your appointment is
                                            confirmed. The Zoom
                                            meeting link will appear
                                            here once it is available.
                                        </p>

                                    )}

                                </div>

                            )}


                        {/* =================================
                            PAID + NOT SCHEDULED
                        ================================= */}

                        {paidBooking.bookingStatus ===
                            "pending" && (

                                <div className="booking-next-step">

                                    <p>
                                        Your payment is confirmed.
                                        Choose a date and time for
                                        your 45-minute mentorship
                                        session.
                                    </p>

                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={
                                            handleScheduleSession
                                        }
                                    >
                                        Schedule My Session →
                                    </button>

                                </div>

                            )}

                    </div>

                )}


                {/* ========================================
                    DASHBOARD GRID
                ========================================= */}

                <div className="dashboard-grid">


                    {/* ==================================
                        PROFILE
                    ================================== */}

                    <div className="dashboard-card">

                        <p className="card-eyebrow">
                            PROFILE
                        </p>

                        <h2>
                            Your Nurse Profile
                        </h2>

                        <p className="card-description">
                            Keep your nursing background
                            and journey information up
                            to date.
                        </p>


                        <div className="profile-summary">

                            <span>
                                Specialty
                            </span>

                            <strong>
                                {
                                    profile?.specialty ||
                                    "Not provided"
                                }
                            </strong>

                        </div>


                        <div className="profile-summary">

                            <span>
                                Preferred Province
                            </span>

                            <strong>
                                {
                                    profile
                                        ?.preferredProvince ||
                                    "Not provided"
                                }
                            </strong>

                        </div>


                        <button
                            type="button"
                            className="card-link"
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            View Profile →
                        </button>

                    </div>


                    {/* ==================================
                        NEXT STEP
                    ================================== */}

                    <div className="dashboard-card">

                        <p className="card-eyebrow">
                            NEXT STEP
                        </p>

                        <h2>
                            Provincial Registration
                        </h2>

                        <p className="card-description">
                            Your current pathway shows
                            provincial registration as
                            your next step.
                        </p>


                        <div className="next-step-badge">
                            Not Started
                        </div>

                    </div>


                    {/* ==================================
                        MENTORSHIP
                    ================================== */}

                    <div className="dashboard-card mentorship-card">

                        <p className="card-eyebrow">
                            ONE-ON-ONE MENTORSHIP
                        </p>

                        <h2>
                            Need personalized guidance?
                        </h2>

                        <p className="card-description">
                            Book a 45-minute session to
                            discuss your Canada RN pathway,
                            registration requirements, and
                            immigration options.
                        </p>


                        <div className="mentorship-details">

                            <span>
                                45 minutes
                            </span>

                            <span>
                                CA$125 CAD
                            </span>

                        </div>


                        {!hasActiveMentorshipBooking && (

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


                        {hasActiveMentorshipBooking && (

                            <p className="booking-status-message">
                                You already have an active
                                mentorship session. Please
                                complete or attend your
                                existing session before
                                booking another one.
                            </p>

                        )}

                    </div>

                </div>


                {/* ========================================
                    MENTORSHIP HISTORY
                ========================================= */}

                <div className="dashboard-card sessions-card">

                    <div className="card-header">

                        <div>

                            <p className="card-eyebrow">
                                MY SESSIONS
                            </p>

                            <h2>
                                Mentorship History
                            </h2>

                        </div>

                    </div>


                    {/* Payment error */}

                    {paymentError && (

                        <div className="booking-error">
                            {paymentError}
                        </div>

                    )}


                    {/* =================================
                        NO BOOKINGS
                    ================================= */}

                    {mentorshipBookings.length ===
                        0 ? (

                        <div className="empty-sessions">

                            <p>
                                You don't have any
                                mentorship bookings yet.
                            </p>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={() =>
                                    navigate(
                                        "/book-session"
                                    )
                                }
                            >
                                Book Your First Session →
                            </button>

                        </div>

                    ) : (

                        <div className="sessions-list">

                            {mentorshipBookings.map(
                                (booking) => {

                                    // --------------------------------
                                    // Booking state
                                    // --------------------------------

                                    const isPaid =
                                        booking.paymentStatus ===
                                        "paid";

                                    const isPending =
                                        booking.paymentStatus ===
                                        "pending";

                                    const isScheduled =
                                        booking.bookingStatus ===
                                        "scheduled";

                                    const isCompleted =
                                        booking.bookingStatus === "completed";



                                    return (

                                        <div
                                            className="session-item"
                                            key={booking._id}
                                        >

                                            {/* ==========================
                                                SESSION INFO
                                            =========================== */}

                                            <div className="session-main">

                                                <h3>
                                                    {
                                                        booking.sessionType
                                                    }
                                                </h3>


                                                <div className="session-meta">

                                                    <span>
                                                        {
                                                            booking.durationMinutes
                                                        }{" "}
                                                        minutes
                                                    </span>

                                                    <span>
                                                        CA$
                                                        {
                                                            booking.amount
                                                        }{" "}
                                                        {
                                                            booking.currency
                                                        }
                                                    </span>


                                                    {isScheduled &&
                                                        booking.scheduledAt && (

                                                            <span>
                                                                {new Date(
                                                                    booking.scheduledAt
                                                                ).toLocaleString(
                                                                    undefined,
                                                                    {
                                                                        dateStyle:
                                                                            "medium",
                                                                        timeStyle:
                                                                            "short",
                                                                    }
                                                                )}
                                                            </span>

                                                        )}

                                                </div>

                                            </div>


                                            {/* ==========================
                                                STATUS
                                            =========================== */}

                                            {/* ==========================
    STATUS
=========================== */}

                                            <div className="session-status">

                                                {/* Payment Pending */}
                                                {isPending && (
                                                    <span className="status-badge pending">
                                                        Payment Pending
                                                    </span>
                                                )}

                                                {/* Paid + Ready to Schedule */}
                                                {isPaid &&
                                                    !isScheduled &&
                                                    !isCompleted && (
                                                        <span className="status-badge not-scheduled">
                                                            Ready to Schedule
                                                        </span>
                                                    )}

                                                {/* Paid + Scheduled */}
                                                {isPaid && isScheduled && !isCompleted && (
                                                    <span className="status-badge scheduled">
                                                        ✓ Scheduled
                                                    </span>
                                                )}

                                                {/* Completed */}
                                                {isCompleted && (
                                                    <span className="status-badge completed">
                                                        ✓ Completed
                                                    </span>
                                                )}

                                            </div>
                                            {/* ==========================
                                                PENDING PAYMENT
                                            =========================== */}

                                            {isPending && (

                                                <button
                                                    type="button"
                                                    className="secondary-button"
                                                    onClick={() =>
                                                        handleContinuePayment(
                                                            booking._id
                                                        )
                                                    }
                                                >
                                                    Continue Payment →
                                                </button>

                                            )}


                                            {/* ==========================
                                                PAID / NOT SCHEDULED
                                            =========================== */}

                                            {isPaid &&
                                                !isScheduled &&
                                                !isCompleted && (

                                                    <button
                                                        type="button"
                                                        className="secondary-button"
                                                        onClick={handleScheduleSession}
                                                    >
                                                        Schedule →
                                                    </button>

                                                )}


                                            {/* ==========================
                                                SCHEDULED / ZOOM
                                            =========================== */}

                                            {isPaid &&
                                                isScheduled &&
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

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    )}

                </div>

            </div>

        </DashboardLayout>
    );
};

export default Dashboard;