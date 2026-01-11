// arc/app/admin/employees/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

// Hooks
import { useToast } from '@/hooks/useToast';
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Table_Pagination from '@/Shared/Table_Pagination/Table_Pagination';

// Icons
import { IoMdAdd } from 'react-icons/io';
import { MdEdit } from 'react-icons/md';
import { FaBoxOpen, FaEye, FaRegTrashAlt, FaSearch } from 'react-icons/fa';

// Modal
import Edit_User_Modal from './Edit_User_Modal/Edit_User_Modal';
import View_User_Modal from './View_User_Modal/View_User_Modal';
import Add_New_User_Modal from './Add_New_User_Modal/Add_New_User_Modal';

// Date Fns
import { formatDistanceToNow } from 'date-fns';

// Components
import DeptId_To_Name from './DeptId_To_Name/DeptId_To_Name';

const EmployeesPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // Toast
  const { success, error, confirm } = useToast();

  // State variables -> Users
  const [itemsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // State Variable -> Selected User
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch Users
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["users", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const res = await axiosPublic.get("/users", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  // Get Department Options
  const {
    data: departmentOptionsData,
    isLoading: departmentLoading,
    isError: departmentError,
    refetch: departmentRefetch
  } = useQuery({
    queryKey: ["DepartmentOption"],
    queryFn: async () =>
      axiosPublic
        .get(`/department/DepartmentOptions`)
        .then(res => res.data.data),
  });

  // Destructure AllUsers data
  const Users = data?.data || [];

  // Handle loading
  if (status === "loading" || departmentLoading)
    return <Loading
      message="Loading Users..."
      subText="Please wait while we fetch users data."
    />;

  // Handle errors
  if (isError || departmentError) return <Error errors={data?.errors || departmentOptionsData?.errors || []} />;

  // Refetch all
  const RefetchAll = () => {
    refetch();
    departmentRefetch();
  };

  // Delete user (improved & safe)
  const handleDeleteEmployee = async (user) => {
    if (!user?.personal?.userId) {
      error("Invalid user", "User ID not found");
      return;
    }

    // Confirm dialog
    const isConfirmed = await confirm(
      "Delete User?",
      `This will permanently delete ${user.personal.name}.`,
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      await axiosPublic.delete(`/users/${user.personal.userId}`);

      success(
        "User Deleted",
        `${user.personal.name} has been removed successfully`
      );

      refetch();
    } catch (err) {
      console.error("Delete user error:", err);

      error(
        "Delete Failed",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  };

  // Helper to get user initials
  const getUserInitials = (name) => {
    if (!name) return "NA";
    return name.trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper to format position
  const formatPosition = (position) => {
    if (!position || position.toLowerCase() === "unassigned") return "Unassigned";
    return position.charAt(0).toUpperCase() + position.slice(1);
  };

  // Helper to format role
  const formatRole = (role) => {
    if (!role) return "N/A";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Helper to format status
  const formatStatus = (status) => {
    if (!status) return "N/A";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700";
      case "inactive": return "bg-gray-200 text-gray-700";
      case "on_leave": return "bg-yellow-100 text-yellow-700";
      case "suspended": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-2 md:p-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-t-lg flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 md:py-4 md:mx-0 mt-2 md:mt-4 space-y-4 md:space-y-0">
        {/* Title and Mobile Search Toggle */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Users
          </h3>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle search"
          >
            <FaSearch className="text-gray-600 w-5 h-5" />
          </button>
        </div>

        {/* Desktop Search and Add Button */}
        <div className="hidden md:flex items-center space-x-2 w-full md:w-auto">
          {/* Search Input */}
          <Shared_Input
            type="search"
            label="Search"
            placeholder="Search users..."
            className="min-w-62.5"
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {/* Add New User Button */}
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_User_Modal")?.showModal()}
            className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New User
          </Shared_Button>
        </div>

        {/* Mobile Add Button (outside search area) */}
        <div className="md:hidden w-full">
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_User_Modal")?.showModal()}
            className="w-full bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New User
          </Shared_Button>
        </div>

        {/* Mobile Search Input */}
        {showMobileSearch && (
          <div className="w-full md:hidden animate-fadeIn">
            <Shared_Input
              type="search"
              label="Search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={setSearchTerm}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="overflow-x-auto relative mb-16 mt-4 md:mt-0">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            {/* Table Header */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  { label: "User", align: "left" },
                  { label: "Department", align: "left" },
                  { label: "Position", align: "left" },
                  { label: "Role", align: "left" },
                  { label: "Status", align: "center" },
                  { label: "Last Login", align: "center" },
                  { label: "Actions", align: "center" },
                ].map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase ${col.align === "left"
                      ? "text-left"
                      : col.align === "center"
                        ? "text-center"
                        : "text-right"
                      }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loading height="min-h-[400px] md:min-h-[500px]" background_color="bg-white" />
                  </td>
                </tr>
              ) : Users?.length > 0 ? (
                Users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                  >
                    {/* User Info */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                      <div className="flex items-center gap-3 md:gap-4">
                        {/* Avatar */}
                        <div className="shrink-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {getUserInitials(user?.personal?.name)}
                          </div>
                        </div>

                        {/* Name and Email */}
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {user?.personal?.name ?? "N/A"}
                          </h3>
                          <p className="text-gray-500 text-xs truncate">
                            {user?.credentials?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <DeptId_To_Name
                        deptId={user?.employment?.departmentId}
                        compact={true}
                      />
                    </td>

                    {/* Position */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <span className="font-medium text-gray-800">
                        {formatPosition(user?.employment?.position)}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <span className="font-medium text-gray-800">
                        {formatRole(user?.employment?.role)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user?.personal?.status)}`}
                        >
                          {formatStatus(user?.personal?.status)}
                        </span>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-center">
                      <span className="text-gray-600">
                        {user?.credentials?.lastLogin && !isNaN(new Date(user.credentials.lastLogin))
                          ? formatDistanceToNow(new Date(user.credentials.lastLogin), { addSuffix: true })
                          : "Never"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <div className="relative group">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              document.getElementById("View_User_Modal").showModal();
                            }}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="View user"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              View User
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <div className="relative group">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              document.getElementById("Edit_User_Modal").showModal();
                            }}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="Edit user"
                          >
                            <MdEdit className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              Edit User
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="relative group">
                          <button
                            onClick={() => handleDeleteEmployee(user)}
                            disabled={user?.employment?.role?.toLowerCase() === "admin"}
                            className={`flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg
                              ${user?.employment?.role?.toLowerCase() === "admin"
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                              }`}
                            aria-label="Delete user"
                            title={user?.employment?.role?.toLowerCase() === "admin"
                              ? "Admin users cannot be deleted"
                              : "Delete user"
                            }
                          >
                            <FaRegTrashAlt className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          {user?.employment?.role?.toLowerCase() === "admin" && (
                            <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                              <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                                Admin Protected
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FaBoxOpen className="text-gray-400 w-12 h-12" />
                      <p className="text-gray-500 text-lg font-semibold">No Users Found</p>
                      <p className="text-gray-400 text-sm text-center px-4">
                        Adjust your filters or add a new user to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer / Pagination */}
            <Table_Pagination
              colSpan={7}
              totalItems={data?.pagination?.totalItems || 0}
              totalPages={data?.pagination?.totalPages || 1}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <Loading
                height='min-h-[300px]'
                background_color='bg-white'
              />
            </div>
          ) : Users?.length > 0 ? (
            Users.map((user) => (
              <div
                key={user._id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
              >
                {/* User Header */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {getUserInitials(user?.personal?.name)}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {user?.personal?.name ?? "N/A"}
                    </h3>
                    <p className="text-gray-500 text-xs truncate">
                      {user?.credentials?.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <DeptId_To_Name
                      deptId={user?.employment?.departmentId}
                      compact={true}
                      showNameOnly={true}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Position</p>
                    <p className="text-sm font-medium">
                      {formatPosition(user?.employment?.position)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <p className="text-sm font-medium">
                      {formatRole(user?.employment?.role)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(user?.personal?.status)}`}>
                      {formatStatus(user?.personal?.status)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Last Login</p>
                    <p className="text-sm">
                      {user?.credentials?.lastLogin && !isNaN(new Date(user.credentials.lastLogin))
                        ? formatDistanceToNow(new Date(user.credentials.lastLogin), { addSuffix: true })
                        : "Never logged in"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      document.getElementById("View_User_Modal").showModal();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <FaEye className="text-sm" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      document.getElementById("Edit_User_Modal").showModal();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <MdEdit className="text-sm" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(user)}
                    disabled={user?.employment?.role?.toLowerCase() === "admin"}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md
                      ${user?.employment?.role?.toLowerCase() === "admin"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                  >
                    <FaRegTrashAlt className="text-sm" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <FaBoxOpen className="text-gray-400 w-12 h-12 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold mb-2">
                No Users Found
              </p>
              <p className="text-gray-400 text-sm">
                Adjust your filters or add a new user to get started.
              </p>
            </div>
          )}

          {/* Mobile Pagination */}
          {Users?.length > 0 && (
            <div className="mt-6">
              <Table_Pagination
                colSpan={7}
                totalItems={data?.pagination?.totalItems || 0}
                totalPages={data?.pagination?.totalPages || 1}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                mobileView={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Add New User */}
      <dialog id="Add_New_User_Modal" className="modal">
        <Add_New_User_Modal
          session={session}
          RefetchAll={RefetchAll}
          departmentOptionsData={departmentOptionsData || []}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit User */}
      <dialog id="Edit_User_Modal" className="modal">
        <Edit_User_Modal
          session={session}
          RefetchAll={RefetchAll}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          departmentOptionsData={departmentOptionsData || []}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* View User */}
      <dialog id="View_User_Modal" className="modal">
        <View_User_Modal
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmployeesPage;