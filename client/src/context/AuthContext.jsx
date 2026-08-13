import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem("token");

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me");

                setUser(response.data.data.user);
            } catch (error) {
                console.error("AUTH USER LOAD ERROR:", error);

                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);

        localStorage.setItem("token", userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);