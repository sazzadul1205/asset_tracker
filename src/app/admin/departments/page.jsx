// src/app/admin/departments/page.jsx
"use client";

import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import React, { useState } from 'react';
import { IoMdAdd } from "react-icons/io";
import Add_New_Department_Modal from './Add_New_Department_Modal/Add_New_Department_Modal';
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import useAxiosPublic from '@/hooks/useAxiosPublic';

const DepartmentPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // Toast
  const { success, error, confirm } = useToast();

  // State variables -> Departments
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

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

  // Destructure AllDepartments data
  const Departments = data?.data || [];

  // Handle loading
  if (isLoading || status === "loading")
    return <Loading
      message="Loading Departments..."
      subText="Please wait while we fetch departments data."
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

      </div>

      {/* Add New Department Modal */}
      <dialog id="Add_New_Department_Modal" className="modal">
        <Add_New_Department_Modal Refetch={RefetchAll} session={session} />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Department Modal */}
      <dialog id="Edit_Department_Modal" className="modal">
        {/* <Edit_Department_Modal /> */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* View Department Modal */}
      <dialog id="View_Department_Modal" className="modal">
        {/* <View_Department_Modal /> */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default DepartmentPage;