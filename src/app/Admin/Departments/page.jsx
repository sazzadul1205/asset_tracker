// Admin/AssetsCategory/page.jsx
"use client";

// React Components
import React, { useState } from 'react';

// Next Components
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Icons
import { MdEdit } from 'react-icons/md';
import { FiSearch } from "react-icons/fi";
import { FaAngleLeft, FaAngleRight, FaBoxOpen, FaEye, FaPlus, FaRegTrashAlt } from 'react-icons/fa';

// Tooltip 
import { Tooltip } from "react-tooltip";
import 'react-tooltip/dist/react-tooltip.css';

// Tanstack
import { useQuery } from '@tanstack/react-query';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';

// Shared Modal
import AddDepartmentModal from '@/Shared/Modals/Department/AddDepartmentModal/AddDepartmentModal';
import EditDepartmentModal from '@/Shared/Modals/Department/EditDepartmentModal/EditDepartmentModal';
import ViewDepartmentModal from '@/Shared/Modals/Department/ViewDepartmentModal/ViewDepartmentModal';

// Hooks
import { useToast } from '@/Hooks/Toasts';
import useAxiosPublic from '@/Hooks/useAxiosPublic';
import TableBottomPagination from '@/Shared/TableBottomPagination/TableBottomPagination';

const DepartmentPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();
  const { success, error, confirm } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Pagination States
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Departments
  const {
    data: DepartmentsData,
    error: DepartmentsError,
    refetch: DepartmentsRefetch,
    isLoading: DepartmentsIsLoading,
  } = useQuery({
    queryKey: ["DepartmentsData", currentPage, itemsPerPage, searchTerm],
    queryFn: () =>
      axiosPublic.get(`/Departments`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
        },
      }).then((res) => res.data),
    keepPreviousData: true,
  });

  // Fetch BasicUserInfo
  const {
    data: BasicUserInfoData,
    error: BasicUserInfoError,
    refetch: BasicUserInfoRefetch,
    isLoading: BasicUserInfoIsLoading,
  } = useQuery({
    queryKey: ["BasicUserInfoData"],
    queryFn: () =>
      axiosPublic.get(`/Users/BasicInfo`).then((res) => res.data.data),
    keepPreviousData: true,
  });

  // Destructure Departments Data
  const Departments = DepartmentsData?.data || [];
  const totalItems = DepartmentsData?.total || 0;
  const totalPages = DepartmentsData?.totalPages || 1;

  // Handle loading
  if (BasicUserInfoIsLoading) {
    return <Loading />;
  }

  // Handle errors
  if (BasicUserInfoError || DepartmentsError) {
    return <Error errors={[BasicUserInfoError, DepartmentsError]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    DepartmentsRefetch();
    BasicUserInfoRefetch();
  };

  // Delete Department Handler

  const handleDeleteDepartment = async (department) => {
    if (!department) return;

    const isConfirmed = await confirm(
      "Are you sure?",
      "This action will permanently delete the Department!",
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      const managerId = department?.manager?.employee_id;

      // 1️⃣ Unassign manager properly
      if (managerId) {
        await axiosPublic.put(`/Users/${managerId}`, {
          contact: {
            department: "UnAssigned",
            position: "UnAssigned",
          },
          employment: {
            department: "UnAssigned",
            position: "UnAssigned",
            access_level: "Employee",
            fixed: false,
          },
          updated_at: new Date().toISOString(),
        });
      }

      // 2️⃣ Delete the department
      const res = await axiosPublic.delete(`/Departments/${department._id}`);

      // 3️⃣ Check response
      if (res.status === 200 || res.data.success) {
        RefetchAll?.();
        success("Department deleted successfully!");
      } else {
        error(res.data?.message || "Failed to delete the department.");
      }

    } catch (err) {
      console.error(err);
      error(err?.response?.data?.error || err?.message || "Something went wrong!");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 flex items-center justify-between px-6 py-4 mx-2 mt-4 ">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Departments
          </h3>
        </div>

        {/* Right: Add Button */}
        <div className="flex items-center gap-3" >
          {/* Search Input */}
          <div className="relative w-[400px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Departments..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => { document.getElementById("Add_Department_Modal").showModal() }}
            className=" gap-2 font-semibold text-white  py-2 bg-blue-600 rounded-lg shadow-md 
                     hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
                     active:translate-y-px active:shadow-md"
          >
            <div className='flex items-center w-[230px] justify-between px-5' >
              <FaPlus className="text-sm" />
              Add New Department
            </div>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto relative px-2 mb-16">
        {/* Table */}
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                { label: "Department", align: "left" },
                { label: "Manager", align: "left" },
                { label: "Budget", align: "left" },
                { label: "Created At ", align: "left" },
                { label: "Actions", align: "center" },
              ].map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-xs font-medium text-gray-500 uppercase ${col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {DepartmentsIsLoading || status === "loading" ? (
              // Loading
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
                        style={{ backgroundColor: department.selectedColor || "#e2e8f0" }}
                      >
                        <Image
                          src={department.iconImage || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                          alt={department.department_name}
                          width={32} // 8 * 4 = 32px (matches w-8)
                          height={32} // matches h-8
                          className="object-contain"
                        />
                      </div>

                      {/* Text content */}
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {department.department_name}
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm">
                          {department?.department_description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Depreciation Rate */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {department?.manager?.full_name}
                    <p className='text-xs text-gray-500' >{department?.manager?.email}</p>
                  </td>

                  {/* Warranty */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {Number(department.department_budget).toLocaleString("en-US")} Taka
                  </td>

                  {/* Created At */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {new Date(department.created_at).toLocaleDateString("en-GB", {
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
                        data-tooltip-id={`view-tooltip-${department._id}`}
                        data-tooltip-content="View Department Details"
                        onClick={() => {
                          setSelectedDepartment(department);
                          document.getElementById("View_Department_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {/* Edit */}
                      <button
                        data-tooltip-id={`edit-tooltip-${department._id}`}
                        data-tooltip-content="Edit Department Details"
                        onClick={() => {
                          setSelectedDepartment(department);
                          document.getElementById("Edit_Department_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        data-tooltip-content="Delete Department"
                        data-tooltip-id={`delete-tooltip-${department._id}`}
                        onClick={() => handleDeleteDepartment(department)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                      >
                        <FaRegTrashAlt className="text-sm" />
                      </button>
                    </div>

                    {/* Tooltip components with unique IDs */}
                    <Tooltip id={`view-tooltip-${department._id}`} place="top" effect="solid" />
                    <Tooltip id={`edit-tooltip-${department._id}`} place="top" effect="solid" />
                    <Tooltip id={`delete-tooltip-${department._id}`} place="top" effect="solid" />
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
          <TableBottomPagination
            colSpan={8}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        </table>
      </div>

      {/* Add Department Modal */}
      <dialog id="Add_Department_Modal" className="modal">
        <AddDepartmentModal
          RefetchAll={RefetchAll}
          UserEmail={session?.user?.email}
          BasicUserInfoData={BasicUserInfoData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Department Modal */}
      <dialog id="Edit_Department_Modal" className="modal">
        <EditDepartmentModal
          RefetchAll={RefetchAll}
          UserEmail={session?.user?.email}
          BasicUserInfoData={BasicUserInfoData}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* View Department Modal */}
      <dialog id="View_Department_Modal" className="modal">
        <ViewDepartmentModal
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
