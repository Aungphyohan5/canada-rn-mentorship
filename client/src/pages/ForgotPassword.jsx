import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Login.css";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!email.trim()) {
            setError(
                "Please enter your email address."
            );

            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/forgot-password",
                {
                    email: email.trim(),
                }
            );

            setMessage(
                response.data.message ||
                "If an account exists with that email address, you will receive a password reset link shortly."
            );

        } catch (error) {
            console.error(
                "FORGOT PASSWORD ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to process your request. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-container">

                {/* BRAND */}

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


                {/* CARD */}

                <div className="login-card">

                    <div className="login-header">

                        <p className="login-eyebrow">
                            ACCOUNT RECOVERY
                        </p>

                        <h1>
                            Forgot Password?
                        </h1>

                        <p>
                            Enter your email address and
                            we'll send you a secure link
                            to reset your password.
                        </p>

                    </div>


                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

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


                        {error && (
                            <div
                                className="login-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}


                        {message && (
                            <div
                                className="login-success"
                                role="status"
                            >
                                {message}
                            </div>
                        )}


                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Sending..."
                                : "Send Reset Link"}
                        </button>

                    </form>


                    <div className="login-divider">
                        <span>OR</span>
                    </div>


                    <p className="login-register">

                        Remember your password?{" "}

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Back to Log In
                        </button>

                    </p>

                </div>


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


                <div className="login-footer">
                    © 2026 Canada RN Mentorship
                </div>

            </div>

        </div>
    );
};

export default ForgotPassword;