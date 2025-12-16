// arc/app/admin/employees/page.jsx
"use client";

import useAxiosPublic from '@/hooks/useAxiosPublic';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { IoMdAdd } from 'react-icons/io';
import Add_New_User_Modal from './Add_New_User_Modal/Add_New_User_Modal';
import Loading from '@/Shared/Loading/Loading';
import Error from '@/Shared/Error/Error';

const EmployeesPage = () => {
  const axiosPublic = useAxiosPublic();

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


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

  const users = data?.data || [];
  const pagination = data?.pagination || {};


  // Handle loading
  if (isLoading)
    return <Loading
      message="Loading Users..."
      subText="Please wait while we fetch users data."
    />;

  // Handle errors
  if (isError) return <Error errors={[MyUserError]} />;

  console.log(data);

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
      <div className="overflow-x-auto relative px-2 mb-16" >
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


        </table>
      </div>

      {/* Add New User */}
      <dialog id="Add_New_User_Modal" className="modal">
        <Add_New_User_Modal />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div >
  );
};

export default EmployeesPage;