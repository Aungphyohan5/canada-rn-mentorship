import {
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

import "./DashboardLayout.css";


const DashboardLayout = ({ children }) => {

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const location = useLocation();


    // =========================================================
    // NAVIGATION HELPERS
    // =========================================================

    const goToDashboardSection = (sectionId) => {

        /*
         * If we are already on the dashboard,
         * scroll directly to the section.
         */

        if (location.pathname === "/dashboard") {

            const element =
                document.getElementById(
                    sectionId
                );

            if (element) {

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                /*
                 * Update the URL hash without
                 * causing a page reload.
                 */

                window.history.replaceState(
                    null,
                    "",
                    `/dashboard#${sectionId}`
                );

                return;
            }
        }


        /*
         * If we are on another page,
         * navigate to the dashboard with
         * the appropriate hash.
         *
         * Dashboard.jsx will handle
         * scrolling after it loads.
         */

        navigate(
            `/dashboard#${sectionId}`
        );
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {

        try {

            await logout();

        } catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );

        }

    };


    // =========================================================
    // USER INITIALS
    // =========================================================

    const firstInitial =
        user?.firstName
            ?.charAt(0)
            ?.toUpperCase() || "";

    const lastInitial =
        user?.lastName
            ?.charAt(0)
            ?.toUpperCase() || "";


    return (

        <div className="dashboard-layout">


            {/* =================================================
                SIDEBAR
            ================================================== */}

            <aside className="sidebar">


                {/* =================================================
                    BRAND
                ================================================== */}

                <div className="sidebar-brand">

                    <div className="brand-mark">
                        🍁
                    </div>


                    <div>

                        <h2>
                            Canada RN
                        </h2>

                        <span>
                            Mentorship
                        </span>

                    </div>

                </div>



                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <nav className="sidebar-nav">


                    {/* =================================================
                        DASHBOARD
                    ================================================== */}

                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Dashboard
                    </NavLink>



                    {/* =================================================
                        PROFILE
                    ================================================== */}

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        My Profile
                    </NavLink>



                    {/* =================================================
                        MY JOURNEY
                    ================================================== */}

                    <button
                        type="button"
                        className="nav-link nav-button"
                        onClick={() =>
                            goToDashboardSection(
                                "journey"
                            )
                        }
                    >
                        My Journey
                    </button>



                    {/* =================================================
                        BOOKINGS
                    ================================================== */}

                    <button
                        type="button"
                        className="nav-link nav-button"
                        onClick={() =>
                            goToDashboardSection(
                                "bookings"
                            )
                        }
                    >
                        Bookings
                    </button>



                    {/* =================================================
                        RESOURCES
                    ================================================== */}

                    <NavLink
                        to="/resources"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Resources
                    </NavLink>



                    {/* =================================================
                        DOCUMENTS
                    ================================================= */}

                    <button
                        type="button"
                        className="nav-link nav-button"
                        onClick={() =>
                            navigate(
                                "/documents"
                            )
                        }
                    >
                        Documents
                    </button>

                </nav>



                {/* =================================================
                    SIDEBAR BOTTOM
                ================================================== */}

                <div className="sidebar-bottom">


                    {/* =================================================
                        USER
                    ================================================== */}

                    <div className="user-mini">

                        <div className="avatar">

                            {firstInitial}

                            {lastInitial}

                        </div>


                        <div>

                            <strong>

                                {user?.firstName || ""}

                                {" "}

                                {user?.lastName || ""}

                            </strong>


                            <span>

                                {user?.role || "Nurse"}

                            </span>

                        </div>

                    </div>



                    {/* =================================================
                        LOGOUT
                    ================================================== */}

                    <button
                        type="button"
                        className="logout-button"
                        onClick={
                            handleLogout
                        }
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


                    <div>

                        <span className="topbar-label">

                            Canada RN Mentorship

                        </span>

                    </div>



                    <div className="topbar-user">


                        <span>

                            {user?.firstName || ""}

                            {" "}

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