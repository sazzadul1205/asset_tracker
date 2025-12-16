import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineExclamationCircle } from "react-icons/hi";

/**
 * Extracts a user-friendly message from various error formats
 * Supports: string, Error object, Axios error object, arrays
 */
const extractErrorMessage = (error) => {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (Array.isArray(error)) return error.map(extractErrorMessage).filter(Boolean).join(", ");
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "An unknown error occurred";
};

// Variants for different layouts: page, modal, overlay, section
const VARIANT_STYLES = {
  page: "min-h-screen",
  section: "h-full",
  modal: "h-full",
  overlay: "absolute inset-0 bg-white/70 flex items-center justify-center z-50",
};

/**
 * Error Component
 * Displays an error card with icon, messages, and action buttons
 *
 * @param {Object} props
 * @param {string|object|array} props.errors - Error(s) to display
 * @param {function} [props.onRetry] - Optional callback for retry action
 * @param {string} [props.title] - Optional heading text
 * @param {string} [props.variant] - Layout variant: page/modal/overlay/section
 */
const Error = ({
  errors,
  onRetry,
  title = "Something went wrong",
  variant = "page",
}) => {
  const router = useRouter();

  // Normalize errors to an array
  const errorArray = useMemo(
    () => (Array.isArray(errors) ? errors : [errors]),
    [errors]
  );

  // Convert errors to user-friendly messages
  const messages = errorArray.map(extractErrorMessage).filter(Boolean);

  // Debug logging
  useEffect(() => {
    console.error("Logged Error(s):", errorArray);
  }, [errorArray]);

  const defaultMessage = "Oops! Something went wrong. Please try again later.";

  return (
    <div
      className={`w-full flex items-center justify-center p-6 bg-red-50 ${VARIANT_STYLES[variant]}`}
    >
      {/* Error Card */}
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full text-center animate-fade-in">

        {/* Error Icon */}
        <HiOutlineExclamationCircle className="text-red-600 w-20 h-20 mx-auto mb-4 animate-bounce-slow" />

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-4">{title}</h1>

        {/* Error Messages */}
        <div className="mb-6 space-y-2">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <p key={idx} className="text-gray-700 wrap-break-word text-sm md:text-base">
                {msg}
              </p>
            ))
          ) : (
            <p className="text-gray-700 text-sm md:text-base">{defaultMessage}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {/* Retry button if callback is provided */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-all shadow-md"
            >
              Retry
            </button>
          )}

          {/* Go Back button */}
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-all shadow-md"
          >
            Go Back
          </button>

          {/* Home button */}
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
        /* Icon bounce animation */
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow { animation: bounce-slow 1.5s infinite; }

        /* Card fade-in animation */
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
