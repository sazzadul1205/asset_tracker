// React Components
import React, { useEffect, useMemo } from "react";

// Next.js Components
import { useRouter } from "next/navigation";

// Icons
import { HiOutlineExclamationCircle } from "react-icons/hi";

/**
 * Extract a user-friendly message from any error object/string
 */
const extractErrorMessage = (error) => {
    if (!error) return null;
    if (typeof error === "string") return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return "An unknown error occurred";
};

/**
 * Error Component
 * Accepts single or multiple errors dynamically
 * Usage: <Error errors={[error1, error2]} /> or <Error errors={error} />
 */
const Error = ({ errors }) => {
    const router = useRouter();

    // Ensure errors is always an array
    const errorArray = useMemo(
        () => Array.isArray(errors) ? errors : [errors],
        [errors]
    );

    // Extract messages
    const messages = errorArray
        .map(extractErrorMessage)
        .filter(Boolean);

    // Log errors for debugging
    useEffect(() => {
        console.error("Logged Error(s):", errorArray);
    }, [errorArray]);

    // Fallback message
    const defaultMessage = "Oops! Something went wrong. Please try again later.";

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-red-100 via-red-50 to-red-100 p-6 text-center">
            {/* Error Icon */}
            <HiOutlineExclamationCircle className="text-red-600 w-32 h-32 mb-6 animate-bounce-slow" />

            {/* Error Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-red-700 mb-4">Error</h1>

            {/* Display all messages */}
            <div className="max-w-md mb-6">
                {messages.length > 0 ? (
                    messages.map((msg, idx) => (
                        <p key={idx} className="text-gray-700 mb-2 wrap-break-word">
                            {msg}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-700">{defaultMessage}</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors shadow-lg"
                >
                    Go Back
                </button>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
                >
                    Home
                </button>
            </div>

            {/* Bounce Animation */}
            <style jsx>{`
                @keyframes bounce-slow {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-15px); }
                }
                .animate-bounce-slow {
                  animation: bounce-slow 1.5s infinite;
                }`}
            </style>
        </div>
    );
};

export default Error;
