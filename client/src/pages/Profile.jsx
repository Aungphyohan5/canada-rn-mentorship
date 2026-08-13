import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
    const { user } = useAuth();

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

    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!profile) {
        return <p>No profile found.</p>;
    }

    return (
        <div>
            <h1>My Nurse Profile</h1>

            <section>
                <h2>Personal Information</h2>

                <p>
                    <strong>Name:</strong>{" "}
                    {user?.firstName} {user?.lastName}
                </p>

                <p>
                    <strong>Email:</strong> {user?.email}
                </p>

                <p>
                    <strong>Phone:</strong>{" "}
                    {profile.phone || "Not provided"}
                </p>
            </section>

            <hr />

            <section>
                <h2>Nursing Background</h2>

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
            </section>

            <hr />

            <section>
                <h2>English Proficiency</h2>

                <p>
                    <strong>English Test:</strong>{" "}
                    {profile.englishTest}
                </p>

                <p>
                    <strong>English Score:</strong>{" "}
                    {profile.englishScore ?? "Not provided"}
                </p>
            </section>

            <hr />

            <section>
                <h2>Canadian RN Journey</h2>

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
            </section>

            <hr />

            <section>
                <h2>Immigration</h2>

                <p>
                    <strong>Immigration Status:</strong>{" "}
                    {profile.immigrationStatus || "Not provided"}
                </p>
            </section>
        </div>
    );
};

export default Profile;