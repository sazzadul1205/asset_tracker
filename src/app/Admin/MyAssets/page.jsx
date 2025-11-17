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
import AddAssetModal from '@/Shared/Modals/Assets/AddAssetModal/AddAssetModal';
import EditAssetModal from '@/Shared/Modals/Assets/EditAssetModal/EditAssetModal';
import ViewAssetModal from '@/Shared/Modals/Assets/ViewAssetModal/ViewAssetModal';

// Hooks
import { useToast } from '@/Hooks/Toasts';
import useAxiosPublic from '@/Hooks/useAxiosPublic';

// Components

const MyAssetsPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();
  const { success, error, confirm } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Pagination States
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Assets
  const {
    data: AssetsData,
    error: AssetsError,
    refetch: AssetsRefetch,
    isLoading: AssetsIsLoading,
  } = useQuery({
    queryKey: ["AssetsData", currentPage, itemsPerPage, searchTerm],
    queryFn: () =>
      axiosPublic.get(`/Assets`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
        },
      }).then((res) => res.data),
    keepPreviousData: true,
  });

  // Handle loading
  if (AssetsIsLoading) { return <Loading /> }

  // Handle errors
  if (AssetsError) { return <Error errors={[AssetsError]} /> }

  // Refetch all
  const RefetchAll = () => {
    AssetsRefetch();
  };

  console.log(AssetsData);

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 flex items-center justify-between px-6 py-4 mx-2 mt-4 ">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            My Assets
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
                { label: "Barcode", align: "center" },
                { label: "Category", align: "left" },
                { label: "Status", align: "left" },
                { label: "Purchase Price", align: "left" },
                { label: "Assigned Date", align: "center" },
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
        </table>
      </div>

    </div>
  );
};

export default MyAssetsPage;