// src/app/admin/dashboard/page.jsx
"use client";

// ==============================================================
// IMPORTS
// ==============================================================
import { useState } from "react";
import Link from "next/link";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// Icons
import { AiFillThunderbolt } from "react-icons/ai";
import { FaBox } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdAccessTime, MdOutlineSettings } from "react-icons/md";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

// Components
import Loading from "@/Shared/Loading/Loading";
import Error from "@/Shared/Error/Error";
import SystemLogs from "./SystemLogs/SystemLogs";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

// ==============================================================
// COLOR MAP FOR CONSISTENT STYLING
// ==============================================================
const COLOR_MAP = {
  blue: {
    border: 'border-blue-500',
    bgLight: 'bg-blue-100',
    text: 'text-blue-500',
  },
  green: {
    border: 'border-green-500',
    bgLight: 'bg-green-100',
    text: 'text-green-500',
  },
  orange: {
    border: 'border-orange-500',
    bgLight: 'bg-orange-100',
    text: 'text-orange-500',
  },
  purple: {
    border: 'border-purple-500',
    bgLight: 'bg-purple-100',
    text: 'text-purple-500',
  },
  indigo: {
    border: 'border-indigo-500',
    bgLight: 'bg-indigo-100',
    text: 'text-indigo-700',
  },
};

/**
 * Get color class from COLOR_MAP
 * @param {string} colorName - Color name (blue, green, orange, etc.)
 * @param {string} variant - Variant (border, bgLight, text)
 * @returns {string} Tailwind CSS class
 */
const getColorClass = (colorName, variant = 'border') => {
  return COLOR_MAP[colorName]?.[variant] || COLOR_MAP.blue[variant];
};

// ==============================================================
// DASHBOARD COMPONENT
// ==============================================================
const DashboardPage = () => {
  // ==============================================================
  // STATE & HOOKS
  // ==============================================================
  const axiosPublic = useAxiosPublic();
  const [selectedOptions, setSelectedOptions] = useState([]);

  // ==============================================================
  // API QUERIES
  // ==============================================================

  /**
   * Fetch dashboard counts (users, assets, etc.)
   */
  const {
    data: allCountsData,
    isLoading: IsAllCountsLoading,
    isError: IsAllCountsError,
  } = useQuery({
    queryKey: ["allCounts"],
    queryFn: async () => {
      const response = await axiosPublic.get("/allCounts");
      return response.data;
    },
  });

  /**
   * Build filter query parameters from selected options
   * @param {Array} selectedOptions - Array of selected filter options
   * @returns {string} URL query string
   */
  const buildFilterParams = (selectedOptions) => {
    const types = selectedOptions
      .filter((option) => option.type === "requestType")
      .map((option) => option.value);

    const statuses = selectedOptions
      .filter((option) => option.type === "status")
      .map((option) => option.value);

    const params = new URLSearchParams();

    if (types.length) params.set("types", types.join(","));
    if (statuses.length) params.set("states", statuses.join(","));

    return params.toString();
  };

  /**
   * Infinite query for system logs with filtering
   */
  const {
    data: requestLogsData,
    isLoading: IsRequestLogsLoading,
    isError: IsRequestLogsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["requestLogs", selectedOptions],
    queryFn: async ({ pageParam = 1 }) => {
      const filterQuery = buildFilterParams(selectedOptions);
      const response = await axiosPublic.get(
        `/requestLogs?page=${pageParam}&limit=5&${filterQuery}`
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.hasMore
        ? lastPage.pagination.page + 1
        : undefined;
    },
  });

  // ==============================================================
  // DATA TRANSFORMATIONS
  // ==============================================================

  // Flatten paginated request logs into a single array
  const allRequestLogs = requestLogsData?.pages?.flatMap((page) => page.data) || [];

  /**
   * Dashboard statistics cards configuration
   */
  const stats = [
    {
      label: "Total Users",
      value: allCountsData?.counts?.users || 0,
      icon: FiUsers,
      color: "blue",
    },
    {
      label: "Total Assets",
      value: allCountsData?.counts?.assets || 0,
      icon: FaBox,
      color: "green",
    },
    {
      label: "Pending Requests",
      value: allCountsData?.counts?.pendingRequests || 0,
      icon: MdAccessTime,
      color: "orange",
    },
    {
      label: "Departments",
      value: allCountsData?.counts?.departments || 0,
      icon: HiOutlineBuildingOffice2,
      color: "purple",
    },
  ];

  /**
   * Quick access links configuration
   */
  const quickLinks = [
    {
      href: "/admin/employees",
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: FiUsers,
      color: "blue",
    },
    {
      href: "/admin/departments",
      title: "Department Management",
      description: "Organize users by departments",
      icon: HiOutlineBuildingOffice2,
      color: "green",
    },
    {
      href: "/admin/assetsCategories",
      title: "Category Management",
      description: "Manage asset categories and types",
      icon: FaBox,
      color: "orange",
    },
    {
      href: "/admin/companySettings",
      title: "System Settings",
      description: "Configure organization settings",
      icon: MdOutlineSettings,
      color: "purple",
    },
  ];

  // ==============================================================
  // LOADING & ERROR STATES
  // ==============================================================

  if (IsAllCountsLoading) {
    return (
      <Loading
        message="Loading Dashboard..."
        subText="Please wait while we fetch your dashboard data."
      />
    );
  }

  if (IsAllCountsError || IsRequestLogsError) {
    return (
      <Error
        errors={allCountsData?.errors || requestLogsData?.errors || []}
      />
    );
  }

  // ==============================================================
  // RENDER
  // ==============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white">
        {/* LEFT: TITLE & DESCRIPTION */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            System overview and administrative controls
          </p>
        </div>

        {/* RIGHT: BADGE & DATE */}
        <div className="flex items-center gap-3">
          {/* ADMIN BADGE */}
          <div className={`inline-flex items-center gap-2 rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 text-sm px-3 py-1 ${getColorClass('indigo', 'bgLight')} ${getColorClass('indigo', 'text')} border-indigo-200`}>
            <AiFillThunderbolt />
            System Administrator
          </div>

          {/* CURRENT DATE */}
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* STATISTICS CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 py-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={`rounded-lg border bg-white shadow-lg hover:shadow-xl transition-shadow border-l-4 ${getColorClass(color, 'border')} border-gray-200`}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                {/* ICON CONTAINER */}
                <div className={`p-2 rounded-lg ${getColorClass(color, 'bgLight')}`}>
                  <Icon className={`text-2xl ${getColorClass(color, 'text')}`} />
                </div>

                {/* TEXT CONTENT */}
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {label}
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACCESS LINKS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 py-4">
        {quickLinks.map(({ href, title, description, icon: Icon, color }) => (
          <Link
            key={title}
            href={href}
            className="rounded-lg border bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-gray-50 hover:border-gray-200"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                {/* ICON CONTAINER */}
                <div className={`p-3 rounded-lg shrink-0 ${getColorClass(color, 'bgLight')}`}>
                  <Icon className={`text-2xl ${getColorClass(color, 'text')}`} />
                </div>

                {/* TEXT CONTENT */}
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* SYSTEM LOGS SECTION */}
      <div className="p-5">
        <SystemLogs
          requestData={allRequestLogs}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          onFilterChange={({ selectedOptions: newOptions }) => {
            setSelectedOptions(newOptions);
          }}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          isFetchingNextPage={isFetchingNextPage}
          IsRequestLogsLoading={IsRequestLogsLoading}
        />
      </div>
    </div>
  );
};

export default DashboardPage;