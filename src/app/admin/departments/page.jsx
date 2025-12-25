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
import { FaBoxOpen, FaEye, FaRegTrashAlt } from 'react-icons/fa';

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
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-t flex items-center justify-between px-6 py-4 mx-2 mt-4">

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800">
          Departments
        </h3>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <Shared_Input
            type="search"
            label="Search"
            placeholder="Search users..."
            className="min-w-75"
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {/* Edit Profile */}
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_Department_Modal")?.showModal()}
            className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New Department
          </Shared_Button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto relative px-2 mb-16" >
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
                  className={`px-6 py-4 text-xs font-medium text-gray-500 uppercase ${col.align === "left"
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
                <td colSpan={6} className="py-12 text-center">
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
                  {/* Icon, name, and ID */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <div className="flex items-center gap-4">
                      {/* Icon container */}
                      <div
                        className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
                        style={{ backgroundColor: department?.info?.iconBgColor || "#e2e8f0" }}
                      >
                        <Image
                          src={department?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                          alt={department?.info?.name || "Department Icon"}
                          width={32} // 8 * 4 = 32px (matches w-8)
                          height={32} // matches h-8
                          className="object-contain"
                        />
                      </div>

                      {/* Text content */}
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {department?.info?.name || "Department Name"}
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm">
                          {department?.info?.description || "Department Description"}
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
                    {formatCurrency(department?.stats?.budget?.$numberDecimal, {
                      currency: "USD",
                    })}
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
                      <button
                        onClick={() => {
                          setSelectedDepartment(department);
                          document.getElementById("View_Department_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setSelectedDepartment(department);
                          document.getElementById("Edit_Department_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteDepartment(department)}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                      >
                        <FaRegTrashAlt className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    {/* Icon */}
                    <FaBoxOpen className="text-gray-400 w-12 h-12" />

                    {/* Main message */}
                    <p className="text-gray-500 text-lg font-semibold">
                      No Departments Found
                    </p>

                    {/* Subtext for guidance */}
                    <p className="text-gray-400 text-sm">
                      Adjust your filters or add a new Department.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {/* Table footer with dynamic pagination */}
          <Table_Pagination
            colSpan={8}
            totalItems={data?.pagination?.totalItems || 0}
            totalPages={data?.pagination?.totalPages || 1}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        </table>
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
    </div>
  );
};

export default DepartmentPage;