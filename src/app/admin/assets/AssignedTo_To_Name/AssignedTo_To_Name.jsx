// src/app/admin/assets/AssignedTo_To_Name/AssignedTo_To_Name.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Helper to get initials from a name
const getUserInitials = (name) => {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

const AssignedTo_To_Name = ({ assignedTo, showAvatar = true }) => {
  const axiosPublic = useAxiosPublic();

  // ---- UNASSIGNED ----
  if (!assignedTo) {
    return <span className="text-gray-400 italic">Unassigned</span>;
  }

  // ---- FETCH ----
  const {
    data: MyUserData,
    isLoading: MyUserIsLoading,
    isError: MyUserError,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useQuery({
    queryKey: ["UserNameAndEmail", assignedTo],
    queryFn: async () => {
      const res = await axiosPublic.get(
        `/users/${assignedTo}?include=personal.name,credentials.email`
      );
      return res.data?.data || null;
    },
    enabled: !!assignedTo,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex items-center space-x-3">
      {/* Avatar */}
      {showAvatar && (
        MyUserIsLoading ? (
          <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <div className="w-11 h-11 rounded-full ring ring-gray-200 ring-offset-2 flex items-center justify-center bg-gray-300 text-gray-800 font-bold select-none">
            {getUserInitials(MyUserData?.personal?.name)}
          </div>
        )
      )}

      {/* User Details */}
      <div
        className={`border-l pl-4 border-gray-300 ${showAvatar ? "min-w-45" : ""
          }`}
      >
        {MyUserIsLoading ? (
          <div className="space-y-1 animate-pulse">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-200 rounded" />
          </div>
        ) : MyUserError || !MyUserData ? (
          <p className="text-sm text-red-500 font-medium">
            Failed to load user
          </p>
        ) : (
          <>
            <p className="font-semibold leading-tight">
              {MyUserData?.personal?.name || "Unknown User"}
            </p>
            <p className="text-sm text-gray-600 font-medium truncate">
              {MyUserData?.credentials?.email || "Unknown Email"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AssignedTo_To_Name;
