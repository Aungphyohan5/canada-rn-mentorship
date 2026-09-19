import {
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext.jsx";

import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close the mobile menu whenever the route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname, location.hash]);

    // Prevent background scrolling while the mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add("mobile-menu-open");
        } else {
            document.body.classList.remove("mobile-menu-open");
        }

        return () => {
            document.body.classList.remove("mobile-menu-open");
        };
    }, [isMobileMenuOpen]);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((previousState) => !previousState);
    };

    // =========================================================
    // NAVIGATION HELPERS
    // =========================================================

    const goToDashboardSection = (sectionId) => {
        closeMobileMenu();

        if (location.pathname === "/dashboard") {
            const element = document.getElementById(sectionId);

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                window.history.replaceState(
                    null,
                    "",
                    `/dashboard#${sectionId}`
                );

                return;
            }
        }

        navigate(`/dashboard#${sectionId}`);
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {
        closeMobileMenu();

        try {
            await logout();
        } catch (error) {
            console.error("LOGOUT ERROR:", error);
        }
    };

    // =========================================================
    // USER INITIALS
    // =========================================================

    const firstInitial =
        user?.firstName?.charAt(0)?.toUpperCase() || "";

    const lastInitial =
        user?.lastName?.charAt(0)?.toUpperCase() || "";

    return (
        <div className="dashboard-layout">
            {/* =================================================
                MOBILE OVERLAY
            ================================================== */}

            {isMobileMenuOpen && (
                <button
                    type="button"
                    className="mobile-menu-overlay"
                    aria-label="Close navigation menu"
                    onClick={closeMobileMenu}
                />
            )}

            {/* =================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`sidebar ${isMobileMenuOpen ? "sidebar-mobile-open" : ""
                    }`}
            >
                {/* =================================================
                    BRAND
                ================================================== */}

                <div
                    className="dashboard-logo"
                    onClick={() => {
                        closeMobileMenu();
                        navigate("/");
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {
                            closeMobileMenu();
                            navigate("/");
                        }
                    }}
                >
                    <div className="dashboard-logo-mark">
                        🍁
                    </div>

                    <div className="dashboard-logo-text">
                        <strong>Canada RN</strong>
                        <span>Mentorship</span>
                    </div>
                </div>

                {/* =================================================
                    MOBILE SIDEBAR CLOSE BUTTON
                ================================================== */}

                <button
                    type="button"
                    className="mobile-sidebar-close"
                    onClick={closeMobileMenu}
                    aria-label="Close navigation menu"
                >
                    ×
                </button>

                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <nav className="sidebar-nav">
                    <NavLink
                        to="/dashboard"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/profile"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        My Profile
                    </NavLink>

                    <button
                        type="button"
                        className="nav-link nav-button"
                        onClick={() =>
                            goToDashboardSection("journey")
                        }
                    >
                        My Journey
                    </button>

                    <button
                        type="button"
                        className="nav-link nav-button"
                        onClick={() =>
                            goToDashboardSection("bookings")
                        }
                    >
                        Bookings
                    </button>

                    <NavLink
                        to="/resources"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Resources
                    </NavLink>
                </nav>

                {/* =================================================
                    SIDEBAR BOTTOM
                ================================================== */}

                <div className="sidebar-bottom">
                    <div className="user-mini">
                        <div className="avatar">
                            {firstInitial}
                            {lastInitial}
                        </div>

                        <div>
                            <strong>
                                {user?.firstName || ""}{" "}
                                {user?.lastName || ""}
                            </strong>

                            <span>
                                {user?.role || "Nurse"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* =================================================
                MAIN
            ================================================== */}

            <main className="dashboard-main">
                {/* =================================================
                    TOP BAR
                ================================================== */}

                <header className="dashboard-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="mobile-menu-toggle"
                            onClick={toggleMobileMenu}
                            aria-label={
                                isMobileMenuOpen
                                    ? "Close navigation menu"
                                    : "Open navigation menu"
                            }
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span />
                            <span />
                            <span />
                        </button>

                        <span className="topbar-label">
                            Canada RN Mentorship
                        </span>
                    </div>

                    <div className="topbar-user">
                        <span>
                            {user?.firstName || ""}{" "}
                            {user?.lastName || ""}
                        </span>

                        <div className="avatar small">
                            {firstInitial}
                            {lastInitial}
                        </div>
                    </div>
                </header>

                {/* =================================================
                    PAGE CONTENT
                ================================================== */}

                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;