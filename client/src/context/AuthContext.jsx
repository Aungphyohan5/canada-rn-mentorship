import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token");
    });

    const [loading, setLoading] = useState(true);

    // =========================================================
    // RESTORE USER SESSION
    // =========================================================

    useEffect(() => {
        const restoreUser = async () => {
            const storedToken = localStorage.getItem("token");

            // -------------------------------------------------
            // No token
            // -------------------------------------------------

            if (!storedToken) {
                setUser(null);
                setToken(null);
                setLoading(false);
                return;
            }

            // -------------------------------------------------
            // Token exists
            // -------------------------------------------------

            try {
                console.log("AUTH: Restoring user...");

                const response = await api.get("/auth/me");

                const authenticatedUser =
                    response.data?.data?.user;

                if (!authenticatedUser) {
                    throw new Error(
                        "Authenticated user was not returned."
                    );
                }

                console.log(
                    "AUTH: User restored:",
                    authenticatedUser
                );

                setUser(authenticatedUser);
                setToken(storedToken);

            } catch (error) {
                console.error(
                    "AUTH: Failed to restore user:",
                    error.response?.data ||
                    error.message ||
                    error
                );

                const status = error.response?.status;

                // -------------------------------------------------
                // Invalid / expired token
                // -------------------------------------------------

                if (status === 401 || status === 403) {
                    console.warn(
                        "AUTH: Token is invalid or expired."
                    );

                    localStorage.removeItem("token");

                    setToken(null);
                    setUser(null);
                } else {
                    // -------------------------------------------------
                    // Temporary backend/network problem
                    // Keep token
                    // -------------------------------------------------

                    console.warn(
                        "AUTH: Temporary verification error. Keeping token."
                    );

                    setToken(storedToken);
                }

            } finally {
                setLoading(false);
            }
        };

        restoreUser();
    }, []);

    // =========================================================
    // LOGIN
    // =========================================================

    const login = (userData, userToken) => {
        console.log("AUTH: Login successful.");

        localStorage.setItem("token", userToken);

        setToken(userToken);
        setUser(userData);
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {
        console.log("AUTH: Logging out.");

        localStorage.removeItem("token");

        setToken(null);
        setUser(null);
    };

    // =========================================================
    // AUTH CONTEXT
    // =========================================================

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "admin",
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// =============================================================
// USE AUTH
// =============================================================

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
};

export default AuthContext;