import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-mark">🍁</div>

                    <div>
                        <h2>Canada RN</h2>
                        <span>Mentorship</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        My Profile
                    </NavLink>

                    <button className="nav-link nav-button">
                        My Journey
                    </button>

                    <button className="nav-link nav-button">
                        Bookings
                    </button>

                    <button className="nav-link nav-button">
                        Resources
                    </button>

                    <button className="nav-link nav-button">
                        Documents
                    </button>
                </nav>

                <div className="sidebar-bottom">
                    <div className="user-mini">
                        <div className="avatar">
                            {user?.firstName?.charAt(0)}
                            {user?.lastName?.charAt(0)}
                        </div>

                        <div>
                            <strong>
                                {user?.firstName} {user?.lastName}
                            </strong>

                            <span>{user?.role}</span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div>
                        <span className="topbar-label">
                            Canada RN Mentorship
                        </span>
                    </div>

                    <div className="topbar-user">
                        <span>
                            {user?.firstName} {user?.lastName}
                        </span>

                        <div className="avatar small">
                            {user?.firstName?.charAt(0)}
                            {user?.lastName?.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;