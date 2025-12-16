// src/app/admin/departments/page.jsx
"use client";

import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import React, { useState } from 'react';
import { IoMdAdd } from "react-icons/io";

const DepartmentPage = () => {
  const [search, setSearch] = useState("");
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
            Add New Department
          </Shared_Button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto relative px-2 mb-16" >

      </div>

      {/* View Department Modal */}
      <dialog id="Add_Department_Modal" className="modal">
        {/* <Add_Department_Modal /> */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default DepartmentPage;