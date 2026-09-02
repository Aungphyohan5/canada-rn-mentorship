import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =========================================================
    // REDIRECT USER BASED ON ROLE
    // =========================================================

    const redirectByRole = (user) => {
        if (!user?.role) {
            navigate("/dashboard", {
                replace: true,
            });

            return;
        }

        switch (user.role) {
            case "admin":
                navigate("/admin", {
                    replace: true,
                });
                break;

            case "employer":
                navigate("/dashboard", {
                    replace: true,
                });
                break;

            case "nurse":
            default:
                navigate("/dashboard", {
                    replace: true,
                });
                break;
        }
    };

    // =========================================================
    // LOGIN
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError(
                "Please enter your email and password."
            );

            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/login",
                {
                    email: email.trim(),
                    password,
                }
            );

            /*
             * Your backend currently returns:
             *
             * response.data.data.user
             * response.data.data.token
             */

            const { user, token } =
                response.data.data;

            if (!user || !token) {
                throw new Error(
                    "Invalid login response from server."
                );
            }

            // Save authentication state
            login(user, token);

            // Redirect according to account role
            redirectByRole(user);

        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="login-page">

            <div className="login-container">

                {/* =================================================
                    BRAND
                ================================================= */}

                <div className="login-brand">

                    <div className="login-brand-logo">

                        <div className="login-logo-mark">
                            🍁
                        </div>

                        <div className="login-brand-text">

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
                    LOGIN CARD
                ================================================= */}

                <div className="login-card">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="login-header">

                        <p className="login-eyebrow">
                            WELCOME BACK
                        </p>

                        <h1>
                            Log In
                        </h1>

                        <p>
                            Continue your Canadian nursing
                            journey with us.
                        </p>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        {/* =================================================
                            EMAIL
                        ================================================= */}

                        <div className="login-form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="login-input-wrapper">

                                <input
                                    id="email"
                                    className="login-input"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================================
                            PASSWORD
                        ================================================= */}

                        <div className="login-form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="login-input-wrapper">

                                <input
                                    id="password"
                                    className="login-input login-password-input"
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
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    disabled={loading}
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (

                            <div
                                className="login-error"
                                role="alert"
                            >
                                {error}
                            </div>

                        )}


                        {/* =================================================
                            OPTIONS
                        ================================================= */}

                        <div className="login-form-options">

                            <label className="login-remember">

                                <input
                                    type="checkbox"
                                    disabled={loading}
                                />

                                <span>
                                    Remember me
                                </span>

                            </label>


                            <button
                                type="button"
                                className="login-forgot"
                                disabled={loading}
                                onClick={() =>
                                    alert(
                                        "Password reset will be available soon."
                                    )
                                }
                            >
                                Forgot password?
                            </button>

                        </div>


                        {/* =================================================
                            LOGIN BUTTON
                        ================================================= */}

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Log In"}
                        </button>

                    </form>


                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div className="login-divider">
                        <span>OR</span>
                    </div>


                    {/* =================================================
                        REGISTER
                    ================================================= */}

                    <p className="login-register">

                        Don't have an account?{" "}

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create an account
                        </button>

                    </p>

                </div>


                {/* =================================================
                    BACK HOME
                ================================================= */}

                <button
                    type="button"
                    className="login-back-home"
                    disabled={loading}
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Back to Home
                </button>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="login-footer">

                    © 2026 Canada RN Mentorship

                </div>

            </div>

        </div>
    );
};

export default Login;