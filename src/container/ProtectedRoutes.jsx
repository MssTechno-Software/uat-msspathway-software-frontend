import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    clearAuthSession,
    getAccessToken,
} from "../services/authSession";

// Read the JWT expiry timestamp.
function getTokenExpiryTime(token) {
    try {
        const tokenParts = token.split(".");

        if (tokenParts.length !== 3 || !tokenParts[1]) {
            return 0;
        }

        // Decode the Base64URL-encoded JWT payload.
        let base64Payload = tokenParts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        base64Payload += "=".repeat(
            (4 - (base64Payload.length % 4)) % 4
        );

        const payload = JSON.parse(atob(base64Payload));

        if (
            typeof payload.exp !== "number" ||
            !Number.isFinite(payload.exp)
        ) {
            return 0;
        }

        return payload.exp * 1000;
    } catch {
        return 0;
    }
}

// Check whether the token has expired.
function isTokenExpired(token) {
    if (!token) return false;

    const expiryTime = getTokenExpiryTime(token);

    return !expiryTime || Date.now() >= expiryTime;
}

function ProtectedRoute({ children }) {
    // Read the token from the current tab's session.
    const token = getAccessToken();

    const [sessionExpired, setSessionExpired] = useState(
        () => isTokenExpired(token)
    );

    const navigate = useNavigate();

    // Monitor the token expiry time.
    useEffect(() => {
        if (!token) return;

        let timeoutId;
        let cancelled = false;

        const checkExpiry = () => {
            if (cancelled) return;

            const expiryTime = getTokenExpiryTime(token);
            const remainingTime = expiryTime - Date.now();

            if (!expiryTime || remainingTime <= 0) {
                clearAuthSession();
                setSessionExpired(true);
                return;
            }

            // Schedule the next expiry check.
            timeoutId = window.setTimeout(
                checkExpiry,
                Math.min(remainingTime, 2147483647)
            );
        };

        checkExpiry();

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [token]);

    // Handle session expiry reported by API requests.
    useEffect(() => {
        const handleSessionExpired = () => {
            clearAuthSession();
            setSessionExpired(true);
        };

        window.addEventListener(
            "session-expired",
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                "session-expired",
                handleSessionExpired
            );
        };
    }, []);

    // Redirect when the current tab has no session.
    if (!token && !sessionExpired) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            {!sessionExpired && children}

            {/* SESSION EXPIRED POPUP */}
            {sessionExpired && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-lg font-semibold mb-2 text-red-600">
                            Session Expired
                        </h3>

                        <p className="text-gray-600 text-sm">
                            Your session has expired. Please login again.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/login", { replace: true })
                            }
                            className="mt-5 px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm cursor-pointer"
                        >
                            Login Again
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProtectedRoute;
