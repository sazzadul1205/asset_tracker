// src/app/admin/departments/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Next Components
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';

// Icons
import { IoMdAdd } from "react-icons/io";
import { MdEdit } from 'react-icons/md';
import { FaBoxOpen, FaEye, FaRegTrashAlt, FaSearch, FaBuilding, FaDollarSign, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Table_Pagination from '@/Shared/Table_Pagination/Table_Pagination';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Utils
import formatCurrency from "@/Utils/formatCurrency";

// Components
import UserId_To_Name from './UserId_To_Name/UserId_To_Name';

// Modals
import Edit_Department_Modal from './Edit_Department_Modal/Edit_Department_Modal';
import View_Department_Modal from './View_Department_Modal/View_Department_Modal';
import Add_New_Department_Modal from './Add_New_Department_Modal/Add_New_Department_Modal';

const DepartmentPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // Toast
  const { success, error, confirm } = useToast();

  // State variables -> Departments
  const [itemsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // State Variable -> Selected Department
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Fetch Department
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["department", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const res = await axiosPublic.get("/department", {
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

  // Get User Options
  const {
    data: managerOptionsData,
    isLoading: managerLoading,
    isError: managerIsError,
    refetch: managerRefetch
  } = useQuery({
    queryKey: ["userOptions", "exclude-manager-admin"],
    queryFn: async () =>
      axiosPublic
        .get("/users/UserOptions", {
          params: {
            excludeRole: "manager,admin",
          },
        })
        .then((res) => res.data.data),
  });


  // Destructure AllDepartments data
  const Departments = data?.data || [];

  // Handle loading
  if (status === "loading" || managerLoading)
    return <Loading
      message="Loading Departments..."
      subText="Please wait while we fetch departments data."
    />;

  // Handle errors
  if (isError || managerIsError) return <Error errors={data?.errors || managerOptionsData?.errors || []} />;

  // Refetch all
  const RefetchAll = () => {
    refetch();
    managerRefetch();
  };

  // Delete user (improved & safe)
  const handleDeleteDepartment = async (department) => {
    if (!department?.departmentId) {
      error("Invalid Department", "Department ID not found");
      return;
    }

    // Confirm dialog
    const isConfirmed = await confirm(
      "Delete Department?",
      `This will permanently delete ${department?.info?.name}.`,
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      await axiosPublic.delete(`/department/${department?.departmentId}`);

      success(
        "Department Deleted",
        `${department?.info?.name} has been removed successfully`
      );

      refetch();
    } catch (err) {
      console.error("Delete Department error:", err);

      error(
        "Delete Failed",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  };

  // Helper to get initials
  const getDepartmentInitials = (name) => {
    if (!name) return "NA";
    return name.trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="p-2 md:p-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-t-lg flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 md:py-4 md:mx-0 mt-2 md:mt-4 space-y-4 md:space-y-0">
        {/* Title and Mobile Search Toggle */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Departments
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
            placeholder="Search departments..."
            className="min-w-62.5"
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {/* Add New Department Button */}
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_Department_Modal")?.showModal()}
            className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New Department
          </Shared_Button>
        </div>

        {/* Mobile Add Button (outside search area) */}
        <div className="md:hidden w-full">
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_Department_Modal")?.showModal()}
            className="w-full bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New Department
          </Shared_Button>
        </div>

        {/* Mobile Search Input */}
        {showMobileSearch && (
          <div className="w-full md:hidden animate-fadeIn">
            <Shared_Input
              type="search"
              label="Search"
              placeholder="Search departments..."
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
                  { label: "Department", align: "left" },
                  { label: "Manager", align: "left" },
                  { label: "Budget", align: "left" },
                  { label: "Created At", align: "left" },
                  { label: "Action", align: "center" },
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
                  <td colSpan={5} className="py-12 text-center">
                    <Loading
                      height='min-h-[500px]'
                      background_color='bg-white'
                    />
                  </td>
                </tr>
              ) : Departments?.length > 0 ? (
                Departments.map((department) => (
                  <tr
                    key={department._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                  >
                    {/* Department Info */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                      <div className="flex items-center gap-4">
                        {/* Icon container */}
                        <div
                          className="shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg"
                          style={{ backgroundColor: department?.info?.iconBgColor || "#e2e8f0" }}
                        >
                          <Image
                            src={department?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                            alt={department?.info?.name || "Department Icon"}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </div>

                        {/* Text content */}
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {department?.info?.name || "Department Name"}
                          </h3>
                          <p className="text-gray-500 text-xs truncate">
                            {department?.info?.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Manager */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                      <UserId_To_Name userId={department?.manager?.userId} />
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                      <span className="font-medium text-gray-800">
                        {formatCurrency(department?.stats?.budget?.$numberDecimal, {
                          currency: "USD",
                        })}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                      {new Date(department?.metadata?.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* View */}
                        <div className="relative group">
                          <button
                            onClick={() => {
                              setSelectedDepartment(department);
                              document.getElementById("View_Department_Modal").showModal();
                            }}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="View department"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              View Department
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>

                        {/* Edit */}
                        <div className="relative group">
                          <button
                            onClick={() => {
                              setSelectedDepartment(department);
                              document.getElementById("Edit_Department_Modal").showModal();
                            }}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="Edit department"
                          >
                            <MdEdit className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              Edit Department
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>

                        {/* Delete */}
                        <div className="relative group">
                          <button
                            onClick={() => handleDeleteDepartment(department)}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-red-600 text-white hover:bg-red-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="Delete department"
                          >
                            <FaRegTrashAlt className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              Delete Department
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      {/* Icon */}
                      <FaBoxOpen className="text-gray-400 w-12 h-12" />

                      {/* Main message */}
                      <p className="text-gray-500 text-lg font-semibold">
                        No Departments Found
                      </p>

                      {/* Subtext for guidance */}
                      <p className="text-gray-400 text-sm text-center px-4">
                        Adjust your filters or add a new Department.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table footer with dynamic pagination */}
            <Table_Pagination
              colSpan={5}
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
          ) : Departments?.length > 0 ? (
            Departments.map((department) => (
              <div
                key={department._id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
              >
                {/* Department Header */}
                <div className="flex items-center gap-3">
                  {/* Icon container */}
                  <div
                    className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: department?.info?.iconBgColor || "#e2e8f0" }}
                  >
                    <Image
                      src={department?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                      alt={department?.info?.name || "Department Icon"}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>

                  {/* Name and Description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {department?.info?.name || "Department Name"}
                    </h3>
                    <p className="text-gray-500 text-xs truncate">
                      {department?.info?.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Department Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FaUserTie className="text-gray-400 w-4 h-4" />
                      <p className="text-xs text-gray-500">Manager</p>
                    </div>
                    <div className="ml-6">
                      <UserId_To_Name
                        userId={department?.manager?.userId}
                        showIcon={false}
                        className="text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-gray-400 w-4 h-4" />
                      <p className="text-xs text-gray-500">Budget</p>
                    </div>
                    <p className="text-sm font-medium ml-6">
                      {formatCurrency(department?.stats?.budget?.$numberDecimal, {
                        currency: "USD",
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400 w-4 h-4" />
                      <p className="text-xs text-gray-500">Created</p>
                    </div>
                    <p className="text-sm ml-6">
                      {new Date(department?.metadata?.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FaBuilding className="text-gray-400 w-4 h-4" />
                      <p className="text-xs text-gray-500">Status</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ml-6 ${department?.info?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {department?.info?.status?.charAt(0).toUpperCase() + department?.info?.status?.slice(1) || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedDepartment(department);
                      document.getElementById("View_Department_Modal").showModal();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <FaEye className="text-sm" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDepartment(department);
                      document.getElementById("Edit_Department_Modal").showModal();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <MdEdit className="text-sm" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(department)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
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
                No Departments Found
              </p>
              <p className="text-gray-400 text-sm">
                Adjust your filters or add a new department to get started.
              </p>
            </div>
          )}

          {/* Mobile Pagination */}
          {Departments?.length > 0 && (
            <div className="mt-6">
              <Table_Pagination
                colSpan={5}
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

      {/* Add New Department Modal */}
      <dialog id="Add_New_Department_Modal" className="modal">
        <Add_New_Department_Modal
          session={session}
          RefetchAll={RefetchAll}
          managerOptionsData={managerOptionsData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Department Modal */}
      <dialog id="Edit_Department_Modal" className="modal">
        <Edit_Department_Modal
          session={session}
          RefetchAll={RefetchAll}
          managerOptionsData={managerOptionsData}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* View Department Modal */}
      <dialog id="View_Department_Modal" className="modal">
        <View_Department_Modal
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
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

export default DepartmentPage;