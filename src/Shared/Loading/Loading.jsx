import React from "react";
import { HiOutlineClock } from "react-icons/hi";

const VARIANT_STYLES = {
  page: "min-h-screen bg-blue-50",
  section: "h-full w-full flex items-center justify-center bg-transparent", // Updated: center both vertically & horizontally
  modal:
    "fixed inset-0 z-50 flex items-center justify-center bg-black/40",
};

const Loading = ({
  message = "Loading...",
  subText = "Please wait while we fetch your data.",
  variant = "section",
  className = "",
}) => {
  return (
    <div className={`${VARIANT_STYLES[variant]} ${className}`}>
      {/* Modal box only for modal variant */}
      <div
        className={
          variant === "modal"
            ? "modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900 flex flex-col items-center justify-center gap-6"
            : "flex flex-col items-center justify-center gap-6" // Section & page now centered
        }
      >
        {/* Animated Icon */}
        <HiOutlineClock className="text-blue-600 text-[100px] animate-spin-slow drop-shadow-lg" />

        {/* Main Message */}
        <span className="text-gray-700 font-semibold text-xl animate-pulse">
          {message}
        </span>

        {/* Sub Text */}
        {subText && (
          <p className="text-gray-400 text-sm max-w-xs text-center">{subText}</p>
        )}
      </div>

      {/* Spin Animation */}
      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;
