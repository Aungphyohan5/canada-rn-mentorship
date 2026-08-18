import "./LandingPage.css";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const LandingPage = () => {
    const navigate = useNavigate();

    const {
        user,
        loading,
        logout,
    } = useAuth();


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


    const handleBookMentorship = () => {
        if (user) {
            navigate("/book-session");
            return;
        }

        navigate("/login");
    };


    const handleResources = () => {
        if (user) {
            navigate("/resources");
            return;
        }

        navigate("/login");
    };


    const handleLogout = () => {
        logout();
        navigate("/");
    };


    const handleLogoClick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
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

                        <div className="logo-mark">
                            🍁
                        </div>


                        <div className="logo-text">

                            <strong>
                                Canada RN
                            </strong>

                            <span>
                                Mentorship
                            </span>

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

                            /*
                             * While AuthContext is checking
                             * /auth/me, don't show the wrong
                             * logged-in/logged-out state.
                             */

                            <div
                                className="nav-auth-loading"
                            >
                                ...
                            </div>

                        ) : user ? (

                            /*
                             * ============================
                             * LOGGED IN
                             * ============================
                             */

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

                            /*
                             * ============================
                             * LOGGED OUT
                             * ============================
                             */

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
                                        👩🏻‍⚕️
                                    </div>

                                    <div className="nurse-stethoscope">
                                        ♡
                                    </div>

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



                {/* ==================================================
                    WHO THIS IS FOR
                ================================================== */}

                <section className="audience-section">

                    <div className="landing-container audience-grid">


                        <div>

                            <p className="section-eyebrow">
                                WHO THIS IS FOR
                            </p>


                            <h2>
                                Guidance for Nurses
                                Navigating Their
                                Canadian Journey
                            </h2>


                            <div className="red-line" />


                            <ul className="check-list">

                                <li>
                                    <span>✓</span>
                                    Internationally educated
                                    nurses (IENs)
                                </li>

                                <li>
                                    <span>✓</span>
                                    Nurses exploring
                                    Canadian registration
                                </li>

                                <li>
                                    <span>✓</span>
                                    Nurses unsure about
                                    their next steps
                                </li>

                                <li>
                                    <span>✓</span>
                                    Nurses needing
                                    personalized guidance
                                </li>

                                <li>
                                    <span>✓</span>
                                    Anyone seeking clarity
                                    and support
                                </li>

                            </ul>

                        </div>



                        <div>

                            <p className="section-eyebrow">
                                WHAT YOU CAN GET HELP WITH
                            </p>


                            <h2>
                                Understand Your Options
                            </h2>


                            <div className="red-line" />



                            <div className="help-grid">


                                <div className="help-card">

                                    <span>📄</span>

                                    <strong>
                                        NNAS
                                    </strong>

                                    <small>
                                        Application guidance
                                    </small>

                                </div>



                                <div className="help-card">

                                    <span>🏛️</span>

                                    <strong>
                                        Provincial
                                        Registration
                                    </strong>

                                    <small>
                                        Understand requirements
                                    </small>

                                </div>



                                <div className="help-card">

                                    <span>📋</span>

                                    <strong>
                                        NCLEX-RN
                                    </strong>

                                    <small>
                                        Understand your pathway
                                    </small>

                                </div>



                                <div className="help-card">

                                    <span>✈️</span>

                                    <strong>
                                        Immigration
                                    </strong>

                                    <small>
                                        Explore pathways
                                    </small>

                                </div>



                                <div className="help-card">

                                    <span>🎯</span>

                                    <strong>
                                        Career Planning
                                    </strong>

                                    <small>
                                        Plan your next step
                                    </small>

                                </div>



                                <div className="help-card">

                                    <span>•••</span>

                                    <strong>
                                        And More
                                    </strong>

                                    <small>
                                        Personalized support
                                    </small>

                                </div>


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


                        <div className="section-heading">

                            <p className="section-eyebrow">
                                HOW IT WORKS
                            </p>

                            <h2>
                                A Clearer Path Starts Here
                            </h2>

                            <div className="red-line center" />

                        </div>



                        <div className="steps-grid">


                            <div className="step-card">

                                <div className="step-number">
                                    1
                                </div>

                                <div className="step-icon">
                                    👤
                                </div>

                                <h3>
                                    Create Account
                                </h3>

                                <p>
                                    Sign up and create
                                    your account.
                                </p>

                            </div>



                            <div className="step-card">

                                <div className="step-number">
                                    2
                                </div>

                                <div className="step-icon">
                                    📋
                                </div>

                                <h3>
                                    Complete Profile
                                </h3>

                                <p>
                                    Tell us about your
                                    nursing background
                                    and goals.
                                </p>

                            </div>



                            <div className="step-card">

                                <div className="step-number">
                                    3
                                </div>

                                <div className="step-icon">
                                    📚
                                </div>

                                <h3>
                                    Explore Resources
                                </h3>

                                <p>
                                    Access helpful
                                    guidance and
                                    preparation resources.
                                </p>

                            </div>



                            <div className="step-card">

                                <div className="step-number">
                                    4
                                </div>

                                <div className="step-icon">
                                    📅
                                </div>

                                <h3>
                                    Book Mentorship
                                </h3>

                                <p>
                                    Schedule your
                                    45-minute
                                    1-on-1 session.
                                </p>

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

                                👩🏻‍⚕️

                                <span>
                                    1-on-1
                                    <br />
                                    Mentorship
                                </span>

                            </div>

                        </div>



                        <div className="mentorship-content">

                            <p className="section-eyebrow light">
                                1-ON-1 MENTORSHIP
                            </p>


                            <h2>
                                Clarity.
                                <br />
                                Direction.
                                <br />
                                Confidence.
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

                            </div>



                            <button
                                type="button"
                                className="primary-button light-button"
                                onClick={
                                    handleBookMentorship
                                }
                            >

                                {user
                                    ? "Book Your Mentorship"
                                    : "Book Your Mentorship"}

                                <span>
                                    →
                                </span>

                            </button>

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


                        <div className="section-heading">

                            <p className="section-eyebrow">
                                RESOURCES
                            </p>

                            <h2>
                                Resources at Your Fingertips
                            </h2>

                            <div className="red-line center" />

                            <p className="section-subtitle">

                                Practical information to help
                                you understand your Canadian
                                nursing journey.

                            </p>

                        </div>



                        <div className="resources-grid">


                            <div className="resource-card">

                                <div className="resource-icon">
                                    📘
                                </div>

                                <h3>
                                    NNAS Guide
                                </h3>

                                <p>
                                    Step-by-step guidance
                                    for your NNAS application.
                                </p>

                                <span>
                                    Explore →
                                </span>

                            </div>



                            <div className="resource-card">

                                <div className="resource-icon">
                                    🏛️
                                </div>

                                <h3>
                                    Provincial Registration
                                </h3>

                                <p>
                                    Understand registration
                                    requirements by province.
                                </p>

                                <span>
                                    Explore →
                                </span>

                            </div>



                            <div className="resource-card">

                                <div className="resource-icon">
                                    📋
                                </div>

                                <h3>
                                    NCLEX-RN
                                </h3>

                                <p>
                                    Learn about the
                                    NCLEX-RN journey.
                                </p>

                                <span>
                                    Explore →
                                </span>

                            </div>



                            <div className="resource-card">

                                <div className="resource-icon">
                                    ✈️
                                </div>

                                <h3>
                                    Immigration Pathways
                                </h3>

                                <p>
                                    Explore immigration
                                    options and requirements.
                                </p>

                                <span>
                                    Explore →
                                </span>

                            </div>



                            <div className="resource-card">

                                <div className="resource-icon">
                                    🌐
                                </div>

                                <h3>
                                    Useful Links
                                </h3>

                                <p>
                                    Official websites and
                                    important resources.
                                </p>

                                <span>
                                    Explore →
                                </span>

                            </div>


                        </div>



                        <div className="resources-button">

                            <button
                                type="button"
                                className="outline-button"
                                onClick={
                                    handleResources
                                }
                            >

                                View All Resources

                            </button>

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


                        <div className="about-visual">

                            <div className="canada-placeholder">

                                🍁

                                <span>
                                    CANADA
                                </span>

                            </div>

                        </div>



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


                            <p>

                                Starting a nursing career
                                in a new country can feel
                                overwhelming.

                            </p>


                            <p>

                                This mentorship platform
                                was created to provide
                                practical guidance and
                                support so you don't have
                                to navigate the journey
                                alone.

                            </p>



                            <ul className="about-list">


                                <li>
                                    <span>✓</span>
                                    Experienced RN Mentor
                                </li>


                                <li>
                                    <span>✓</span>
                                    Canadian Healthcare
                                    Knowledge
                                </li>


                                <li>
                                    <span>✓</span>
                                    Empathetic &
                                    Personalized Support
                                </li>


                                <li>
                                    <span>✓</span>
                                    Judgment-Free Guidance
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


                        <div className="section-heading">

                            <p className="section-eyebrow">
                                FAQ
                            </p>

                            <h2>
                                Frequently Asked Questions
                            </h2>

                            <div className="red-line center" />

                        </div>



                        <div className="faq-list">


                            <details>

                                <summary>
                                    Who is the mentorship for?
                                    <span>+</span>
                                </summary>

                                <p>

                                    The service is designed
                                    primarily for internationally
                                    educated nurses and nurses
                                    exploring registration and
                                    career pathways in Canada.

                                </p>

                            </details>



                            <details>

                                <summary>
                                    Is this immigration advice?
                                    <span>+</span>
                                </summary>

                                <p>

                                    This is educational
                                    mentorship and general
                                    information only. It is not
                                    legal advice or regulated
                                    immigration representation.

                                </p>

                            </details>



                            <details>

                                <summary>
                                    How long is a mentorship
                                    session?
                                    <span>+</span>
                                </summary>

                                <p>

                                    The current mentorship
                                    session is 45 minutes and
                                    is conducted online.

                                </p>

                            </details>



                            <details>

                                <summary>
                                    What happens after I book?
                                    <span>+</span>
                                </summary>

                                <p>

                                    After payment, you will
                                    choose an available
                                    appointment time through
                                    Calendly. Your confirmed
                                    session information will
                                    appear in your account.

                                </p>

                            </details>


                        </div>

                    </div>

                </section>



                {/* ==================================================
                    FINAL CTA
                ================================================== */}

                <section className="final-cta">

                    <div className="landing-container final-cta-inner">

                        <h2>

                            Your Canadian Nursing
                            Journey Starts Here

                        </h2>


                        <button
                            type="button"
                            className="cta-outline-button"
                            onClick={
                                handleGetStarted
                            }
                        >

                            {user
                                ? "Go to Dashboard"
                                : "Get Started Today"}

                            <span>
                                →
                            </span>

                        </button>

                    </div>

                </section>

            </main>



            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer className="landing-footer">

                <div className="landing-container footer-grid">


                    {/* ===============================
                        FOOTER BRAND
                    =============================== */}

                    <div className="footer-brand">

                        <div className="footer-logo">

                            <div className="logo-mark">
                                🍁
                            </div>

                            <div className="logo-text">

                                <strong>
                                    Canada RN
                                </strong>

                                <span>
                                    Mentorship
                                </span>

                            </div>

                        </div>


                        <p>

                            Guidance. Support. Success.
                            <br />
                            Every step of the way.

                        </p>

                    </div>



                    {/* ===============================
                        QUICK LINKS
                    =============================== */}

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

                    </div>



                    {/* ===============================
                        MORE
                    =============================== */}

                    <div className="footer-column">

                        <h4>
                            More
                        </h4>


                        <a href="#mentorship">
                            Mentorship
                        </a>


                        <a href="#faq">
                            FAQ
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



                    {/* ===============================
                        LEGAL
                    =============================== */}

                    <div className="footer-column">

                        <h4>
                            Legal
                        </h4>


                        <span>
                            Terms of Service
                        </span>


                        <span>
                            Privacy Policy
                        </span>


                        <span>
                            Disclaimer
                        </span>

                    </div>



                    {/* ===============================
                        CONNECT
                    =============================== */}

                    <div className="footer-column">

                        <h4>
                            Connect With Me
                        </h4>


                        <span>
                            ✉ info@canadarnmentorship.com
                        </span>


                        <span>
                            📍 Canada
                        </span>


                        <span>
                            Future RNs in Canada
                        </span>

                    </div>


                </div>



                {/* ===============================
                    FOOTER BOTTOM
                =============================== */}

                <div className="footer-bottom">

                    <div className="landing-container">

                        © 2026 Canada RN Mentorship.
                        All rights reserved.

                    </div>

                </div>

            </footer>

        </div>
    );
};

export default LandingPage;