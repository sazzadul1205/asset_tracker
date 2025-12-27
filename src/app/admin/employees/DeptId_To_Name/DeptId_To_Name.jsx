// src/app/admin/employees/DeptId_To_Name/DeptId_To_Name.jsx

// React
import React from "react";
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

const DeptId_To_Name = ({ deptId }) => {
  const axiosPublic = useAxiosPublic();

  // If unassigned, show it immediately
  if (deptId === "UnAssigned" || !deptId || deptId === "UnAssigned" || deptId === "unassigned") {
    return <span>Un Assigned</span>;
  }

  // Fetch
  const {
    data,
    isLoading,
    isError,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useQuery({
    queryKey: ["deptName", deptId],
    queryFn: async () => {
      const res = await axiosPublic.get(
        `/department/${deptId}`
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
  if (isError || !data?.info?.name) {
    return <span className="text-red-500">Not Found</span>;
  }

  // Success
  return (
    <span className="font-semibold text-gray-900">
      {data?.info?.name}
    </span>
  );
};


export default DeptId_To_Name;