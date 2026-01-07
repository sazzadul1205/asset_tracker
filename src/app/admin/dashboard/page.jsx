// src/app/admin/dashboard/page.jsx
"use client";

import { AiFillThunderbolt } from "react-icons/ai";
import { FaBox } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdAccessTime, MdOutlineSettings } from "react-icons/md";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import Loading from "@/Shared/Loading/Loading";
import Error from "@/Shared/Error/Error";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import SystemLogs from "./SystemLogs/SystemLogs";


const DashboardPage = () => {
  const axiosPublic = useAxiosPublic();

  // Get User Options
  const {
    data: allCountsData,
    isLoading: IsAllCountsLoading,
    isError: IsAllCountsError,
  } = useQuery({
    queryKey: ["allCounts"],
    queryFn: async () =>
      axiosPublic
        .get("/allCounts")
        .then((res) => res.data),
  });

  // Infinite Query for Request Logs
  const {
    data: requestLogsData,
    isLoading: IsRequestLogsLoading,
    isError: IsRequestLogsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["requestLogs"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosPublic.get(`/requestLogs?page=${pageParam}&limit=5`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage?.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
  });


  // Flatten request logs pages
  const allRequestLogs = requestLogsData?.pages?.flatMap((page) => page.data) || [];

  // Stats
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

  // Quick Links
  const quickLinks = [
    {
      href: "/admin/employees",
      title: "User Management",
      desc: "Manage users, roles, and permissions",
      icon: FiUsers,
      color: "blue",
    },
    {
      href: "/admin/departments",
      title: "Department Management",
      desc: "Organize users by departments",
      icon: HiOutlineBuildingOffice2,
      color: "green",
    },
    {
      href: "/admin/assetsCategories",
      title: "Category Management",
      desc: "Manage asset categories and types",
      icon: FaBox,
      color: "orange",
    },
    {
      href: "/admin/companySettings",
      title: "System Settings",
      desc: "Configure organization settings",
      icon: MdOutlineSettings,
      color: "purple",
    },
  ];

  // Handle loading
  if (IsAllCountsLoading || IsRequestLogsLoading)
    return <Loading
      message="Loading Departments..."
      subText="Please wait while we fetch Department data."
    />;

  // Handle errors
  if (IsAllCountsError || IsRequestLogsError) return <Error
    errors={allCountsData?.errors || requestLogsData?.errors || []}
  />;

  console.log(allCountsData);

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5" >
        {/* Left */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900" >Admin Dashboard </h3>
          <p className="text-gray-600 mt-1" >System overview and administrative controls </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3" >
          <div className="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 wrap-break-word hover:bg-secondary/80 text-sm px-3 py-1 bg-indigo-100 text-indigo-700 border-indigo-200" >
            <AiFillThunderbolt />
            System Administrator
          </div>

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

      {/* INFORMATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 py-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={`rounded-lg border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-${color}-500 bg-white border-gray-200`}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-${color}-100 rounded-lg`}>
                  <Icon className={`text-${color}-500 text-2xl`} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {label}
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACCESS LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 py-4">
        {quickLinks.map(({ href, title, desc, icon: Icon, color }) => (
          <Link
            key={title}
            href={href}
            className="rounded-lg border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-white border-gray-50"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-${color}-100 rounded-lg shrink-0`}>
                  <Icon className={`text-2xl text-${color}-500`} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* SYSTEM LOGS */}
      <div className="p-5">
        <SystemLogs
          requestData={allRequestLogs}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </div>
  );
};

export default DashboardPage;