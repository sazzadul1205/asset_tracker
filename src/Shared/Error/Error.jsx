// src/Shared/Error/Error.jsx

// React
import React, { useEffect, useMemo } from "react";

// Next
import { useRouter } from "next/navigation";

// Icons
import { HiOutlineExclamationCircle } from "react-icons/hi";

//  Extracts a user-friendly message from various error formats
const extractErrorMessage = (error) => {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (Array.isArray(error))
    return error.map(extractErrorMessage).filter(Boolean).join(", ");
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "An unknown error occurred";
};

// Variants for different layouts
const VARIANT_STYLES = {
  page: "min-h-screen flex items-center justify-center bg-red-50 p-6",
  section: "h-full flex items-center justify-center p-6",
  modal:
    "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6",
  overlay:
    "absolute inset-0 bg-white/70 flex items-center justify-center z-50 p-6",
};

// Error Component 
const Error = ({
  errors,
  onRetry,
  title = "Something went wrong",
  variant = "page",
}) => {
  // Next Router
  const router = useRouter();

  // Extract error messages
  const errorArray = useMemo(
    () => (Array.isArray(errors) ? errors : [errors]),
    [errors]
  );

  // Extract user-friendly error messages
  const messages = errorArray.map(extractErrorMessage).filter(Boolean);

  // Log errors
  useEffect(() => {
    console.error("Logged Error(s):", errorArray);
  }, [errorArray]);

  // Default error message
  const defaultMessage = "Oops! Something went wrong. Please try again later.";

  return (
    <div className={VARIANT_STYLES[variant]}>
      {/* Error Card */}
      <div
        className={
          variant === "modal" || variant === "overlay"
            ? "modal-box w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900 flex flex-col items-center justify-center gap-6 animate-fade-in"
            : "bg-white shadow-lg rounded-xl p-8 max-w-lg w-full text-center animate-fade-in"
        }
      >
        {/* Icon */}
        <HiOutlineExclamationCircle className="text-red-600 w-20 h-20 mx-auto mb-4 animate-bounce-slow" />

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-4">
          {title}
        </h1>

        {/* Messages */}
        <div className="mb-6 space-y-2">
          {messages.length > 0
            ? messages.map((msg, idx) => (
              <p
                key={idx}
                className="text-gray-700 wrap-break-word text-sm md:text-base"
              >
                {msg}
              </p>
            ))
            : <p className="text-gray-700 text-sm md:text-base">{defaultMessage}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-all shadow-md"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-all shadow-md"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md"
          >
            Home
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow { animation: bounce-slow 1.5s infinite; }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default Error;
