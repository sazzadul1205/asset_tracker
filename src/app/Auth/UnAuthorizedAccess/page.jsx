// Auth/UnAuthorizedAccess

// React
import React from "react";

// Next Components
import { useRouter, useSearchParams } from "next/navigation";

// Hooks
import { useAuth } from "@/Hooks/useAuth";

const UnauthorizedPage = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const searchParams = useSearchParams();

  // Get message from query or default
  const message = searchParams.get("message") || "Unauthorized Access";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="card w-full max-w-md bg-white border border-gray-300 shadow-lg rounded-xl p-6 space-y-6 text-center">

        {/* Title */}
        <h1 className="text-2xl font-bold text-red-600">⚠ {message}</h1>

        {/* Message */}
        <p className="text-gray-600">
          You do not have permission to access this page.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-4">

          {/* Logout */}
          <button
            onClick={logout}
            className="btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>

          {/* Go Back */}
          <button
            onClick={() => router.back()}
            className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
