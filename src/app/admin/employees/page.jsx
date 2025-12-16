// arc/app/admin/employees/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Table_Pagination from '@/Shared/Table_Pagination/Table_Pagination';

// Icons
import { IoMdAdd } from 'react-icons/io';

// Modal
import Add_New_User_Modal from './Add_New_User_Modal/Add_New_User_Modal';

// Icons
import { MdEdit } from 'react-icons/md';
import { FaBoxOpen, FaEye, FaRegTrashAlt } from 'react-icons/fa';

// Date Fns
import { formatDistanceToNow } from 'date-fns';
import Edit_User_Modal from './Edit_User_Modal/Edit_User_Modal';
import View_User_Modal from './View_User_Modal/View_User_Modal';


const EmployeesPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // State variables -> Users
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

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

  // Destructure AllUsers data
  const Users = data?.data || [];

  // Handle loading
  if (isLoading || status === "loading")
    return <Loading
      message="Loading Users..."
      subText="Please wait while we fetch users data."
    />;

  // Handle errors
  if (isError) return <Error errors={[MyUserError]} />;

  // Refetch all
  const RefetchAll = () => {
    refetch();
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-t flex items-center justify-between px-6 py-4 mx-2 mt-4">

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800">
          Users
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
            onClick={() => document.getElementById("Add_New_User_Modal")?.showModal()}
            className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New User
          </Shared_Button>
        </div>
      </div>

      {/* Content */}

      <div className="overflow-x-auto relative px-2 mb-16">
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
                { label: "Last Login", align: "center" },
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
                <td colSpan={8} className="py-12 text-center">
                  <Loading height="min-h-[500px]" background_color="bg-white" />
                </td>
              </tr>
            ) : Users?.length > 0 ? (
              Users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                >
                  {/* Icon, Name, and Email */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                    <div className="flex items-center gap-4">

                      {/* Icon */}
                      <div className="shrink-0 w-12 h-12 flex items-center bg-gray-200 
                      justify-center rounded-full text-lg font-bold">
                        <span>
                          {user?.personal?.name
                            ?.trim()
                            ?.split(" ")
                            ?.map((w) => w[0])
                            ?.join("")
                            ?.substring(0, 2)
                            ?.toUpperCase() || "NA"}
                        </span>
                      </div>

                      {/* Name and Email */}
                      <div className="flex flex-col">
                        {/* Name */}
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {user?.personal?.name}
                        </h3>

                        {/* Email */}
                        <p className="text-gray-500 text-xs md:text-sm">
                          {user?.credentials?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm">
                    {user?.employment?.departmentId || "N/A"}
                  </td>

                  {/* Position */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm">
                    {user?.employment?.position || "N/A"}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm">
                    {user?.employment?.role
                      ? user?.employment?.role.charAt(0).toUpperCase() +
                      user?.employment?.role.slice(1)
                      : "N/A"}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`inline-flex items-center justify-center w-24 py-1 rounded-xl text-sm font-semibold
                        ${user?.personal?.status === "active" ? "bg-green-100 text-green-700" : ""}
                      ${user?.personal?.status === "inactive" ? "bg-gray-200 text-gray-700" : ""}
                      ${user?.personal?.status === "on_leave" ? "bg-yellow-100 text-yellow-700" : ""}
                      ${user?.personal?.status === "suspended" ? "bg-red-100 text-red-700" : ""}
                      `}
                    >
                      {user?.personal?.status
                        ? user.personal.status.charAt(0).toUpperCase() + user.personal.status.slice(1)
                        : "N/A"}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-center">
                    {user?.credentials?.lastLogin && !isNaN(new Date(user.credentials.lastLogin))
                      ? formatDistanceToNow(new Date(user.credentials.lastLogin), { addSuffix: true })
                      : "Never"}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* View */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          document.getElementById("View_User_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          document.getElementById("Edit_User_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <MdEdit
                          className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteEmployee(user)}
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
                <td colSpan={8} className="py-12 text-center">
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


      {/* Add New User */}
      <dialog id="Add_New_User_Modal" className="modal">
        <Add_New_User_Modal RefetchAll={RefetchAll} session={session} />
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
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* View User */}
      <dialog id="View_User_Modal" className="modal">
        <View_User_Modal selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default EmployeesPage;