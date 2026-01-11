// src/app/admin/employees/DeptId_To_Name/DeptId_To_Name.jsx

// React
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Icons
import { FiLoader, FiAlertCircle, FiUsers } from "react-icons/fi";

const DeptId_To_Name = ({ deptId, showIcon = false, className = "" }) => {
  const axiosPublic = useAxiosPublic();

  // Memoize normalized department ID for comparison
  const normalizedDeptId = useMemo(() => {
    if (!deptId) return null;
    return deptId.trim();
  }, [deptId]);

  // Check if unassigned
  const isUnassigned = useMemo(() => {
    if (!normalizedDeptId) return true;
    const lowerDeptId = normalizedDeptId.toLowerCase();
    return [
      "unassigned",
      "unassigned",
      "not assigned",
      "none",
      "null",
      "undefined",
      ""
    ].includes(lowerDeptId);
  }, [normalizedDeptId]);


  // Fetch department data
  const {
    data: department,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["department", "name", normalizedDeptId],
    queryFn: async () => {
      try {
        const res = await axiosPublic.get(`/department/${normalizedDeptId}`);

        // Validate response structure
        if (!res.data?.success) {
          throw new Error("Invalid department data received");
        }

        return res.data?.data;
      } catch (err) {
        console.error(`[DeptId_To_Name] Error fetching department ${normalizedDeptId}:`, err);
        throw err;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: 1000,
    enabled: !!normalizedDeptId && !isUnassigned,
    meta: {
      errorMessage: `Failed to load department: ${normalizedDeptId}`,
    },
  });

  // If unassigned, show it immediately
  if (isUnassigned) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {showIcon && <FiUsers className="text-gray-400 w-3.5 h-3.5" />}
        <span className="text-gray-500 italic font-medium">Unassigned</span>
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
      "Failed to load department";

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`} title={errorMessage}>
        <FiAlertCircle className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-amber-600 font-medium text-sm">
          {normalizedDeptId?.slice(0, 8)}...
        </span>
      </div>
    );
  }

  // Check if department data exists
  if (!department?.info?.name) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <FiAlertCircle className="w-3.5 h-3.5 text-red-500" />
        <span className="text-red-500 font-medium">Invalid Dept</span>
      </div>
    );
  }

  // Success - Show department name with optional icon
  const departmentName = department.info.name;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showIcon && (
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500 absolute top-0 left-0 animate-ping"></div>
        </div>
      )}
      <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-default">
        {departmentName}
      </span>
      {department?.info?.description && (
        <span
          className="text-xs text-gray-500 ml-1 cursor-help"
          title={department.info.description}
        >
          ⓘ
        </span>
      )}
    </div>
  );
};


export default DeptId_To_Name;