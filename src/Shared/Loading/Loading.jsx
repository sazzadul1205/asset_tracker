// React
import React from "react";

// Icons
import { HiOutlineClock } from "react-icons/hi";

const VARIANT_STYLES = {
  page: "min-h-screen bg-blue-50",
  section: "h-full bg-transparent",
  modal: "h-full bg-white",
  overlay: "absolute inset-0 bg-white/60 z-50",
};

const Loading = ({
  message = "Loading...",
  subText = "Please wait while we fetch your data.",
  variant = "section",
  className = "",
}) => {
  return (
    <div
      className={`
        w-full flex flex-col items-center justify-center gap-6
        ${VARIANT_STYLES[variant]}
        ${className}
      `}
    >
      {/* Animated Icon */}
      <HiOutlineClock className="text-blue-600 text-[100px] animate-spin-slow drop-shadow-lg" />

      {/* Message */}
      <span className="text-gray-700 font-semibold text-xl animate-pulse">
        {message}
      </span>

      {/* Sub text */}
      {subText && (
        <p className="text-gray-400 text-sm max-w-xs text-center">
          {subText}
        </p>
      )}

      {/* Animation */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;
