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
import AddAssetCategoryModal from '@/Shared/Modals/AssetCategory/AddAssetCategoryModal/AddAssetCategoryModal';
import ViewAssetCategoryModal from '@/Shared/Modals/AssetCategory/ViewAssetCategoryModal/ViewAssetCategoryModal';
import EditAssetCategoryModal from '@/Shared/Modals/AssetCategory/EditAssetCategoryModal/EditAssetCategoryModal';

// Hooks
import { useToast } from '@/Hooks/Toasts';
import useAxiosPublic from '@/Hooks/useAxiosPublic';
import AddEmployeeModal from '@/Shared/Modals/Employees/AddEmployeeModal/AddEmployeeModal';

const EmployeesPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();
  const { success, error, confirm } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  // Destructure AllUsers data
  const Users = AllUsersData?.data || [];
  const totalItems = AllUsersData?.total || 0;
  const totalPages = AllUsersData?.totalPages || 1;

  // Handle errors
  if (AllUsersError) {
    return <Error errors={[AllUsersError]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    AllUsersRefetch();
  };

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
                  className={`px-6 py-4 text-xs font-medium text-gray-500 uppercase ${col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {AllUsersIsLoading || status === "loading" ? (
              // Loading
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loading
                    height='min-h-[500px]'
                    background_color='bg-white'
                  />
                </td>
              </tr>
            ) : Users?.length > 0 ? (
              Users.map((users) => (
                <tr
                  key={users._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                >
                  {/* Icon, name, and ID */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <div className="flex items-center gap-4">
                      {/* Icon container */}
                      <div
                        className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-300 text-gray-800 font-bold text-lg"
                        style={{ backgroundColor: users.selectedColor || "#e2e8f0" }}
                      >
                        {users.profile_image ? (
                          <Image
                            src={users.profile_image}
                            alt={users.full_name}
                            width={32}
                            height={32}
                            className="object-contain rounded-full"
                          />
                        ) : (
                          <span>
                            {users.full_name
                              ?.trim()
                              ?.split(" ")
                              ?.map((w) => w[0])
                              ?.join("")
                              ?.substring(0, 2)
                              ?.toUpperCase() || "NA"}
                          </span>
                        )}
                      </div>

                      {/* Text content */}
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {users.full_name}
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm">
                          {users?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {users.department}
                  </td>

                  {/* Position */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {users.position}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {users.access_level?.charAt(0).toUpperCase() + users.access_level?.slice(1)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-center cursor-default">
                    <span
                      className={`
                          inline-flex items-center justify-center w-24 py-1 rounded-xl text-sm font-semibold
                          ${users.status === "active" ? "bg-green-100 text-green-700" : ""}
                          ${users.status === "inactive" ? "bg-gray-200 text-gray-700" : ""}
                          ${users.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${users.status === "archived" ? "bg-red-100 text-red-700" : ""}
                          `}
                    >
                      {users.status?.charAt(0).toUpperCase() + users.status?.slice(1)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    {/* Buttons container */}
                    <div className="flex items-center justify-center gap-3">
                      {/* View */}
                      <button
                        data-tooltip-id={`view-tooltip-${users._id}`}
                        data-tooltip-content="View Employee Details"
                        onClick={() => {
                          setSelectedCategory(users);
                          document.getElementById("View_Asset_Category_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {/* Edit */}
                      <button
                        data-tooltip-id={`edit-tooltip-${users._id}`}
                        data-tooltip-content="Edit Employee Details"
                        onClick={() => {
                          setSelectedCategory(users);
                          document.getElementById("Edit_Asset_Category_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        data-tooltip-content="Delete Employee"
                        data-tooltip-id={`delete-tooltip-${users._id}`}
                        onClick={() => handleDeleteCategory(users._id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                      >
                        <FaRegTrashAlt className="text-sm" />
                      </button>
                    </div>

                    {/* Tooltip components with unique IDs */}
                    <Tooltip id={`view-tooltip-${users._id}`} place="top" effect="solid" />
                    <Tooltip id={`edit-tooltip-${users._id}`} place="top" effect="solid" />
                    <Tooltip id={`delete-tooltip-${users._id}`} place="top" effect="solid" />
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
                      No employees found
                    </p>

                    {/* Subtext for guidance */}
                    <p className="text-gray-400 text-sm">
                      Adjust your filters or add a new employee to get started.
                    </p>
                  </div>
                </td>
              </tr>

            )}
          </tbody>

          {/* Table footer with dynamic pagination */}
          <tfoot>
            <tr>
              <td colSpan={6} className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-black">
                  <div>
                    <p className="text-sm">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">Employees</p>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-end space-x-2 mt-4">
                    {/* Previous Button */}
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm transition ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <FaAngleLeft /> Prev
                    </button>

                    {/* Page Number Display */}
                    <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 font-medium">
                      Page {currentPage} of {totalPages}
                    </div>

                    {/* Next Button */}
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm transition ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next <FaAngleRight />
                    </button>
                  </div>

                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Employee Modal */}
      <dialog id="Add_Employee_Modal" className="modal">
        <AddEmployeeModal
          UserEmail={session?.user?.email}
          RefetchAll={RefetchAll}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Employee Modal */}
      <dialog id="Edit_Employee_Modal" className="modal">
        <EditEmployeeModal
          UserEmail={session?.user?.email}
          RefetchAll={RefetchAll}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default EmployeesPage;