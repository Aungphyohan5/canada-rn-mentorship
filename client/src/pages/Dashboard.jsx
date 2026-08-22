import { useEffect, useState } from "react";
import {
    useNavigate,
    useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";


// ============================================================
// CONSTANTS
// ============================================================

const CALENDLY_URL =
    "https://calendly.com/canadarnmentorshipbytz/canada-rn-mentorship";

const MENTORSHIP_SESSION_TYPE =
    "Canada RN Mentorship Session";


// ============================================================
// DASHBOARD
// ============================================================

const Dashboard = () => {

    const { user } = useAuth();

    const navigate = useNavigate();

    const location = useLocation();


    // =========================================================
    // STATE
    // =========================================================

    const [profile, setProfile] =
        useState(null);

    const [pathway, setPathway] =
        useState(null);

    const [bookings, setBookings] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [paymentError, setPaymentError] =
        useState("");


    // =========================================================
    // LOAD DASHBOARD DATA
    // =========================================================

    useEffect(() => {

        let cancelled = false;


        const fetchDashboardData = async () => {

            try {

                setLoading(true);

                setError("");

                setPaymentError("");


                // =================================================
                // LOAD PROFILE / PATHWAY / BOOKINGS
                // =================================================

                const [
                    profileResponse,
                    pathwayResponse,
                    bookingsResponse,
                ] = await Promise.all([

                    api.get(
                        "/nurse-profile/me"
                    ),

                    api.get(
                        "/pathway/me"
                    ),

                    api.get(
                        "/bookings/me"
                    ),

                ]);


                if (cancelled) {
                    return;
                }


                // =================================================
                // PROFILE
                // =================================================

                setProfile(
                    profileResponse
                        ?.data
                        ?.data
                        ?.profile || null
                );


                // =================================================
                // PATHWAY
                // =================================================

                setPathway(
                    pathwayResponse
                        ?.data
                        ?.data || null
                );


                // =================================================
                // BOOKINGS
                // =================================================

                let userBookings =
                    bookingsResponse
                        ?.data
                        ?.data
                        ?.bookings || [];


                console.log(
                    "========== DASHBOARD BOOKINGS =========="
                );

                console.table(
                    userBookings.map(
                        (booking) => ({
                            id: booking._id,
                            paymentStatus:
                                booking.paymentStatus,
                            bookingStatus:
                                booking.bookingStatus,
                            scheduledAt:
                                booking.scheduledAt,
                            zoomJoinUrl:
                                booking.zoomJoinUrl,
                        })
                    )
                );

                console.log(
                    "========================================"
                );


                // =================================================
                // FIND BOOKING THAT NEEDS CALENDLY SYNC
                // =================================================

                const bookingToSync =
                    userBookings.find(
                        (booking) => {

                            const isMentorship =
                                booking.sessionType ===
                                MENTORSHIP_SESSION_TYPE;


                            const isPaid =
                                booking.paymentStatus ===
                                "paid";


                            const isPending =
                                booking.bookingStatus ===
                                "pending";


                            const isScheduledWithoutZoom =
                                booking.bookingStatus ===
                                "scheduled" &&
                                !booking.zoomJoinUrl;


                            return (
                                isMentorship &&
                                isPaid &&
                                (
                                    isPending ||
                                    isScheduledWithoutZoom
                                )
                            );

                        }
                    );


                // =================================================
                // CALENDLY SYNC
                // =================================================

                if (bookingToSync) {

                    console.log(
                        "CALENDLY SYNC REQUIRED:",
                        bookingToSync._id
                    );


                    try {

                        const syncResponse =
                            await api.get(
                                "/scheduling/sync-calendly"
                            );


                        console.log(
                            "CALENDLY SYNC RESPONSE:",
                            syncResponse.data
                        );


                        // =================================================
                        // RELOAD BOOKINGS AFTER SYNC
                        // =================================================

                        const updatedBookingsResponse =
                            await api.get(
                                "/bookings/me"
                            );


                        userBookings =
                            updatedBookingsResponse
                                ?.data
                                ?.data
                                ?.bookings || [];


                        console.log(
                            "BOOKINGS AFTER CALENDLY SYNC:",
                            userBookings
                        );


                    } catch (
                    calendlyError
                    ) {

                        /*
                         * Calendly synchronization should
                         * never prevent the dashboard from loading.
                         */

                        console.error(
                            "CALENDLY SYNC ERROR:",
                            calendlyError
                                ?.response
                                ?.data ||
                            calendlyError?.message ||
                            calendlyError
                        );

                    }

                }


                // =================================================
                // SAVE BOOKINGS
                // =================================================

                if (!cancelled) {

                    setBookings(
                        userBookings
                    );

                }

            } catch (error) {

                console.error(
                    "DASHBOARD DATA ERROR:",
                    error
                );


                if (!cancelled) {

                    setError(
                        error
                            ?.response
                            ?.data
                            ?.message ||
                        "Unable to load dashboard data."
                    );

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        };


        fetchDashboardData();


        return () => {

            cancelled = true;

        };

    }, []);


    // =========================================================
    // SCROLL TO SECTION
    // =========================================================

    useEffect(() => {

        if (!location.hash) {
            return;
        }


        const sectionId =
            location.hash.substring(1);


        const timer =
            setTimeout(() => {

                const element =
                    document.getElementById(
                        sectionId
                    );


                if (!element) {
                    return;
                }


                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

            }, 150);


        return () => {

            clearTimeout(timer);

        };

    }, [
        location.hash,
        loading,
    ]);


    // =========================================================
    // CONTINUE STRIPE PAYMENT
    // =========================================================

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


            console.log(
                "RESUMING PAYMENT FOR BOOKING:",
                bookingId
            );


            const response =
                await api.get(
                    "/payments/resume-checkout-session",
                    {
                        params: {
                            bookingId,
                        },
                    }
                );


            console.log(
                "RESUME PAYMENT RESPONSE:",
                response.data
            );


            const responseData =
                response?.data || {};


            const code =
                responseData.code;


            const checkoutUrl =
                responseData
                    ?.data
                    ?.checkoutUrl;


            // =====================================================
            // PAYMENT RECOVERED
            // =====================================================

            if (
                code ===
                "PAYMENT_RECOVERED" ||

                code ===
                "PAYMENT_ALREADY_COMPLETED" ||

                code ===
                "ALREADY_PAID"
            ) {

                console.log(
                    "PAYMENT ALREADY COMPLETED."
                );


                /*
                 * The payment is already complete.
                 *
                 * Do NOT send the user back to Stripe.
                 *
                 * Reload the dashboard so that:
                 *
                 * paymentStatus = paid
                 *
                 * then Calendly synchronization can run.
                 */

                window.location.reload();

                return;

            }


            // =====================================================
            // NORMAL PENDING STRIPE CHECKOUT
            // =====================================================

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
                error
                    ?.response
                    ?.data
                    ?.message ||
                error?.message ||
                "Unable to resume payment."
            );

        }

    };


    // =========================================================
    // OPEN CALENDLY
    // =========================================================

    const handleScheduleSession = () => {

        window.location.href =
            CALENDLY_URL;

    };


    // =========================================================
    // OPEN ZOOM
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
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <DashboardLayout>

                <div className="dashboard-page">

                    <div className="dashboard-card">

                        <p>
                            Loading dashboard...
                        </p>

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


    // =========================================================
    // MENTORSHIP BOOKINGS ONLY
    // =========================================================

    const mentorshipBookings =
        bookings.filter(
            (booking) =>

                booking.sessionType ===
                MENTORSHIP_SESSION_TYPE &&

                booking.paymentStatus !==
                "cancelled"
        );


    // =========================================================
    // CURRENT PAID BOOKING
    // =========================================================

    const paidBooking =
        mentorshipBookings.find(
            (booking) =>

                booking.paymentStatus ===
                "paid" &&

                (
                    booking.bookingStatus ===
                    "pending" ||

                    booking.bookingStatus ===
                    "scheduled"
                )
        );


    // =========================================================
    // ACTIVE MENTORSHIP BOOKING
    // =========================================================

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


    // =========================================================
    // PATHWAY PROGRESS
    // =========================================================

    const completionPercentage =
        Math.min(
            100,
            Math.max(
                0,
                Number(
                    pathway
                        ?.completionPercentage ||
                    0
                )
            )
        );


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <DashboardLayout>

            <div className="dashboard-page">


                {/* =================================================
                    WELCOME
                ================================================== */}

                <div
                    id="dashboard"
                    className="dashboard-welcome"
                >

                    <p className="eyebrow">
                        CANADA RN MENTORSHIP
                    </p>


                    <h1>

                        Welcome back,{" "}

                        {user?.firstName ||
                            "there"}

                        {" "}👋

                    </h1>


                    <p>

                        Continue your journey toward
                        becoming an RN in Canada.

                    </p>

                </div>


                {/* =================================================
                    JOURNEY
                ================================================== */}

                <div
                    id="journey"
                    className="dashboard-card journey-card"
                >

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

                            {completionPercentage}%

                        </div>

                    </div>


                    <div className="progress-bar">

                        <div
                            className="progress-bar-fill"
                            style={{
                                width:
                                    `${completionPercentage}%`,
                            }}
                        />

                    </div>


                    <p className="progress-text">

                        {pathway?.completedSteps ||
                            0}

                        {" "}of{" "}

                        {pathway?.totalSteps ||
                            0}

                        {" "}steps completed

                    </p>


                    <div className="journey-steps">

                        {pathway?.steps?.length ? (

                            pathway.steps.map(
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
                            )

                        ) : (

                            <p className="booking-status-message">

                                Your pathway steps will
                                appear here.

                            </p>

                        )}

                    </div>

                </div>


                {/* =================================================
                    CURRENT MENTORSHIP BOOKING
                ================================================== */}

                {paidBooking && (

                    <div className="dashboard-card booking-card">

                        <div className="card-header">

                            <div>

                                <p className="card-eyebrow">
                                    MENTORSHIP BOOKING
                                </p>


                                <h2>
                                    Canada RN Mentorship Session
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

                                    {paidBooking.durationMinutes}
                                    {" "}minutes

                                </strong>

                            </div>


                            <div>

                                <span>
                                    Amount
                                </span>


                                <strong>

                                    CA$
                                    {paidBooking.amount}
                                    {" "}
                                    {paidBooking.currency}

                                </strong>

                            </div>


                            <div>

                                <span>
                                    Status
                                </span>


                                <strong>

                                    {paidBooking.bookingStatus ===
                                        "scheduled"

                                        ? "Scheduled"

                                        : "Ready to Schedule"}

                                </strong>

                            </div>

                        </div>


                        {/* =================================================
                            SCHEDULED
                        ================================================== */}

                        {paidBooking.bookingStatus ===
                            "scheduled" && (

                                <div className="booking-next-step">

                                    {paidBooking.scheduledAt && (

                                        <p>

                                            Your session is scheduled
                                            for{" "}

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


                        {/* =================================================
                            PAID BUT NOT SCHEDULED
                        ================================================== */}

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


                {/* =================================================
                    DASHBOARD GRID
                ================================================== */}

                <div className="dashboard-grid">


                    {/* =================================================
                        PROFILE
                    ================================================== */}

                    <div
                        id="profile"
                        className="dashboard-card"
                    >

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

                                {profile?.specialty ||
                                    "Not provided"}

                            </strong>

                        </div>


                        <div className="profile-summary">

                            <span>
                                Preferred Province
                            </span>


                            <strong>

                                {profile?.preferredProvince ||
                                    "Not provided"}

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


                    {/* =================================================
                        NEXT STEP
                    ================================================== */}

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


                    {/* =================================================
                        MENTORSHIP
                    ================================================== */}

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


                {/* =================================================
                    MY SESSIONS
                ================================================== */}

                <div
                    id="bookings"
                    className="dashboard-card sessions-card"
                >

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


                    {/* =================================================
                        PAYMENT ERROR
                    ================================================== */}

                    {paymentError && (

                        <div className="booking-error">

                            {paymentError}

                        </div>

                    )}


                    {/* =================================================
                        EMPTY
                    ================================================== */}

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

                                    const isPaid =
                                        booking.paymentStatus ===
                                        "paid";


                                    const isPendingPayment =
                                        booking.paymentStatus ===
                                        "pending";


                                    const isScheduled =
                                        booking.bookingStatus ===
                                        "scheduled";


                                    const isCompleted =
                                        booking.bookingStatus ===
                                        "completed";


                                    return (

                                        <div
                                            className="session-item"
                                            key={booking._id}
                                        >


                                            {/* =================================
                                                INFORMATION
                                            ================================== */}

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


                                            {/* =================================
                                                STATUS
                                            ================================== */}

                                            <div className="session-status">


                                                {/* Pending Payment */}

                                                {isPendingPayment && (

                                                    <span className="status-badge pending">

                                                        Payment Pending

                                                    </span>

                                                )}


                                                {/* Paid / Ready */}

                                                {isPaid &&
                                                    !isScheduled &&
                                                    !isCompleted && (

                                                        <span className="status-badge not-scheduled">

                                                            ✓ Paid · Ready to Schedule

                                                        </span>

                                                    )}


                                                {/* Scheduled */}

                                                {isPaid &&
                                                    isScheduled &&
                                                    !isCompleted && (

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


                                            {/* =================================
                                                PENDING PAYMENT
                                            ================================== */}

                                            {isPendingPayment && (

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


                                            {/* =================================
                                                PAID / NOT SCHEDULED
                                            ================================== */}

                                            {isPaid &&
                                                !isScheduled &&
                                                !isCompleted && (

                                                    <button
                                                        type="button"
                                                        className="secondary-button"
                                                        onClick={
                                                            handleScheduleSession
                                                        }
                                                    >

                                                        Schedule →

                                                    </button>

                                                )}


                                            {/* =================================
                                                SCHEDULED / ZOOM
                                            ================================== */}

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


                                            {/* =================================
                                                SCHEDULED BUT NO ZOOM YET
                                            ================================== */}

                                            {isPaid &&
                                                isScheduled &&
                                                !booking.zoomJoinUrl && (

                                                    <span className="booking-status-message">

                                                        Zoom link will
                                                        appear here when
                                                        available.

                                                    </span>

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