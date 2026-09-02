import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

import "./AdminNurseProfile.css";


const AdminNurseProfile = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const loadProfile = async () => {

            try {

                const response =
                    await api.get(
                        `/admin/nurses/${id}`
                    );

                setUser(
                    response.data?.data?.user
                );

                setProfile(
                    response.data?.data?.profile
                );

            } catch (error) {

                console.error(
                    "ADMIN PROFILE ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load nurse profile."
                );

            } finally {

                setLoading(false);

            }
        };


        loadProfile();

    }, [id]);


    if (loading) {
        return (
            <div className="admin-profile-page">
                Loading profile...
            </div>
        );
    }


    if (error) {
        return (
            <div className="admin-profile-page">
                <div className="admin-error">
                    {error}
                </div>
            </div>
        );
    }


    return (
        <div className="admin-profile-page">

            <button
                className="admin-back-button"
                onClick={() =>
                    navigate("/admin")
                }
            >
                ← Back to Customers
            </button>


            <div className="admin-profile-header">

                <div>

                    <p className="admin-eyebrow">
                        NURSE CUSTOMER
                    </p>

                    <h1>
                        {user?.firstName}{" "}
                        {user?.lastName}
                    </h1>

                    <p>
                        {user?.email}
                    </p>

                </div>


                <span
                    className={
                        profile?.profileCompleted
                            ? "status-complete"
                            : "status-incomplete"
                    }
                >
                    {profile?.profileCompleted
                        ? "Profile Complete"
                        : "Profile Incomplete"}
                </span>

            </div>


            {/* =====================================================
                PERSONAL
            ===================================================== */}

            <section className="admin-profile-card">

                <h2>
                    Personal Information
                </h2>

                <div className="admin-info-grid">

                    <Info
                        label="Email"
                        value={user?.email}
                    />

                    <Info
                        label="Country of Residence"
                        value={profile?.countryOfResidence}
                    />

                    <Info
                        label="Immigration Status"
                        value={profile?.immigrationStatus}
                    />

                </div>

            </section>


            {/* =====================================================
                EDUCATION
            ===================================================== */}

            <section className="admin-profile-card">

                <h2>
                    Nursing Education
                </h2>

                <div className="admin-info-grid">

                    <Info
                        label="Nursing Education"
                        value={profile?.nursingDegree}
                    />

                    <Info
                        label="Institution"
                        value={profile?.educationInstitution}
                    />

                    <Info
                        label="Country of Education"
                        value={profile?.countryOfEducation}
                    />

                </div>

            </section>


            {/* =====================================================
                REGISTRATION
            ===================================================== */}

            <section className="admin-profile-card">

                <h2>
                    Registration & Licensing
                </h2>

                <div className="admin-info-grid">

                    <Info
                        label="License Status"
                        value={profile?.licenseStatus}
                    />

                    <Info
                        label="Registration Country"
                        value={profile?.registrationCountry}
                    />

                    <Info
                        label="Province / State"
                        value={profile?.registrationProvince}
                    />

                    <Info
                        label="Regulatory Body"
                        value={profile?.regulatoryBody}
                    />

                    <Info
                        label="NCLEX Status"
                        value={profile?.nclexStatus}
                    />

                    <Info
                        label="NCLEX Jurisdiction"
                        value={profile?.nclexJurisdiction}
                    />

                    <Info
                        label="NNAS Status"
                        value={profile?.nnasStatus}
                    />

                </div>

            </section>


            {/* =====================================================
                EXPERIENCE
            ===================================================== */}

            <section className="admin-profile-card">

                <h2>
                    Nursing Experience
                </h2>

                <div className="admin-info-grid">

                    <Info
                        label="Years of Experience"
                        value={
                            profile?.yearsOfExperience
                        }
                    />

                    <Info
                        label="Specialty"
                        value={profile?.specialty}
                    />

                    <Info
                        label="Currently Working"
                        value={
                            profile?.currentlyWorking
                        }
                    />

                    <Info
                        label="Current Work Country"
                        value={
                            profile?.currentWorkCountry
                        }
                    />

                </div>

            </section>


            {/* =====================================================
                CANADA JOURNEY
            ===================================================== */}

            <section className="admin-profile-card">

                <h2>
                    Canadian RN Journey
                </h2>

                <div className="admin-info-grid">

                    <Info
                        label="Preferred Province"
                        value={
                            profile?.preferredProvince
                        }
                    />

                    <Info
                        label="Registration Started"
                        value={
                            profile?.registrationStarted
                        }
                    />

                </div>


                <div className="progress-section">

                    <h3>
                        Registration Progress
                    </h3>

                    {profile?.registrationProgress?.length > 0 ? (

                        <ul>

                            {profile.registrationProgress.map(
                                (item) => (
                                    <li key={item}>
                                        ✓ {item}
                                    </li>
                                )
                            )}

                        </ul>

                    ) : (

                        <p>
                            No registration steps
                            recorded yet.
                        </p>

                    )}

                </div>

            </section>


            {/* =====================================================
                GOALS
            ===================================================== */}

            <section className="admin-profile-card">

                <h2>
                    Goals & Concerns
                </h2>

                <div className="admin-long-text">

                    <h3>
                        Main Goal
                    </h3>

                    <p>
                        {profile?.mainGoal ||
                            "Not provided"}
                    </p>

                </div>


                <div className="admin-long-text">

                    <h3>
                        Biggest Concern
                    </h3>

                    <p>
                        {profile?.biggestConcern ||
                            "Not provided"}
                    </p>

                </div>

            </section>

        </div>
    );
};


// ============================================================
// INFO COMPONENT
// ============================================================

const Info = ({ label, value }) => {

    return (
        <div className="admin-info-item">

            <span>
                {label}
            </span>

            <strong>
                {value || "—"}
            </strong>

        </div>
    );
};


export default AdminNurseProfile;