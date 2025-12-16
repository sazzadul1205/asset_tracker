// arc/app/admin/employees/page.jsx
"use client";

import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { IoMdAdd } from 'react-icons/io';

const EmployeesPage = () => {
  const [search, setSearch] = useState("");

  // Fetch Users
  // const {
  //   data,
  //   isLoading,
  //   isError,
  //   refetch,
  // } = useQuery({
  //   queryKey: ["users", currentPage, itemsPerPage, searchTerm],
  //   queryFn: async () => {
  //     const res = await axiosPublic.get("/users", {
  //       params: {
  //         page: currentPage,
  //         limit: itemsPerPage,
  //         search: searchTerm || undefined,
  //       },
  //     });
  //     return res.data;
  //   },
  //   keepPreviousData: true,
  // });

  // Derived values (safe)
  // const users = data?.data || [];
  // const pagination = data?.pagination || {};

  // if (isLoading) return <span>Loading...</span>;
  // if (isError) return <span>Error</span>;


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
            value={search}
            onChange={setSearch}
          />

          {/* Edit Profile */}
          <Shared_Button
            variant="primary"
            // onClick={() => document.getElementById("Edit_My_Profile_Modal")?.showModal()}
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
    </div>
  );
};

export default EmployeesPage;