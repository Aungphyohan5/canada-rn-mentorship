import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [pathway, setPathway] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [profileResponse, pathwayResponse] =
                    await Promise.all([
                        api.get("/nurse-profile/me"),
                        api.get("/pathway/me"),
                    ]);

                setProfile(
                    profileResponse.data.data.profile
                );

                setPathway(pathwayResponse.data.data);
            } catch (error) {
                console.error(
                    "DASHBOARD DATA ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <p>Loading dashboard...</p>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <p>{error}</p>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="dashboard-page">

                {/* Welcome */}
                <div className="dashboard-welcome">
                    <p className="eyebrow">
                        CANADA RN MENTORSHIP
                    </p>

                    <h1>
                        Welcome back, {user?.firstName} 👋
                    </h1>

                    <p>
                        Continue your journey toward becoming
                        an RN in Canada.
                    </p>
                </div>

                {/* Journey Progress */}
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
                            {pathway?.completionPercentage ?? 0}%
                        </div>
                    </div>

                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${pathway?.completionPercentage ?? 0}%`,
                            }}
                        />
                    </div>

                    <p className="progress-text">
                        {pathway?.completedSteps ?? 0} of{" "}
                        {pathway?.totalSteps ?? 0} steps completed
                    </p>

                    <div className="journey-steps">
                        {pathway?.steps?.map((step) => {
                            const completed =
                                step.status === "Completed" ||
                                step.status === "Passed";

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
                                        {completed ? "✓" : "○"}
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
                        })}
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="dashboard-grid">

                    {/* Profile */}
                    <div className="dashboard-card">
                        <p className="card-eyebrow">
                            PROFILE
                        </p>

                        <h2>
                            Your Nurse Profile
                        </h2>

                        <p className="card-description">
                            Keep your nursing background and
                            journey information up to date.
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
                            onClick={() => navigate("/profile")}
                        >
                            View Profile →
                        </button>
                    </div>

                    {/* Next Step */}
                    <div className="dashboard-card">
                        <p className="card-eyebrow">
                            NEXT STEP
                        </p>

                        <h2>
                            Provincial Registration
                        </h2>

                        <p className="card-description">
                            Your current pathway shows
                            provincial registration as your
                            next step.
                        </p>

                        <div className="next-step-badge">
                            Not Started
                        </div>
                    </div>

                    {/* Mentorship */}
                    <div className="dashboard-card mentorship-card">
                        <p className="card-eyebrow">
                            MENTORSHIP
                        </p>

                        <h2>
                            Need personalized guidance?
                        </h2>

                        <p className="card-description">
                            Book a mentorship session to discuss
                            your Canada RN journey.
                        </p>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                                navigate("/book-session")
                            }
                        >
                            Book a Session
                        </button>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;