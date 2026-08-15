import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editing, setEditing] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

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

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((currentProfile) => ({
            ...currentProfile,
            [name]:
                name === "yearsOfExperience"
                    ? Number(value)
                    : name === "englishScore"
                        ? value === ""
                            ? null
                            : Number(value)
                        : value,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await api.put(
                "/nurse-profile/me",
                {
                    phone: profile.phone,
                    countryOfEducation:
                        profile.countryOfEducation,
                    nursingDegree: profile.nursingDegree,
                    yearsOfExperience:
                        profile.yearsOfExperience,
                    specialty: profile.specialty,
                    englishTest: profile.englishTest,
                    englishScore: profile.englishScore,
                    nclexStatus: profile.nclexStatus,
                    nnasStatus: profile.nnasStatus,
                    preferredProvince:
                        profile.preferredProvince,
                    immigrationStatus:
                        profile.immigrationStatus,
                }
            );

            setProfile(response.data.data.profile);

            setEditing(false);
            setSuccess("Profile updated successfully.");
        } catch (error) {
            console.error("PROFILE SAVE ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Unable to save profile"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (!profile) {
        return <p>No profile found.</p>;
    }

    return (
        <div>
            <div>
                <h1>My Nurse Profile</h1>

                {!editing && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditing(true);
                            setSuccess("");
                            setError("");
                        }}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {success && <p>{success}</p>}
            {error && <p>{error}</p>}

            {editing ? (
                <form onSubmit={handleSave}>

                    <section>
                        <h2>Personal Information</h2>

                        <p>
                            <strong>Name:</strong>{" "}
                            {user?.firstName}{" "}
                            {user?.lastName}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {user?.email}
                        </p>

                        <label>
                            Phone
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone || ""}
                                onChange={handleChange}
                            />
                        </label>
                    </section>

                    <hr />

                    <section>
                        <h2>Nursing Background</h2>

                        <label>
                            Country of Education
                            <input
                                type="text"
                                name="countryOfEducation"
                                value={
                                    profile.countryOfEducation ||
                                    ""
                                }
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Nursing Degree
                            <input
                                type="text"
                                name="nursingDegree"
                                value={
                                    profile.nursingDegree || ""
                                }
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Years of Experience
                            <input
                                type="number"
                                min="0"
                                name="yearsOfExperience"
                                value={
                                    profile.yearsOfExperience ?? 0
                                }
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Specialty
                            <input
                                type="text"
                                name="specialty"
                                value={
                                    profile.specialty || ""
                                }
                                onChange={handleChange}
                            />
                        </label>
                    </section>

                    <hr />

                    <section>
                        <h2>English Proficiency</h2>

                        <label>
                            English Test
                            <select
                                name="englishTest"
                                value={
                                    profile.englishTest || "None"
                                }
                                onChange={handleChange}
                            >
                                <option value="None">
                                    None
                                </option>

                                <option value="IELTS">
                                    IELTS
                                </option>

                                <option value="CELBAN">
                                    CELBAN
                                </option>

                                <option value="PTE">
                                    PTE
                                </option>

                                <option value="OET">
                                    OET
                                </option>
                            </select>
                        </label>

                        <label>
                            English Score
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                name="englishScore"
                                value={
                                    profile.englishScore ?? ""
                                }
                                onChange={handleChange}
                            />
                        </label>
                    </section>

                    <hr />

                    <section>
                        <h2>Canadian RN Journey</h2>

                        <label>
                            NNAS Status
                            <select
                                name="nnasStatus"
                                value={
                                    profile.nnasStatus ||
                                    "Not Started"
                                }
                                onChange={handleChange}
                            >
                                <option value="Not Started">
                                    Not Started
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Submitted">
                                    Submitted
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>
                            </select>
                        </label>

                        <label>
                            NCLEX Status
                            <select
                                name="nclexStatus"
                                value={
                                    profile.nclexStatus ||
                                    "Not Started"
                                }
                                onChange={handleChange}
                            >
                                <option value="Not Started">
                                    Not Started
                                </option>

                                <option value="Planning">
                                    Planning
                                </option>

                                <option value="Registered">
                                    Registered
                                </option>

                                <option value="Scheduled">
                                    Scheduled
                                </option>

                                <option value="Passed">
                                    Passed
                                </option>

                                <option value="Failed">
                                    Failed
                                </option>
                            </select>
                        </label>

                        <label>
                            Preferred Province
                            <input
                                type="text"
                                name="preferredProvince"
                                value={
                                    profile.preferredProvince ||
                                    ""
                                }
                                onChange={handleChange}
                            />
                        </label>
                    </section>

                    <hr />

                    <section>
                        <h2>Immigration</h2>

                        <label>
                            Immigration Status
                            <input
                                type="text"
                                name="immigrationStatus"
                                value={
                                    profile.immigrationStatus ||
                                    ""
                                }
                                onChange={handleChange}
                            />
                        </label>
                    </section>

                    <hr />

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                            setEditing(false);
                            setError("");
                            setSuccess("");
                            fetchProfile();
                        }}
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <>
                    <section>
                        <h2>Personal Information</h2>

                        <p>
                            <strong>Name:</strong>{" "}
                            {user?.firstName}{" "}
                            {user?.lastName}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {user?.email}
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
                            <strong>
                                Country of Education:
                            </strong>{" "}
                            {profile.countryOfEducation ||
                                "Not provided"}
                        </p>

                        <p>
                            <strong>
                                Nursing Degree:
                            </strong>{" "}
                            {profile.nursingDegree ||
                                "Not provided"}
                        </p>

                        <p>
                            <strong>
                                Years of Experience:
                            </strong>{" "}
                            {profile.yearsOfExperience}
                        </p>

                        <p>
                            <strong>Specialty:</strong>{" "}
                            {profile.specialty ||
                                "Not provided"}
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2>English Proficiency</h2>

                        <p>
                            <strong>
                                English Test:
                            </strong>{" "}
                            {profile.englishTest}
                        </p>

                        <p>
                            <strong>
                                English Score:
                            </strong>{" "}
                            {profile.englishScore ??
                                "Not provided"}
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2>Canadian RN Journey</h2>

                        <p>
                            <strong>
                                NNAS Status:
                            </strong>{" "}
                            {profile.nnasStatus}
                        </p>

                        <p>
                            <strong>
                                NCLEX Status:
                            </strong>{" "}
                            {profile.nclexStatus}
                        </p>

                        <p>
                            <strong>
                                Preferred Province:
                            </strong>{" "}
                            {profile.preferredProvince ||
                                "Not provided"}
                        </p>
                    </section>

                    <hr />

                    <section>
                        <h2>Immigration</h2>

                        <p>
                            <strong>
                                Immigration Status:
                            </strong>{" "}
                            {profile.immigrationStatus ||
                                "Not provided"}
                        </p>
                    </section>
                </>
            )}
        </div>
    );
};

export default Profile;