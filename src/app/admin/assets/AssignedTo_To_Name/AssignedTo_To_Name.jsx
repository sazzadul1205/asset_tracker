// src/app/admin/assets/AssignedTo_To_Name/AssignedTo_To_Name.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Helper to get initials from a name
const getUserInitials = (name) => {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Avatar component with different sizes
const Avatar = ({ name, size = "md", isLoading = false }) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (isLoading) {
    return (
      <div
        className={`rounded-full bg-gray-200 animate-pulse ${sizeClass}`}
      />
    );
  }

  const initials = getUserInitials(name);

  return (
    <div
      className={`rounded-full flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 text-white font-bold select-none shadow-sm ${sizeClass}`}
      title={name || "User"}
    >
      {initials}
    </div>
  );
};

const AssignedTo_To_Name = ({
  assignedTo,
  showAvatar = true,
  avatarSize = "md",
  showEmail = true,
  compact = false
}) => {
  const axiosPublic = useAxiosPublic();

  // ---- FETCH ----
  const {
    data: MyUserData,
    isLoading: MyUserIsLoading,
    isError: MyUserError,
    error: queryError,
  } = useQuery({
    queryKey: ["UserNameAndEmail", assignedTo],
    queryFn: async () => {
      try {
        const res = await axiosPublic.get(
          `/users/${assignedTo}?include=personal.name,credentials.email`
        );
        return res.data?.data || null;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },
    enabled: !!assignedTo,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Extract user data safely
  const userName = MyUserData?.personal?.name || "Unknown User";
  const userEmail = MyUserData?.credentials?.email;

  // ---- UNASSIGNED ----
  if (!assignedTo) {
    return (
      <div className="flex items-center gap-2">
        {showAvatar && (
          <div className={`rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 ${avatarSize === "xs" ? "w-6 h-6 text-xs" : avatarSize === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"}`}>
            —
          </div>
        )}
        <span className="text-gray-400 italic">Unassigned</span>
      </div>
    );
  }

  // ---- COMPACT VIEW (for tables) ----
  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        {showAvatar && (
          <Avatar
            name={userName}
            size={avatarSize}
            isLoading={MyUserIsLoading}
          />
        )}
        <div className="min-w-0">
          {MyUserIsLoading ? (
            <div className="space-y-1">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              {showEmail && <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />}
            </div>
          ) : MyUserError ? (
            <div className="space-y-1">
              <p className="text-sm text-red-500 font-medium truncate">
                Error loading
              </p>
              <p className="text-xs text-gray-500 truncate">
                ID: {assignedTo}
              </p>
            </div>
          ) : (
            <div className="truncate">
              <p className="text-sm font-medium text-gray-800 truncate" title={userName}>
                {userName}
              </p>
              {showEmail && userEmail && (
                <p className="text-xs text-gray-500 truncate" title={userEmail}>
                  {userEmail}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- DEFAULT VIEW (with details) ----
  return (
    <div className="flex items-start md:items-center gap-3 w-full">
      {/* Avatar - Always show when enabled */}
      {showAvatar && (
        <div className="shrink-0">
          <Avatar
            name={userName}
            size={avatarSize}
            isLoading={MyUserIsLoading}
          />
        </div>
      )}

      {/* User Details */}
      <div className="flex-1 min-w-0">
        {MyUserIsLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : MyUserError ? (
          <div className="space-y-1">
            <p className="text-sm text-red-500 font-medium">
              Failed to load user
            </p>
            <p className="text-xs text-gray-500">
              User ID: {assignedTo}
            </p>
            {queryError && (
              <p className="text-xs text-gray-400">
                Error: {queryError.message}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p
              className="font-semibold text-gray-800 truncate"
              title={userName}
            >
              {userName}
            </p>
            {showEmail && (
              <p
                className="text-sm text-gray-600 truncate"
                title={userEmail || "No email available"}
              >
                {userEmail || "No email"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedTo_To_Name;