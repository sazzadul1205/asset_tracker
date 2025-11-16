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
import AddAssetModal from '@/Shared/Modals/Assets/AddAssetModal/AddAssetModal';
import EditEmployeeModal from '@/Shared/Modals/Employees/EditEmployeeModal/EditEmployeeModal';
import ViewEmployeeModal from '@/Shared/Modals/Employees/ViewEmployeeModal/ViewEmployeeModal';

// Hooks
import { useToast } from '@/Hooks/Toasts';
import useAxiosPublic from '@/Hooks/useAxiosPublic';

const AssetsPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();
  const { success, error, confirm } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch AssetCategory 
  const {
    data: AssetCategoryOptionData,
    error: AssetCategoryOptionError,
    refetch: AssetCategoryOptionRefetch,
    isLoading: AssetCategoryOptionIsLoading,
  } = useQuery({
    queryKey: ["AssetCategoryOptionData"],
    queryFn: () =>
      axiosPublic.get(`/AssetCategory/Options`).then((res) => res.data.data),
    keepPreviousData: true,
  });


  // Handle loading
  if (AssetCategoryOptionIsLoading) {
    return <Loading />;
  }

  // Handle errors
  if (AssetCategoryOptionError) {
    return <Error errors={[AssetCategoryOptionError]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    AssetCategoryOptionRefetch();
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 flex items-center justify-between px-6 py-4 mx-2 mt-4 ">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Assets
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
              placeholder="Search Asset..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => { document.getElementById("Add_Asset_Modal").showModal() }}
            className=" gap-2 font-semibold text-white  py-2 bg-blue-600 rounded-lg shadow-md 
                     hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
                     active:translate-y-px active:shadow-md"
          >
            <div className='flex items-center w-44 justify-between px-5' >
              <FaPlus className="text-sm" />
              Add New Asset
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
                { label: "Assets", align: "left" },
                { label: "Barcode", align: "left" },
                { label: "Category", align: "left" },
                { label: "Assigned To", align: "left" },
                { label: "Status", align: "center" },
                { label: "Purchase Price", align: "center" },
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
        </table>
      </div>


      {/* Add Asset Modal */}
      <dialog id="Add_Asset_Modal" className="modal">
        <AddAssetModal
          // RefetchAll={RefetchAll}
          UserEmail={session?.user?.email}
          AssetCategoryOptionData={AssetCategoryOptionData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default AssetsPage;