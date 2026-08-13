import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
    const { user, logout } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/nurse-profile/me");

                setProfile(response.data.data.profile);
            } catch (error) {
                console.error("PROFILE FETCH ERROR:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load nurse profile"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div>
            <h1>Welcome to Canada RN Mentorship</h1>

            {user && (
                <>
                    <h2>
                        Hello {user.firstName} {user.lastName}
                    </h2>

                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                </>
            )}

            <hr />

            <h2>My Nurse Profile</h2>

            {loading && <p>Loading profile...</p>}

            {error && <p>{error}</p>}

            {!loading && !error && profile && (
                <div>
                    <p>
                        <strong>Country of Education:</strong>{" "}
                        {profile.countryOfEducation || "Not provided"}
                    </p>

                    <p>
                        <strong>Nursing Degree:</strong>{" "}
                        {profile.nursingDegree || "Not provided"}
                    </p>

                    <p>
                        <strong>Years of Experience:</strong>{" "}
                        {profile.yearsOfExperience}
                    </p>

                    <p>
                        <strong>Specialty:</strong>{" "}
                        {profile.specialty || "Not provided"}
                    </p>

                    <p>
                        <strong>English Test:</strong>{" "}
                        {profile.englishTest}
                    </p>

                    <p>
                        <strong>English Score:</strong>{" "}
                        {profile.englishScore ?? "Not provided"}
                    </p>

                    <p>
                        <strong>NNAS Status:</strong>{" "}
                        {profile.nnasStatus}
                    </p>

                    <p>
                        <strong>NCLEX Status:</strong>{" "}
                        {profile.nclexStatus}
                    </p>

                    <p>
                        <strong>Preferred Province:</strong>{" "}
                        {profile.preferredProvince || "Not provided"}
                    </p>

                    <p>
                        <strong>Immigration Status:</strong>{" "}
                        {profile.immigrationStatus || "Not provided"}
                    </p>

                    <p>
                        <strong>Profile Completed:</strong>{" "}
                        {profile.profileCompleted ? "Yes" : "No"}
                    </p>
                </div>
            )}

            <hr />

            <button onClick={logout}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;