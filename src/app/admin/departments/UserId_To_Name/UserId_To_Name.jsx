// src/app/admin/departments/UserId_To_Name/UserId_To_Name.jsx

// React
import React from "react";
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

const UserId_To_Name = ({ userId }) => {
  const axiosPublic = useAxiosPublic();

  // Get Name
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userName", userId],
    queryFn: async () => {
      const res = await axiosPublic.get(
        `/users/${userId}?include=personal.name`
      );
      return res.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Loading
  if (isLoading) {
    return <span className="text-gray-400">Loading...</span>;
  }

  // Error or not found
  if (isError || !data?.personal?.name) {
    return <span className="text-red-500">Not Found</span>;
  }

  // Success
  return (
    <span className="font-medium text-gray-900">
      {data.personal.name}
    </span>
  );
};

export default UserId_To_Name;
