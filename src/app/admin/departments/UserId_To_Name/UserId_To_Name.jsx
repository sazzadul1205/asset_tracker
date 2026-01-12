// src/app/admin/departments/UserId_To_Name/UserId_To_Name.jsx

// React
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Icons
import { FiUser, FiLoader, FiAlertCircle, FiUserCheck, FiUserX } from "react-icons/fi";

const UserId_To_Name = ({
  userId,
  showIcon = false,
  showRole = false,
  showStatus = false,
  showUserId = false,
  className = "",
  compact = false,
  showNameOnly = false
}) => {
  const axiosPublic = useAxiosPublic();

  // Memoize userId for comparison
  const normalizedUserId = useMemo(() => {
    if (!userId) return null;
    return userId.trim();
  }, [userId]);

  // Check if unassigned or invalid
  const isUnassigned = useMemo(() => {
    if (!normalizedUserId) return true;
    const lowerUserId = normalizedUserId.toLowerCase();
    return [
      "unassigned",
      "unassigned",
      "not assigned",
      "none",
      "null",
      "undefined",
      ""
    ].includes(lowerUserId);
  }, [normalizedUserId]);


  // Fetch user data
  const {
    data: user,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["user", "name", normalizedUserId],
    queryFn: async () => {
      try {
        const res = await axiosPublic.get(
          `/users/${normalizedUserId}?include=personal.name,personal.status,employment.role`
        );

        // Validate response structure
        if (!res.data?.success) {
          throw new Error("Invalid user data received");
        }

        return res.data?.data;
      } catch (err) {
        console.error(`[UserId_To_Name] Error fetching user ${normalizedUserId}:`, err);
        throw err;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: 1000,
    enabled: !!normalizedUserId && !isUnassigned,
    meta: {
      errorMessage: `Failed to load user: ${normalizedUserId}`,
    },
  });

  // If unassigned, show it immediately
  if (isUnassigned) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {showIcon && <FiUserX className="text-gray-400 w-3.5 h-3.5" />}
        <span className="text-gray-500 italic font-medium">
          {compact ? "Unassigned" : "Not Assigned"}
        </span>
      </div>
    );
  }


  // Loading state
  if (isLoading || isFetching) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <FiLoader className="w-3.5 h-3.5 text-blue-500 animate-spin" />
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = error?.response?.data?.message ||
      error?.message ||
      "Failed to load user";

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`} title={errorMessage}>
        <FiAlertCircle className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-amber-600 font-medium text-sm">
          {compact ? `ID: ${normalizedUserId?.slice(0, 6)}...` : "User Not Found"}
        </span>
      </div>
    );
  }

  // Check if user data exists
  if (!user?.personal?.name) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <FiAlertCircle className="w-3.5 h-3.5 text-red-500" />
        <span className="text-red-500 font-medium text-sm">Invalid User</span>
      </div>
    );
  }

  // Success - Show user name with optional details
  const userName = user.personal.name;
  const userRole = user.employment?.role;
  const userStatus = user.personal?.status;

  // Get role color
  const getRoleColor = (role) => {
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case "admin": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "employee": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active": return <FiUserCheck className="w-3 h-3 text-green-500" />;
      case "inactive": return <FiUserX className="w-3 h-3 text-gray-500" />;
      default: return <FiUser className="w-3 h-3 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active": return "text-green-600";
      case "inactive": return "text-gray-500";
      case "on_leave": return "text-yellow-600";
      case "suspended": return "text-red-600";
      default: return "text-gray-500";
    }
  };

  // Format status
  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // If showNameOnly is true, just return the name
  if (showNameOnly) {
    return (
      <span className={`font-medium text-gray-900 ${className}`}>
        {userName}
      </span>
    );
  }

  // Compact view (for tables)
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {showIcon && (
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${userStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div className={`w-2 h-2 rounded-full ${userStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'} absolute top-0 left-0 animate-ping`}></div>
          </div>
        )}
        <span className="font-medium text-gray-900 truncate max-w-37.5" title={userName}>
          {userName}
        </span>
        {showRole && userRole && (
          <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${getRoleColor(userRole)}`}>
            {userRole}
          </span>
        )}
      </div>
    );
  }

  // Full view with all details
  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      {/* Name and basic info */}
      <div className="flex items-center gap-2">
        {showIcon && (
          <div className="shrink-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <FiUser className="text-blue-600 w-4 h-4" />
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 truncate" title={userName}>
              {userName}
            </span>

            {showStatus && userStatus && (
              <div className="flex items-center gap-1" title={`Status: ${formatStatus(userStatus)}`}>
                {getStatusIcon(userStatus)}
                <span className={`text-xs ${getStatusColor(userStatus)}`}>
                  {formatStatus(userStatus)}
                </span>
              </div>
            )}
          </div>

          {showRole && userRole && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColor(userRole)}`}>
                {userRole}
              </span>
              <span className="text-xs text-gray-500">
                ID: {normalizedUserId?.slice(0, 8)}...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Additional details if needed */}
      {showUserId && normalizedUserId && (
        <div className="text-xs text-gray-500 mt-0.5">
          User ID: {normalizedUserId}
        </div>
      )}
    </div>
  );
};

export default UserId_To_Name;