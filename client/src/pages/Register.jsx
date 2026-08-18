import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./Register.css";

const Register = () => {

    const navigate = useNavigate();

    const { login } = useAuth();


    // =========================================================
    // STATE
    // =========================================================

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        // -------------------------------------------------------
        // Validate password
        // -------------------------------------------------------

        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        if (password.length < 8) {

            setError(
                "Password must be at least 8 characters."
            );

            return;
        }


        setLoading(true);


        try {

            const response = await api.post(
                "/auth/register",
                {
                    firstName,
                    lastName,
                    email,
                    password,
                }
            );


            const user =
                response.data?.data?.user;

            const token =
                response.data?.data?.token;


            // ---------------------------------------------------
            // If backend returns token immediately
            // ---------------------------------------------------

            if (user && token) {

                login(
                    user,
                    token
                );

                navigate(
                    "/dashboard"
                );

                return;
            }


            // ---------------------------------------------------
            // If registration requires login afterwards
            // ---------------------------------------------------

            navigate(
                "/login",
                {
                    state: {
                        registered: true,
                        email,
                    },
                }
            );


        } catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                "Registration failed. Please try again."
            );


        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="register-page">

            <div className="register-container">


                {/* =================================================
                    BRAND
                ================================================= */}

                <div className="register-brand">

                    <div className="register-brand-logo">

                        <div className="register-logo-mark">
                            🍁
                        </div>

                        <div className="register-brand-text">

                            <strong>
                                Canada RN
                            </strong>

                            <span>
                                Mentorship
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    REGISTER CARD
                ================================================= */}

                <div className="register-card">


                    {/* HEADER */}

                    <div className="register-header">

                        <p className="register-eyebrow">
                            START YOUR JOURNEY
                        </p>

                        <h1>
                            Create Your Account
                        </h1>

                        <p>
                            Create your account to begin
                            your Canadian nursing journey.
                        </p>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            NAME
                        ================================================= */}

                        <div className="register-name-row">


                            <div className="register-form-group">

                                <label htmlFor="firstName">
                                    First Name
                                </label>

                                <input
                                    id="firstName"
                                    className="register-input"
                                    type="text"
                                    value={firstName}
                                    onChange={(event) =>
                                        setFirstName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="First name"
                                    autoComplete="given-name"
                                    required
                                />

                            </div>


                            <div className="register-form-group">

                                <label htmlFor="lastName">
                                    Last Name
                                </label>

                                <input
                                    id="lastName"
                                    className="register-input"
                                    type="text"
                                    value={lastName}
                                    onChange={(event) =>
                                        setLastName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Last name"
                                    autoComplete="family-name"
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================================
                            EMAIL
                        ================================================= */}

                        <div className="register-form-group">

                            <label htmlFor="registerEmail">
                                Email Address
                            </label>

                            <input
                                id="registerEmail"
                                className="register-input"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                            />

                        </div>


                        {/* =================================================
                            PASSWORD
                        ================================================= */}

                        <div className="register-form-group">

                            <label htmlFor="registerPassword">
                                Password
                            </label>

                            <div className="register-password-wrapper">

                                <input
                                    id="registerPassword"
                                    className="register-input register-password-input"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                            <small className="register-help-text">
                                Use at least 8 characters.
                            </small>

                        </div>


                        {/* =================================================
                            CONFIRM PASSWORD
                        ================================================= */}

                        <div className="register-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="register-password-wrapper">

                                <input
                                    id="confirmPassword"
                                    className="register-input register-password-input"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (

                            <div className="register-error">
                                {error}
                            </div>

                        )}


                        {/* =================================================
                            TERMS
                        ================================================= */}

                        <label className="register-terms">

                            <input
                                type="checkbox"
                                required
                            />

                            <span>
                                I agree to the Terms of Service,
                                Privacy Policy and Disclaimer.
                            </span>

                        </label>


                        {/* =================================================
                            SUBMIT
                        ================================================= */}

                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating Account..."
                                : "Create Account"}

                        </button>

                    </form>


                    {/* =================================================
                        LOGIN
                    ================================================= */}

                    <div className="register-divider">
                        <span>ALREADY HAVE AN ACCOUNT?</span>
                    </div>


                    <p className="register-login">

                        Already registered?{" "}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Log In
                        </button>

                    </p>

                </div>


                {/* =================================================
                    BACK HOME
                ================================================= */}

                <button
                    type="button"
                    className="register-back-home"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Back to Home
                </button>


                {/* FOOTER */}

                <div className="register-footer">

                    © 2026 Canada RN Mentorship

                </div>

            </div>

        </div>

    );
};

export default Register;