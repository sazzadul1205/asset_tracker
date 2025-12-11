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
import UserDepartmentView from '@/Shared/TableExtension/UserDepartmentView';

// Shared Modal
import AddEmployeeModal from '@/Shared/Modals/Employees/AddEmployeeModal/AddEmployeeModal';
import EditEmployeeModal from '@/Shared/Modals/Employees/EditEmployeeModal/EditEmployeeModal';
import ViewEmployeeModal from '@/Shared/Modals/Employees/ViewEmployeeModal/ViewEmployeeModal';

// Hooks
import { useToast } from '@/Hooks/Toasts';
import useAxiosPublic from '@/Hooks/useAxiosPublic';
import TableBottomPagination from '@/Shared/TableBottomPagination/TableBottomPagination';

const EmployeesPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();
  const { success, error, confirm } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination States
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch AllUsers
  const {
    data: AllUsersData,
    error: AllUsersError,
    refetch: AllUsersRefetch,
    isLoading: AllUsersIsLoading,
  } = useQuery({
    queryKey: ["AllUsersData", currentPage, itemsPerPage, searchTerm],
    queryFn: () =>
      axiosPublic.get(`/Users`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
        },
      }).then((res) => res.data),
    keepPreviousData: true,
  });

  // Fetch Departments Basic Info
  const {
    data: DepartmentsBasicInfoData,
    error: DepartmentsBasicInfoError,
    refetch: DepartmentsBasicInfoRefetch,
    isLoading: DepartmentsBasicInfoIsLoading,
  } = useQuery({
    queryKey: ["DepartmentsBasicInfoData"],
    queryFn: () =>
      axiosPublic.get(`/Departments/BasicInfo`).then((res) => res.data.data),
    keepPreviousData: true,
  });

  // Destructure AllUsers data
  const Users = AllUsersData?.data || [];
  const totalItems = AllUsersData?.total || 0;
  const totalPages = AllUsersData?.totalPages || 1;

  // Handle loading
  if (DepartmentsBasicInfoIsLoading) {
    return <Loading />;
  }

  // Handle errors
  if (AllUsersError || DepartmentsBasicInfoError) {
    return <Error errors={[AllUsersError, DepartmentsBasicInfoError]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    AllUsersRefetch();
    DepartmentsBasicInfoRefetch();
  };

  // Delete Employee Handler
  const handleDeleteEmployee = async (employee) => {
    const isConfirmed = await confirm(
      "Are you sure?",
      "This action will permanently delete the Employee!",
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      // 1) Delete the Employee
      const res = await axiosPublic.delete(`/Users/${employee.employee_id}`);

      // 2) Check response
      if (res.status === 200) {
        RefetchAll?.();
        success("Employee deleted successfully!");
      } else {
        error("Failed to delete the Employee.");
      }

    } catch (err) {
      console.error(err);
      error(err?.response?.data?.error || "Something went wrong!");
    }
  };


  console.log("AllUsersData", AllUsersData);


  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 flex items-center justify-between px-6 py-4 mx-2 mt-4 ">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Employees
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
              placeholder="Search Employee..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => { document.getElementById("Add_Employee_Modal").showModal() }}
            className=" gap-2 font-semibold text-white  py-2 bg-blue-600 rounded-lg shadow-md 
                     hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
                     active:translate-y-px active:shadow-md"
          >
            <div className='flex items-center w-52 justify-between px-5' >
              <FaPlus className="text-sm" />
              Add New Employee
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
                { label: "Users", align: "left" },
                { label: "Department", align: "left" },
                { label: "Position", align: "left" },
                { label: "Role", align: "left" },
                { label: "Status", align: "center" },
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
            {AllUsersIsLoading || status === "loading" ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loading height="min-h-[500px]" background_color="bg-white" />
                </td>
              </tr>
            ) : Users?.length > 0 ? (
              Users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                >
                  {/* Icon, name, and email */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                    <div className="flex items-center gap-4">
                      <div
                        className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold"
                        style={{ backgroundColor: user?.selectedColor || "#e2e8f0" }}
                      >
                        {user?.profile_image ? (
                          <Image
                            src={user?.profile_image}
                            alt={user?.identity?.full_name}
                            width={32}
                            height={32}
                            className="object-contain rounded-full"
                          />
                        ) : (
                          <span>
                            {user?.identity?.full_name
                              ?.trim()
                              ?.split(" ")
                              ?.map((w) => w[0])
                              ?.join("")
                              ?.substring(0, 2)
                              ?.toUpperCase() || "NA"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {user?.identity?.full_name}
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm">
                          {user?.identity?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm">
                    {user?.contact?.department}
                  </td>

                  {/* Position */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm">
                    {user?.contact?.position}
                  </td>

                  {/* Role / Access Level */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm">
                    {user?.employment?.access_level
                      ?.charAt(0)
                      .toUpperCase() + user?.employment?.access_level?.slice(1)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`inline-flex items-center justify-center w-24 py-1 rounded-xl text-sm font-semibold
                        ${user?.employment?.status === "active" ? "bg-green-100 text-green-700" : ""}
                      ${user?.employment?.status === "inactive" ? "bg-gray-200 text-gray-700" : ""}
                      ${user?.employment?.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                      ${user?.employment?.status === "archived" ? "bg-red-100 text-red-700" : ""}`}
                    >
                      {user?.employment?.status
                        ?.charAt(0)
                        .toUpperCase() + user?.employment?.status?.slice(1)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* View */}
                      <button
                        onClick={() => {
                          setSelectedEmployee(user);
                          document.getElementById("View_Employee_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setSelectedEmployee(user);
                          document.getElementById("Edit_Employee_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteEmployee(user)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
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
                    <FaBoxOpen className="text-gray-400 w-12 h-12" />
                    <p className="text-gray-500 text-lg font-semibold">No employees found</p>
                    <p className="text-gray-400 text-sm">
                      Adjust your filters or add a new employee to get started.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {/* Table footer with dynamic pagination */}
          <TableBottomPagination
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        </table>
      </div>

      {/* Add Employee Modal */}
      <dialog id="Add_Employee_Modal" className="modal">
        <AddEmployeeModal
          RefetchAll={RefetchAll}
          UserEmail={session?.user?.email}
          DepartmentsBasicInfoData={DepartmentsBasicInfoData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Employee Modal */}
      <dialog id="Edit_Employee_Modal" className="modal">
        <EditEmployeeModal
          RefetchAll={RefetchAll}
          UserEmail={session?.user?.email}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          DepartmentsBasicInfoData={DepartmentsBasicInfoData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* View Employee Modal */}
      <dialog id="View_Employee_Modal" className="modal">
        <ViewEmployeeModal
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default EmployeesPage;