// React components
import React from "react";

// Icons
import { HiOutlineClock } from "react-icons/hi";
const Loading = ({ message = "Loading..." }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen bg-blue-50 gap-6">
            {/* Hourglass Icon */}
            <HiOutlineClock
                className="text-blue-600 w-24 h-24 animate-spin-slow drop-shadow-lg"
            />

            {/* Loading Text */}
            <span className="text-gray-700 font-semibold text-xl animate-pulse">
                {message}
            </span>

            {/* Optional subtext */}
            <p className="text-gray-400 text-md font-semibold max-w-xs text-center">
                Please wait while we fetch your data.
            </p>

            {/* Animations */}
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