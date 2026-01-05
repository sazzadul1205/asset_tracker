// src/app/admin/assets/RequestedById_To_Name/RequestedById_To_Name.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Helper to get initials
const getUserInitials = (name) => {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const RequestedById_To_Name = ({
  requestedById,
  requestedToId,
  showAvatar = true,
  ShowRequestedById = false,
  ShowRequestedToId = false,
}) => {
  const axiosPublic = useAxiosPublic();

  // Fetch user
  const { data, isLoading, isError } = useQuery({
    queryKey: ["EmployeeManager", requestedById, requestedToId],
    queryFn: async () => {
      const res = await axiosPublic.post("/users/EmployeeManager", {
        requestedById,
        requestedToId,
      });
      return res.data?.data;
    },
    enabled: !!requestedById && !!requestedToId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        {showAvatar && (
          <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
        )}
        <div className="space-y-1 animate-pulse">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <span className="text-sm text-red-500 font-medium">
        Failed to load user
      </span>
    );
  }

  // Decide which user to display
  const user =
    ShowRequestedById ? data.requestedBy :
      ShowRequestedToId ? data.requestedTo :
        null;

  if (!user) return null;

  // Nothing to show
  if (!ShowRequestedById && !ShowRequestedToId) return null;

  return (
    <div className="flex items-center space-x-3">
      {/* Avatar */}
      {showAvatar && (
        <div className="w-11 h-11 rounded-full ring ring-gray-200 ring-offset-2 flex items-center justify-center bg-gray-300 text-gray-800 font-bold select-none">
          {getUserInitials(user.name)}
        </div>
      )}

      {/* User Details */}
      <div className={`border-l pl-4 border-gray-300 ${showAvatar ? "min-w-45" : ""}`}>
        <p className="font-semibold leading-tight">
          {user.name || "Unknown User"}
        </p>
        <p className="text-sm text-gray-600 font-medium truncate">
          {user.email || "Unknown Email"}
        </p>
      </div>
    </div>
  );
};

export default RequestedById_To_Name;
