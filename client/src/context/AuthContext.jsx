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

    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const [loading, setLoading] = useState(true);


    // =========================================================
    // RESTORE AUTHENTICATED USER
    // =========================================================

    useEffect(() => {

        const loadUser = async () => {

            const storedToken =
                localStorage.getItem("token");


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

                console.log(
                    "AUTH: Restoring user..."
                );


                const response =
                    await api.get(
                        "/auth/me"
                    );


                const authenticatedUser =
                    response.data
                        ?.data
                        ?.user;


                if (!authenticatedUser) {

                    throw new Error(
                        "Authenticated user was not returned."
                    );

                }


                console.log(
                    "AUTH: User restored:",
                    authenticatedUser
                );


                setUser(
                    authenticatedUser
                );

                setToken(
                    storedToken
                );


            } catch (error) {

                console.error(
                    "AUTH USER LOAD ERROR:",
                    error.response?.data ||
                    error.message ||
                    error
                );


                /*
                 * IMPORTANT:
                 *
                 * Do not immediately delete the token
                 * for every possible error.
                 *
                 * Only clear authentication when the
                 * backend explicitly says the token is
                 * unauthorized.
                 */

                const status =
                    error.response?.status;


                if (
                    status === 401 ||
                    status === 403
                ) {

                    console.warn(
                        "AUTH: Token is no longer valid."
                    );


                    localStorage.removeItem(
                        "token"
                    );

                    setToken(null);

                    setUser(null);

                } else {

                    /*
                     * Temporary network/server error.
                     *
                     * Keep the token so the user is not
                     * unexpectedly logged out.
                     */

                    console.warn(
                        "AUTH: Could not verify token, keeping existing token."
                    );

                    setToken(
                        storedToken
                    );

                }

            } finally {

                setLoading(false);

            }

        };


        loadUser();

    }, []);


    // =========================================================
    // LOGIN
    // =========================================================

    const login = (
        userData,
        userToken
    ) => {

        console.log(
            "AUTH: Logging in user."
        );


        localStorage.setItem(
            "token",
            userToken
        );


        setToken(
            userToken
        );


        setUser(
            userData
        );

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        console.log(
            "AUTH: Logging out."
        );


        localStorage.removeItem(
            "token"
        );


        setToken(null);

        setUser(null);

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


// =============================================================
// USE AUTH
// =============================================================

export const useAuth = () =>
    useContext(AuthContext);