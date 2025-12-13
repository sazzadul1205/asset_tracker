// React
import React from "react";

// Icons
import { HiOutlineClock } from "react-icons/hi";

const Loading = ({
  message = "Loading...",
  subText = "Please wait while we fetch your data.",
  height = "min-h-screen",
  backgroundColor = "bg-blue-50",
}) => {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center ${height} ${backgroundColor} gap-6`}
    >
      {/* Animated Clock Icon */}
      <HiOutlineClock className="text-blue-600 w-20 h-20 md:w-24 md:h-24 animate-spin-slow drop-shadow-lg" />

      {/* Loading Message */}
      <span className="text-gray-700 font-semibold text-xl md:text-2xl animate-pulse">
        {message}
      </span>

      {/* Optional Subtext */}
      {subText && (
        <p className="text-gray-400 text-sm md:text-md font-medium max-w-xs text-center">
          {subText}
        </p>
      )}

      {/* Tailwind-compatible custom animation */}
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
