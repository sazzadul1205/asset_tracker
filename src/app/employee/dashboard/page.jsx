// src/app/employee/dashboard/page.jsx
"use client";

// ==============================================================
// IMPORTS
// ==============================================================
import { useState } from "react";

// Next Components
import { useSession } from "next-auth/react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';

// Icons
import { FaBox } from "react-icons/fa";
import { LuUsersRound } from "react-icons/lu";
import { TbActivityHeartbeat } from "react-icons/tb";
import { MdAccessTime, MdCheck, MdClose } from "react-icons/md";

// Components
import SystemLogs from "@/app/admin/dashboard/SystemLogs/SystemLogs";
import Link from "next/link";
import { FiUsers } from "react-icons/fi";
import { SiGoogledocs } from "react-icons/si";

// ==============================================================
// COLOR MAP FOR CONSISTENT STYLING
// ==============================================================
const COLOR_MAP = {
  blue: {
    border: "border-l-4 border-l-blue-500",
    bgLight: "bg-blue-100",
    text: "text-blue-600",
  },
  green: {
    border: "border-l-4 border-l-green-500",
    bgLight: "bg-green-100",
    text: "text-green-600",
  },
  orange: {
    border: "border-l-4 border-l-orange-500",
    bgLight: "bg-orange-100",
    text: "text-orange-600",
  },
  red: {
    border: "border-l-4 border-l-red-500",
    bgLight: "bg-red-100",
    text: "text-red-600",
  },
  purple: {
    border: "border-l-4 border-l-purple-500",
    bgLight: "bg-purple-100",
    text: "text-purple-600",
  },
  indigo: {
    border: "border-l-4 border-l-indigo-500",
    bgLight: "bg-indigo-100",
    text: "text-indigo-700",
  },
};


// Function to get color class
const getColorClass = (color, type) => {
  return COLOR_MAP[color]?.[type] || "";
};


// src/app/employee/dashboard/page.jsx
const DashboardPage = () => {

  // ==============================================================
  // STATE & HOOKS
  // ==============================================================
  const axiosPublic = useAxiosPublic();
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Session
  const { data: session, status } = useSession();

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
    queryKey: ["allCounts", session?.user?.userId],
    queryFn: async () => {
      const response = await axiosPublic.get(`/allCounts/${session?.user?.userId}`);
      return response.data;
    },
    keepPreviousData: true,
    enabled: !!session?.user?.userId,
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
   * Infinite query for request logs filtered by department
   */
  const {
    data: requestLogsData,
    isLoading: isRequestLogsLoading,
    isError: isRequestLogsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["requestLogs", selectedOptions, session?.user?.userId],
    queryFn: async ({ pageParam = 1 }) => {
      const filterQuery = buildFilterParams(selectedOptions);
      console.log("User", session?.user?.userId);
      const userIdParam = `userId=${session?.user?.userId}`;


      const response = await axiosPublic.get(
        `/requestLogs?page=${pageParam}&limit=5&${userIdParam}&${filterQuery}`
      );

      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 1000 * 60,
    keepPreviousData: true,
    enabled: !!session?.user?.userId && !!selectedOptions
  });

  // Flatten logs
  const allRequestLogs = requestLogsData?.pages?.flatMap((page) => page.data) || [];

  /**
  * Dashboard statistics cards configuration
  */
  const stats = [
    {
      label: "Total Assets",
      value: allCountsData?.counts?.assets ?? 0,
      icon: FaBox,
      color: "blue",
    },
    {
      label: "Pending Requests",
      value: allCountsData?.counts?.requests?.pending ?? 0,
      icon: MdAccessTime,
      color: "orange",
    },
    {
      label: "Rejected Requests",
      value: allCountsData?.counts?.requests?.rejected ?? 0,
      icon: MdClose,
      color: "red",
    },
    {
      label: "Approved Requests",
      value: allCountsData?.counts?.requests?.accepted ?? 0,
      icon: MdCheck,
      color: "green",
    },
  ];

  /**
   * Quick access links configuration
   */
  const quickLinks = [
    {
      href: "/employee/myAssets",
      title: "My Assets ",
      description: "View and manage your assigned assets ",
      icon: FaBox,
      color: "blue",
    },
    {
      href: "/admin/myRequests",
      title: "Request Asset",
      description: "Submit new asset requests  ",
      icon: SiGoogledocs,
      color: "green",
    },
    {
      href: "/admin/profile",
      title: "My Profile ",
      description: "Update your personal information ",
      icon: FiUsers,
      color: "orange",
    },
  ];


  // Handle loading
  if (status === "loading" || IsAllCountsLoading)
    return <Loading
      message="Loading Assets..."
      subText="Please wait while we fetch Assets data."
    />;

  // Handle errors
  if (IsAllCountsError || isRequestLogsError) return <Error
    errors={allCountsData?.errors || requestLogsData?.errors || []} />;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 p-4 sm:p-5 bg-white sm:flex-row sm:items-center sm:justify-between">
        {/* LEFT: TITLE & DESCRIPTION */}
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Employee Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome to your employee dashboard!
          </p>
        </div>

        {/* RIGHT: BADGE & DATE */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {/* ADMIN BADGE */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 text-xs sm:text-sm font-semibold rounded-full
            cursor-pointer bg-indigo-50 text-indigo-700 border border-indigo-200
            transition-transform duration-200 ease-out
            hover:-translate-y-1 hover:shadow-md"
          >
            <TbActivityHeartbeat className="text-sm sm:text-base" />
            Employee
          </div>

          {/* CURRENT DATE */}
          <p className="text-xs sm:text-sm font-medium text-gray-500">
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
            className={`rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow ${getColorClass(color, 'border')}`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-5 py-4">
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
          IsRequestLogsLoading={isRequestLogsLoading}
        />
      </div>

    </div>
  );
};

export default DashboardPage;