import "./LandingPage.css";

import {
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { useAuth } from "../context/AuthContext.jsx";


const LandingPage = () => {
    const navigate = useNavigate();

    const {
        user,
        loading,
        logout,
    } = useAuth();


    // =========================================================
    // ACTIVE BOOKING STATE
    // =========================================================

    const [activeBooking, setActiveBooking] =
        useState(null);

    const [checkingBooking, setCheckingBooking] =
        useState(false);


    // =========================================================
    // CHECK ACTIVE BOOKING
    // =========================================================
    //
    // If the user is logged in, check whether they already
    // have an active mentorship booking.
    //
    // The backend should consider these active:
    //
    // - paymentStatus: pending
    // - paymentStatus: paid + bookingStatus: pending
    // - paymentStatus: paid + bookingStatus: scheduled
    //
    // Completed / cancelled bookings should not be active.
    // =========================================================

    useEffect(() => {
        if (!user || loading) {
            setActiveBooking(null);
            return;
        }

        let isMounted = true;

        const checkActiveBooking = async () => {
            try {
                setCheckingBooking(true);

                const response = await api.get(
                    "/scheduling/my-active-booking"
                );

                const booking =
                    response.data?.data?.booking;

                if (isMounted) {
                    setActiveBooking(
                        booking || null
                    );
                }

            } catch (error) {

                /*
                 * 404 simply means the user does not
                 * currently have an active booking.
                 */
                if (
                    error.response?.status === 404
                ) {
                    if (isMounted) {
                        setActiveBooking(null);
                    }

                    return;
                }

                console.error(
                    "LANDING PAGE ACTIVE BOOKING CHECK ERROR:",
                    error
                );

                /*
                 * Do not block the landing page if
                 * the booking check temporarily fails.
                 */
                if (isMounted) {
                    setActiveBooking(null);
                }

            } finally {
                if (isMounted) {
                    setCheckingBooking(false);
                }
            }
        };

        checkActiveBooking();

        return () => {
            isMounted = false;
        };

    }, [user, loading]);


    // =========================================================
    // BOOKING STATUS HELPERS
    // =========================================================

    const hasActiveBooking =
        Boolean(activeBooking);


    const isScheduled =
        activeBooking?.bookingStatus ===
        "scheduled";


    const isPaid =
        activeBooking?.paymentStatus ===
        "paid";


    const isPaymentPending =
        activeBooking?.paymentStatus ===
        "pending";


    // =========================================================
    // NAVIGATION HANDLERS
    // =========================================================

    const handleGetStarted = () => {
        if (user) {
            navigate("/dashboard");
            return;
        }

        navigate("/login");
    };


    // =========================================================
    // MENTORSHIP BOOKING HANDLER
    // =========================================================

    const handleBookMentorship = () => {

        /*
         * User is not logged in.
         */
        if (!user) {
            navigate("/login");
            return;
        }


        /*
         * User already has an active booking.
         *
         * Do NOT allow another booking.
         *
         * Send them to Dashboard where they can
         * see their payment/session information.
         */
        if (hasActiveBooking) {
            navigate("/dashboard");
            return;
        }


        /*
         * No active booking.
         *
         * Continue to booking/payment.
         */
        navigate("/book-session");
    };


    // =========================================================
    // RESOURCE HANDLER
    // =========================================================

    const handleResources = () => {
        if (user) {
            navigate("/resources");
            return;
        }

        navigate("/login");
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error(
                "LOGOUT ERROR:",
                error
            );
        }
    };


    // =========================================================
    // LOGO
    // =========================================================

    const handleLogoClick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    // =========================================================
    // BOOKING BUTTON TEXT
    // =========================================================

    const getMentorshipButtonText = () => {

        if (checkingBooking) {
            return "Checking...";
        }

        if (hasActiveBooking) {
            return "View My Session";
        }

        return "Book Your Mentorship";
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="landing-page">


            {/* ==================================================
                NAVIGATION
            ================================================== */}

            <header className="landing-header">

                <div className="landing-container nav-container">


                    {/* ===============================
                        LOGO
                    =============================== */}

                    <button
                        type="button"
                        className="landing-logo"
                        onClick={handleLogoClick}
                    >

                        <div className="logo">
                            <img
                                src="/images/canada-rn-logo.png"
                                alt="Canada RN Mentorship"
                            />
                        </div>

                    </button>


                    {/* ===============================
                        NAVIGATION LINKS
                    =============================== */}

                    <nav className="landing-nav">

                        <a href="#home">
                            Home
                        </a>

                        <a href="#about">
                            About
                        </a>

                        <a href="#how-it-works">
                            How It Works
                        </a>

                        <a href="#resources">
                            Resources
                        </a>

                        <a href="#mentorship">
                            Mentorship
                        </a>

                        <a href="#faq">
                            FAQ
                        </a>

                    </nav>


                    {/* ===============================
                        NAV ACTIONS
                    =============================== */}

                    <div className="nav-actions">

                        {loading ? (

                            <div
                                className="nav-auth-loading"
                            >
                                ...
                            </div>

                        ) : user ? (

                            <>
                                <button
                                    type="button"
                                    className="nav-login-button"
                                    onClick={() =>
                                        navigate(
                                            "/dashboard"
                                        )
                                    }
                                >
                                    Dashboard
                                </button>


                                <button
                                    type="button"
                                    className="nav-primary-button"
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    Log Out
                                </button>
                            </>

                        ) : (

                            <>
                                <button
                                    type="button"
                                    className="nav-login-button"
                                    onClick={() =>
                                        navigate(
                                            "/login"
                                        )
                                    }
                                >
                                    Log In
                                </button>


                                <button
                                    type="button"
                                    className="nav-primary-button"
                                    onClick={
                                        handleGetStarted
                                    }
                                >
                                    Get Started
                                </button>
                            </>

                        )}

                    </div>

                </div>

            </header>


            <main>


                {/* ==================================================
                    HERO
                ================================================== */}

                <section
                    id="home"
                    className="hero-section"
                >

                    <div className="landing-container hero-grid">


                        <div className="hero-content">

                            <p className="section-eyebrow">
                                GUIDANCE. SUPPORT. SUCCESS.
                            </p>


                            <h1>
                                Your Path to Becoming

                                <span>
                                    a Registered Nurse in Canada
                                </span>
                            </h1>


                            <p className="hero-description">
                                Personalized 1-on-1 mentorship
                                for internationally educated
                                nurses. Get expert guidance,
                                clear direction, and the support
                                you need — every step of the way.
                            </p>


                            <div className="hero-buttons">

                                <button
                                    type="button"
                                    className="primary-button landing-primary"
                                    onClick={
                                        handleGetStarted
                                    }
                                >

                                    {user
                                        ? "Go to Dashboard"
                                        : "Get Started"}

                                    <span>
                                        →
                                    </span>

                                </button>


                                <a
                                    href="#how-it-works"
                                    className="secondary-button landing-secondary"
                                >
                                    Learn How It Works
                                </a>

                            </div>


                            <div className="hero-features">

                                <div className="hero-feature">

                                    <span className="feature-icon">
                                        ✓
                                    </span>

                                    <span>
                                        Personalized
                                        <br />
                                        Guidance
                                    </span>

                                </div>


                                <div className="hero-feature">

                                    <span className="feature-icon">
                                        ♡
                                    </span>

                                    <span>
                                        1-on-1
                                        <br />
                                        Mentorship
                                    </span>

                                </div>


                                <div className="hero-feature">

                                    <span className="feature-icon">
                                        ◷
                                    </span>

                                    <span>
                                        45-Minute
                                        <br />
                                        Session
                                    </span>

                                </div>


                                <div className="hero-feature">

                                    <span className="feature-icon">
                                        🔒
                                    </span>

                                    <span>
                                        Secure &
                                        <br />
                                        Confidential
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* ===============================
                            HERO VISUAL
                        =============================== */}

                        <div className="hero-visual">

                            <div className="hero-circle">

                                <div className="hero-map-shape">
                                    🍁
                                </div>

                            </div>


                            <div className="hero-nurse-card">

                                <div className="nurse-placeholder">

                                    <div className="nurse-avatar">

                                        <img
                                            src="/images/tin zar-profile.png"
                                            alt="Canada RN Mentorship"
                                        />

                                    </div>

                                    {/* <div className="nurse-stethoscope">
                                        ♡
                                    </div> */}

                                </div>

                            </div>


                            <div className="hero-floating-card">

                                <span className="floating-check">
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Your Journey
                                    </strong>

                                    <span>
                                        Starts Here
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ============================================================
    WHO THIS IS FOR
============================================================ */}

                <section className="who-section">

                    <div className="landing-container">

                        <div className="who-heading-row">

                            <div className="who-heading">

                                <p className="section-eyebrow">
                                    WHO THIS IS FOR
                                </p>

                                <h2>
                                    You don’t have to
                                    <br />
                                    figure it out alone.
                                </h2>

                            </div>


                            <div className="who-intro">

                                <p>
                                    Support for nurses from around the world
                                    who are exploring, planning, and navigating
                                    their Canadian journey.
                                </p>

                            </div>

                        </div>


                        {/* ====================================================
            AUDIENCE CARDS
        ==================================================== */}

                        <div className="who-cards">

                            <div className="who-card">

                                <div className="who-card-icon">
                                    🌐
                                </div>

                                <h3>
                                    Internationally
                                    <br />
                                    Educated Nurses
                                </h3>

                                <p>
                                    Exploring nursing
                                    <br />
                                    opportunities
                                    <br />
                                    in Canada.
                                </p>

                            </div>


                            <div className="who-card">

                                <div className="who-card-icon">
                                    📄
                                </div>

                                <h3>
                                    Nurses Navigating
                                    <br />
                                    Registration
                                </h3>

                                <p>
                                    Unsure about NNAS,
                                    <br />
                                    provincial registration
                                    <br />
                                    or NCLEX.
                                </p>

                            </div>


                            <div className="who-card">

                                <div className="who-card-icon">
                                    🧭
                                </div>

                                <h3>
                                    Nurses Unsure of
                                    <br />
                                    Their Next Step
                                </h3>

                                <p>
                                    Need help
                                    <br />
                                    understanding
                                    <br />
                                    your options.
                                </p>

                            </div>


                            <div className="who-card">

                                <div className="who-card-icon">
                                    💬
                                </div>

                                <h3>
                                    Nurses Looking for
                                    <br />
                                    Personal Guidance
                                </h3>

                                <p>
                                    Want to talk through
                                    <br />
                                    your specific
                                    <br />
                                    situation.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ========================================================
        CANADA JOURNEY BANNER
    ======================================================== */}

                    <div className="journey-banner">

                        <div className="journey-banner-overlay"></div>


                        <div className="landing-container journey-banner-inner">

                            <div className="journey-banner-title">

                                <span className="journey-red-line"></span>

                                <h2>
                                    Different Journeys.
                                    <br />
                                    A Brighter Future
                                    <br />
                                    in Canada.
                                </h2>

                            </div>


                            <div className="journey-banner-card">

                                <h3>
                                    Knowledge today.
                                    <br />
                                    More possibilities
                                    <br />
                                    tomorrow.
                                </h3>

                                <span className="journey-card-line"></span>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    HOW IT WORKS
                ================================================== */}

                <section
                    id="how-it-works"
                    className="how-section"
                >
                    <div className="landing-container">

                        {/* Section Heading */}
                        <div className="section-heading how-heading">

                            <p className="section-eyebrow">
                                HOW IT WORKS
                            </p>

                            <h2>
                                A Clearer Path Starts Here
                            </h2>

                            <div className="red-line center" />

                        </div>


                        {/* Steps */}
                        <div className="steps-grid">

                            {/* Step 1 */}
                            <div className="step-card">

                                <div className="step-number">
                                    1
                                </div>

                                <div className="step-icon">
                                    <span>👤</span>
                                </div>

                                <div className="step-content">

                                    <h3>
                                        Create Account
                                    </h3>

                                    <p>
                                        Sign up and create your account.
                                    </p>

                                </div>

                            </div>


                            {/* Step 2 */}
                            <div className="step-card">

                                <div className="step-number">
                                    2
                                </div>

                                <div className="step-icon">
                                    <span>📋</span>
                                </div>

                                <div className="step-content">

                                    <h3>
                                        Complete Profile
                                    </h3>

                                    <p>
                                        Tell us about your nursing
                                        background and goals.
                                    </p>

                                </div>

                            </div>


                            {/* Step 3 */}
                            <div className="step-card">

                                <div className="step-number">
                                    3
                                </div>

                                <div className="step-icon">
                                    <span>📚</span>
                                </div>

                                <div className="step-content">

                                    <h3>
                                        Explore Resources
                                    </h3>

                                    <p>
                                        Access helpful guidance and
                                        preparation resources.
                                    </p>

                                </div>

                            </div>


                            {/* Step 4 */}
                            <div className="step-card">

                                <div className="step-number">
                                    4
                                </div>

                                <div className="step-icon">
                                    <span>📅</span>
                                </div>

                                <div className="step-content">

                                    <h3>
                                        Book Mentorship
                                    </h3>

                                    <p>
                                        Schedule your 45-minute
                                        1-on-1 session.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>
                </section>


                {/* ==================================================
                    MENTORSHIP
                ================================================== */}

                <section
                    id="mentorship"
                    className="mentorship-section"
                >

                    <div className="landing-container mentorship-inner">


                        <div className="mentorship-visual">

                            <div className="mentorship-photo-placeholder">

                                <img
                                    src="/images/tinzar.png"
                                    alt="1-on-1 Mentorship"
                                />

                                <div className="mentorship-photo-caption">
                                    1-on-1
                                    <br />
                                    Mentorship
                                </div>

                            </div>

                        </div>


                        <div className="mentorship-content">

                            <p className="section-eyebrow light">
                                1-ON-1 MENTORSHIP
                            </p>


                            <h2 className="white">
                                Clarity
                                <br />
                                Direction
                                <br />
                                Confidence
                            </h2>


                            <p>
                                A personalized 45-minute
                                session to understand your
                                background, answer your
                                questions, and help you
                                identify the right next step.
                            </p>


                            <div className="mentorship-meta">

                                <span>
                                    ◷ 45 Minutes
                                </span>

                                <span>
                                    ◉ CA$125 CAD
                                </span>

                                <span>
                                    ▣ Zoom Session
                                </span>

                                <span>🔒 Non-refundable</span>

                            </div>


                            {/* =================================================
                                MENTORSHIP BOOKING BUTTON
                            ================================================= */}

                            <button
                                type="button"
                                className="primary-button light-button"
                                onClick={
                                    handleBookMentorship
                                }
                                disabled={
                                    checkingBooking
                                }
                            >

                                {getMentorshipButtonText()}

                                <span>
                                    →
                                </span>

                            </button>


                            {/* =================================================
                                ACTIVE BOOKING MESSAGE
                            ================================================= */}

                            {hasActiveBooking && (
                                <p className="mentorship-active-note">

                                    {isScheduled
                                        ? "You already have a scheduled session. View your session details from your dashboard."
                                        : isPaid
                                            ? "Your payment has been received. Continue from your dashboard to view your session details."
                                            : isPaymentPending
                                                ? "You already have a booking in progress. Continue from your dashboard."
                                                : "You already have an active mentorship booking."}

                                </p>
                            )}

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    RESOURCES
                ================================================== */}

                <section
                    id="resources"
                    className="resources-section"
                >
                    <div className="landing-container">

                        {/* =====================================================
            RESOURCES HEADER
        ===================================================== */}

                        <div className="resources-heading">

                            <div className="resources-heading-left">

                                <p className="section-eyebrow">
                                    FREE RESOURCES
                                </p>

                                <h2>
                                    Start Exploring
                                </h2>

                                <p className="resources-subtitle">
                                    Practical information to help you understand
                                    your Canadian nursing journey.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="resources-view-all"
                                onClick={handleResources}
                            >
                                View All Resources
                                <span>→</span>
                            </button>

                        </div>


                        {/* =====================================================
            RESOURCE CARDS
        ===================================================== */}

                        <div className="resources-grid">


                            {/* NNAS */}

                            <div className="resource-card">

                                <div className="resource-icon">
                                    <span>▤</span>
                                </div>

                                <h3>
                                    NNAS
                                </h3>

                                <p>
                                    Application
                                    <br />
                                    guidance
                                    <span className="resource-arrow">
                                        →
                                    </span>
                                </p>

                            </div>


                            {/* PROVINCIAL REGISTRATION */}

                            <div className="resource-card">

                                <div className="resource-icon">
                                    <span>♜</span>
                                </div>

                                <h3>
                                    Provincial
                                    <br />
                                    Registration
                                </h3>

                                <p>
                                    Understand
                                    <br />
                                    requirements
                                    <span className="resource-arrow">
                                        →
                                    </span>
                                </p>

                            </div>


                            {/* NCLEX */}

                            <div className="resource-card">

                                <div className="resource-icon">
                                    <span>▱</span>
                                </div>

                                <h3>
                                    NCLEX-RN
                                </h3>

                                <p>
                                    Understand
                                    <br />
                                    your pathway
                                    <span className="resource-arrow">
                                        →
                                    </span>
                                </p>

                            </div>


                            {/* IMMIGRATION */}

                            <div className="resource-card">

                                <div className="resource-icon">
                                    <span>✈</span>
                                </div>

                                <h3>
                                    Immigration
                                    <br />
                                    Pathways
                                </h3>

                                <p>
                                    Explore options
                                    <span className="resource-arrow">
                                        →
                                    </span>
                                </p>

                            </div>


                            {/* CAREER */}

                            <div className="resource-card">

                                <div className="resource-icon">
                                    <span>◎</span>
                                </div>

                                <h3>
                                    Career
                                    <br />
                                    Planning
                                </h3>

                                <p>
                                    Plan your
                                    <br />
                                    next step
                                    <span className="resource-arrow">
                                        →
                                    </span>
                                </p>

                            </div>


                            {/* MORE RESOURCES */}

                            <div className="resource-card">

                                <div className="resource-icon">
                                    <span>▱</span>
                                </div>

                                <h3>
                                    More
                                    <br />
                                    Resources
                                </h3>

                                <p>
                                    Explore the
                                    <br />
                                    library
                                    <span className="resource-arrow">
                                        →
                                    </span>
                                </p>

                            </div>

                        </div>

                    </div>
                </section>


                {/* ==================================================
                    ABOUT
                ================================================== */}

                <section
                    id="about"
                    className="about-section"
                >
                    <div className="landing-container about-grid">

                        {/* =====================================================
            LEFT — CANADA / TORONTO VISUAL
        ===================================================== */}

                        <div className="about-visual">

                            <div className="about-image-wrap">

                                <img
                                    src="/images/toronto-about.png"
                                    alt="Toronto skyline and CN Tower with Canadian maple leaf"
                                />

                                <div className="about-image-overlay"></div>

                            </div>

                        </div>


                        {/* =====================================================
            RIGHT — ABOUT CONTENT
        ===================================================== */}

                        <div className="about-content">

                            <p className="section-eyebrow">
                                ABOUT CANADA RN MENTORSHIP
                            </p>


                            <h2>
                                From Experience.
                                <br />
                                For Nurses.
                                <br />
                                With Heart.
                            </h2>


                            <div className="red-line" />


                            <div className="about-description">

                                <p>
                                    Starting a nursing career in a new
                                    country can feel overwhelming.
                                </p>

                                <p>
                                    Canada RN Mentorship was created to
                                    provide practical guidance and support
                                    so you don't have to navigate your
                                    Canadian nursing journey alone.
                                </p>

                            </div>


                            {/* =================================================
                ABOUT FEATURES
            ================================================= */}

                            <ul className="about-list">

                                <li>
                                    <span>✓</span>
                                    <div>
                                        <strong>
                                            Experienced RN Mentor
                                        </strong>
                                        <small>
                                            Guidance grounded in real nursing experience.
                                        </small>
                                    </div>
                                </li>


                                <li>
                                    <span>✓</span>
                                    <div>
                                        <strong>
                                            Canadian Healthcare Knowledge
                                        </strong>
                                        <small>
                                            Understand Canadian nursing pathways.
                                        </small>
                                    </div>
                                </li>


                                <li>
                                    <span>✓</span>
                                    <div>
                                        <strong>
                                            Empathetic & Personalized Support
                                        </strong>
                                        <small>
                                            Guidance tailored to your situation.
                                        </small>
                                    </div>
                                </li>


                                <li>
                                    <span>✓</span>
                                    <div>
                                        <strong>
                                            Judgment-Free Guidance
                                        </strong>
                                        <small>
                                            A safe space to ask questions.
                                        </small>
                                    </div>
                                </li>

                            </ul>

                        </div>

                    </div>
                </section>


                {/* ==================================================
                    FAQ
                ================================================== */}

                <section
                    id="faq"
                    className="faq-section"
                >
                    <div className="landing-container">

                        <div className="faq-header">

                            <div className="faq-header-left">

                                <p className="section-eyebrow">
                                    FAQ
                                </p>

                                <h2>
                                    Frequently Asked
                                    <br />
                                    Questions
                                </h2>

                                <div className="faq-red-line" />

                            </div>


                            <div className="faq-header-right">

                                <p>
                                    A few common questions about
                                    Canada RN Mentorship and what
                                    to expect from your session.
                                </p>

                            </div>

                        </div>


                        <div className="faq-list">


                            <details>

                                <summary>
                                    <span className="faq-question">
                                        Who is the mentorship for?
                                    </span>

                                    <span className="faq-toggle">
                                        +
                                    </span>
                                </summary>

                                <p>
                                    Canada RN Mentorship is designed for
                                    internationally educated nurses who are
                                    exploring nursing opportunities in Canada,
                                    navigating registration, or simply unsure
                                    about their next step.
                                </p>

                            </details>


                            <details>

                                <summary>
                                    <span className="faq-question">
                                        Is this immigration advice?
                                    </span>

                                    <span className="faq-toggle">
                                        +
                                    </span>
                                </summary>

                                <p>
                                    Mentorship can help you understand
                                    general immigration pathways and how
                                    they may relate to your nursing journey.
                                    It is not legal immigration advice or
                                    representation.
                                </p>

                            </details>


                            <details>

                                <summary>
                                    <span className="faq-question">
                                        How long is a mentorship session?
                                    </span>

                                    <span className="faq-toggle">
                                        +
                                    </span>
                                </summary>

                                <p>
                                    Each 1-on-1 mentorship session is
                                    approximately 45 minutes and is held
                                    online through Zoom.
                                </p>

                            </details>


                            <details>

                                <summary>
                                    <span className="faq-question">
                                        What happens after I book?
                                    </span>

                                    <span className="faq-toggle">
                                        +
                                    </span>
                                </summary>

                                <p>
                                    After your payment is received, you will
                                    complete your booking through Calendly.
                                    Your Zoom meeting details will be provided
                                    once your session is scheduled.
                                </p>

                            </details>

                        </div>

                    </div>
                </section>


                {/* ==================================================
    FINAL CTA
================================================== */}

                <section className="final-cta">

                    <div className="final-cta-bg"></div>

                    <div className="landing-container final-cta-inner">

                        <div className="final-cta-content">

                            <p className="final-cta-eyebrow">
                                READY TO TAKE THE NEXT STEP?
                            </p>

                            <h2>
                                Your Canadian Nursing
                                <br />
                                Journey Starts Here.
                            </h2>

                            <p className="final-cta-description">
                                Get personalized guidance, practical support,
                                and the confidence to build your nursing
                                career in Canada.
                            </p>

                        </div>


                        <div className="final-cta-action">

                            <button
                                type="button"
                                className="final-cta-button"
                                onClick={handleGetStarted}
                            >

                                {user
                                    ? "Go to Dashboard"
                                    : "Get Started Today"}

                                <span>
                                    →
                                </span>

                            </button>


                            <div className="final-cta-benefits">

                                <div className="final-cta-benefit">

                                    <span className="final-cta-benefit-icon">
                                        ✓
                                    </span>

                                    <span>
                                        1-on-1 Guidance
                                    </span>

                                </div>


                                <div className="final-cta-benefit">

                                    <span className="final-cta-benefit-icon">
                                        ✓
                                    </span>

                                    <span>
                                        Practical Support
                                    </span>

                                </div>


                                <div className="final-cta-benefit">

                                    <span className="final-cta-benefit-icon">
                                        ✓
                                    </span>

                                    <span>
                                        Nursing Success
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


            </main>


            {/* ==================================================
    FOOTER
================================================== */}

            <footer className="landing-footer">


                {/* ==================================================
        DESKTOP FOOTER
    ================================================== */}

                <div className="landing-desktop-footer">

                    <div className="landing-container footer-grid">


                        {/* BRAND */}

                        <div className="footer-brand">

                            <a
                                href="#home"
                                className="footer-logo"
                            >

                                <img
                                    src="/images/canada-rn-logo.png"
                                    alt="Canada RN Mentorship"
                                />

                            </a>


                            <p className="footer-tagline">
                                Guidance. Support. Success.
                                <br />
                                Every step of the way.
                            </p>


                            <div className="footer-socials">

                                <a
                                    href="#"
                                    aria-label="Instagram"
                                >
                                    ◎
                                </a>

                                <a
                                    href="#"
                                    aria-label="YouTube"
                                >
                                    ▶
                                </a>

                                <a
                                    href="#"
                                    aria-label="LinkedIn"
                                >
                                    in
                                </a>

                            </div>

                        </div>


                        {/* QUICK LINKS */}

                        <div className="footer-column">

                            <h4>
                                Quick Links
                            </h4>

                            <a href="#home">
                                Home
                            </a>

                            <a href="#about">
                                About
                            </a>

                            <a href="#how-it-works">
                                How It Works
                            </a>

                            <a href="#resources">
                                Resources
                            </a>

                            <a href="#faq">
                                FAQ
                            </a>

                        </div>


                        {/* MORE */}

                        <div className="footer-column">

                            <h4>
                                More
                            </h4>

                            <a href="#mentorship">
                                Mentorship
                            </a>

                            <a href="#resources">
                                Free Resources
                            </a>

                            <button
                                type="button"
                                onClick={
                                    user
                                        ? () =>
                                            navigate(
                                                "/dashboard"
                                            )
                                        : () =>
                                            navigate(
                                                "/login"
                                            )
                                }
                            >

                                {user
                                    ? "Dashboard"
                                    : "Log In"}

                            </button>

                        </div>


                        {/* LEGAL */}

                        <div className="footer-column">

                            <h4>
                                Legal
                            </h4>

                            <button type="button">
                                Terms of Service
                            </button>

                            <button type="button">
                                Privacy Policy
                            </button>

                            <button type="button">
                                Disclaimer
                            </button>

                        </div>


                        {/* CONNECT */}

                        <div className="footer-column footer-connect">

                            <h4>
                                Connect With Me
                            </h4>

                            <span>
                                ✉
                                canadarnmentorshipbytz@gmail.com
                            </span>

                            <span>
                                📍
                                Canada
                            </span>

                            <span>
                                ✦
                                Future RNs in Canada
                            </span>

                        </div>

                    </div>


                    {/* FOOTER BOTTOM */}

                    <div className="landing-container footer-bottom">

                        <span>
                            © 2026 Canada RN Mentorship.
                            All rights reserved.
                        </span>

                        <span>
                            🍁 Empowering Internationally Educated Nurses in Canada.
                        </span>

                    </div>

                </div>


                {/* ==================================================
        MOBILE FOOTER
    ================================================== */}

                <div className="landing-mobile-footer">


                    <div className="mobile-footer-brand">

                        <a
                            href="#home"
                            className="mobile-footer-logo"
                        >

                            <img
                                src="/images/canada-rn-logo.png"
                                alt="Canada RN Mentorship"
                            />

                        </a>


                        <p>
                            Guidance. Support. Success.
                            <br />
                            Every step of the way.
                        </p>


                        <div className="mobile-footer-socials">

                            <a href="#" aria-label="Instagram">
                                ◎
                            </a>

                            <a href="#" aria-label="YouTube">
                                ▶
                            </a>

                            <a href="#" aria-label="LinkedIn">
                                in
                            </a>

                        </div>

                    </div>


                    {/* QUICK LINKS */}

                    <details className="mobile-footer-accordion">

                        <summary>
                            Quick Links
                            <span>+</span>
                        </summary>

                        <div className="mobile-footer-links">

                            <a href="#home">
                                Home
                            </a>

                            <a href="#about">
                                About
                            </a>

                            <a href="#how-it-works">
                                How It Works
                            </a>

                            <a href="#resources">
                                Resources
                            </a>

                            <a href="#faq">
                                FAQ
                            </a>

                        </div>

                    </details>


                    {/* MORE */}

                    <details className="mobile-footer-accordion">

                        <summary>
                            More
                            <span>+</span>
                        </summary>

                        <div className="mobile-footer-links">

                            <a href="#mentorship">
                                Mentorship
                            </a>

                            <a href="#resources">
                                Free Resources
                            </a>

                            <button
                                type="button"
                                onClick={
                                    user
                                        ? () =>
                                            navigate(
                                                "/dashboard"
                                            )
                                        : () =>
                                            navigate(
                                                "/login"
                                            )
                                }
                            >

                                {user
                                    ? "Dashboard"
                                    : "Log In"}

                            </button>

                        </div>

                    </details>


                    {/* LEGAL */}

                    <details className="mobile-footer-accordion">

                        <summary>
                            Legal
                            <span>+</span>
                        </summary>

                        <div className="mobile-footer-links">

                            <button type="button">
                                Terms of Service
                            </button>

                            <button type="button">
                                Privacy Policy
                            </button>

                            <button type="button">
                                Disclaimer
                            </button>

                        </div>

                    </details>


                    {/* CONNECT */}

                    <details className="mobile-footer-accordion">

                        <summary>
                            Connect With Me
                            <span>+</span>
                        </summary>

                        <div className="mobile-footer-links">

                            <span>
                                ✉ canadarnmentorshipbytz@gmail.com
                            </span>

                            <span>
                                📍 Canada
                            </span>

                            <span>
                                ✦ Future RNs in Canada
                            </span>

                        </div>

                    </details>


                    <div className="mobile-footer-bottom">

                        © 2026 Canada RN Mentorship.
                        All rights reserved.

                    </div>

                </div>

            </footer>

        </div>
    );
};


export default LandingPage;
