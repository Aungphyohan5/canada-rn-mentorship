import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

import "./Profile.css";

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/nurse-profile/me"
                );

                setProfile(
                    response.data?.data?.profile
                );

            } catch (error) {
                console.error(
                    "GET PROFILE ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load your profile."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const formatValue = (value) => {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return "Not provided";
        }

        return value;
    };

    const getStatusClass = (status) => {
        if (
            status === "Passed" ||
            status === "Completed" ||
            status ===
            "Currently licensed / registered"
        ) {
            return "status-success";
        }

        if (
            status === "In Progress" ||
            status === "Planning" ||
            status === "Scheduled"
        ) {
            return "status-warning";
        }

        return "status-neutral";
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    Loading your profile...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-error">
                    {error}
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="profile-empty">
                    <h2>
                        Your profile isn't ready yet
                    </h2>

                    <p>
                        Complete your nurse profile
                        to continue.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/onboarding")
                        }
                    >
                        Complete Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">

            {/* HEADER */}

            <header className="profile-header">

                <div className="profile-brand">

                    <div className="profile-logo">
                        🍁
                    </div>

                    <div>
                        <strong>
                            Canada RN
                        </strong>

                        <span>
                            Mentorship
                        </span>
                    </div>

                </div>

                <button
                    className="profile-dashboard-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    Dashboard
                </button>

            </header>


            <main className="profile-container">

                {/* PROFILE HERO */}

                <section className="profile-hero">

                    <div className="profile-avatar">
                        {user?.firstName
                            ?.charAt(0)
                            ?.toUpperCase() || "N"}
                    </div>

                    <div className="profile-identity">

                        <p className="profile-eyebrow">
                            NURSE PROFILE
                        </p>

                        <h1>
                            {user?.firstName || ""}
                            {" "}
                            {user?.lastName || ""}
                        </h1>

                        <p>
                            {user?.email ||
                                "Email not available"}
                        </p>

                    </div>

                    <button
                        className="profile-edit-button"
                        onClick={() =>
                            navigate("/onboarding")
                        }
                    >
                        Edit Profile
                    </button>

                </section>


                {/* COMPLETION */}

                <section className="profile-completion">

                    <div>

                        <strong>
                            Profile Completion
                        </strong>

                        <p>
                            Keep your information
                            up to date.
                        </p>

                    </div>

                    <strong>
                        {profile.profileCompleted
                            ? "100%"
                            : "Incomplete"}
                    </strong>

                </section>


                {/* PERSONAL */}

                <section className="profile-section">

                    <div className="section-heading">
                        <span>🌎</span>

                        <div>
                            <p>ABOUT YOU</p>
                            <h2>
                                Personal Information
                            </h2>
                        </div>
                    </div>

                    <div className="profile-grid">

                        <ProfileItem
                            label="Country of Residence"
                            value={
                                profile.countryOfResidence
                            }
                        />

                        <ProfileItem
                            label="Immigration Status"
                            value={
                                profile.immigrationStatus
                            }
                        />

                    </div>

                </section>


                {/* EDUCATION */}

                <section className="profile-section">

                    <div className="section-heading">
                        <span>🎓</span>

                        <div>
                            <p>EDUCATION</p>
                            <h2>
                                Nursing Education
                            </h2>
                        </div>
                    </div>

                    <div className="profile-grid">

                        <ProfileItem
                            label="Nursing Degree"
                            value={
                                profile.nursingDegree
                            }
                        />

                        <ProfileItem
                            label="Institution"
                            value={
                                profile.educationInstitution
                            }
                        />

                        <ProfileItem
                            label="Country of Education"
                            value={
                                profile.countryOfEducation
                            }
                        />

                    </div>

                </section>


                {/* LICENSING */}

                <section className="profile-section">

                    <div className="section-heading">
                        <span>🩺</span>

                        <div>
                            <p>REGISTRATION</p>
                            <h2>
                                Nursing License
                            </h2>
                        </div>
                    </div>

                    <div className="profile-grid">

                        <ProfileItem
                            label="License Status"
                            value={
                                <span
                                    className={`status-badge ${getStatusClass(
                                        profile.licenseStatus
                                    )}`}
                                >
                                    {formatValue(
                                        profile.licenseStatus
                                    )}
                                </span>
                            }
                        />

                        <ProfileItem
                            label="Registration Country"
                            value={
                                profile.registrationCountry
                            }
                        />

                        <ProfileItem
                            label="Province / State"
                            value={
                                profile.registrationProvince
                            }
                        />

                        <ProfileItem
                            label="Regulatory Body"
                            value={
                                profile.regulatoryBody
                            }
                        />

                    </div>

                </section>


                {/* EXPERIENCE */}

                <section className="profile-section">

                    <div className="section-heading">
                        <span>💼</span>

                        <div>
                            <p>EXPERIENCE</p>
                            <h2>
                                Nursing Experience
                            </h2>
                        </div>
                    </div>

                    <div className="profile-grid">

                        <ProfileItem
                            label="Years of Experience"
                            value={
                                profile.yearsOfExperience
                                    ? `${profile.yearsOfExperience} years`
                                    : "Not provided"
                            }
                        />

                        <ProfileItem
                            label="Specialty"
                            value={
                                profile.specialty
                            }
                        />

                        <ProfileItem
                            label="Currently Working"
                            value={
                                profile.currentlyWorking
                            }
                        />

                        <ProfileItem
                            label="Current Work Country"
                            value={
                                profile.currentWorkCountry
                            }
                        />

                    </div>

                </section>


                {/* NCLEX / NNAS */}

                <section className="profile-section">

                    <div className="section-heading">
                        <span>📋</span>

                        <div>
                            <p>LICENSING JOURNEY</p>
                            <h2>
                                NCLEX & NNAS
                            </h2>
                        </div>
                    </div>

                    <div className="profile-grid">

                        <ProfileItem
                            label="NCLEX-RN"
                            value={
                                <span
                                    className={`status-badge ${getStatusClass(
                                        profile.nclexStatus
                                    )}`}
                                >
                                    {formatValue(
                                        profile.nclexStatus
                                    )}
                                </span>
                            }
                        />

                        <ProfileItem
                            label="NCLEX Jurisdiction"
                            value={
                                profile.nclexJurisdiction
                            }
                        />

                        <ProfileItem
                            label="NNAS"
                            value={
                                <span
                                    className={`status-badge ${getStatusClass(
                                        profile.nnasStatus
                                    )}`}
                                >
                                    {formatValue(
                                        profile.nnasStatus
                                    )}
                                </span>
                            }
                        />

                    </div>

                </section>


                {/* CANADIAN JOURNEY */}

                <section className="profile-section">

                    <div className="section-heading">
                        <span>🇨🇦</span>

                        <div>
                            <p>CANADA</p>
                            <h2>
                                Canadian RN Journey
                            </h2>
                        </div>
                    </div>

                    <div className="profile-grid">

                        <ProfileItem
                            label="Preferred Province"
                            value={
                                profile.preferredProvince
                            }
                        />

                        <ProfileItem
                            label="Registration Started"
                            value={
                                profile.registrationStarted
                            }
                        />

                    </div>

                    {profile.registrationProgress
                        ?.length > 0 && (

                            <div className="progress-items">

                                <h3>
                                    Completed Steps
                                </h3>

                                <div className="tag-list">

                                    {profile.registrationProgress.map(
                                        (item) => (
                                            <span
                                                key={item}
                                            >
                                                ✓ {item}
                                            </span>
                                        )
                                    )}

                                </div>

                            </div>

                        )}

                </section>


                {/* GOALS */}

                <section className="profile-section">

                    <div className="section-heading">
                        <span>🎯</span>

                        <div>
                            <p>YOUR DIRECTION</p>
                            <h2>
                                Goals & Concerns
                            </h2>
                        </div>
                    </div>

                    <div className="goal-card">

                        <h3>
                            My Main Goal
                        </h3>

                        <p>
                            {formatValue(
                                profile.mainGoal
                            )}
                        </p>

                    </div>

                    <div className="goal-card">

                        <h3>
                            My Biggest Concern
                        </h3>

                        <p>
                            {formatValue(
                                profile.biggestConcern
                            )}
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
};


// =============================================================
// PROFILE ITEM
// =============================================================

const ProfileItem = ({
    label,
    value,
}) => {

    return (
        <div className="profile-item">

            <span>
                {label}
            </span>

            <strong>
                {value || "Not provided"}
            </strong>

        </div>
    );
};


export default Profile;