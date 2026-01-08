// src/app/admin/myAssets/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Next Components
import { useSession } from 'next-auth/react';

// Icons
import { FaBoxOpen, FaEye } from 'react-icons/fa';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Table_Pagination from '@/Shared/Table_Pagination/Table_Pagination';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Utils
import formatCurrency from '@/Utils/formatCurrency';
import { formatStatusText, getStatusColor } from '@/Utils/formatStatus';

// Components
import SerialNumber_To_Barcode from '../assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode';
import CategoryId_To_CategoryBlock from '../assets/CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock';

// Modals
import View_Asset_Modal from '../assets/View_Asset_Modal/View_Asset_Modal';

// Format date
const formatDate = (date) =>
  date && !isNaN(new Date(date))
    ? new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "N/A";

const MyAssetsPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // State variables -> Assets
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // State Variable -> Selected Asset
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Fetch Assets
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "AllAssets",
      currentPage,
      itemsPerPage,
      searchTerm,
      session?.user?.userId,
    ],
    queryFn: async () => {
      const res = await axiosPublic.get("/assets", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          assignedTo: session?.user?.userId || undefined,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  // Destructure AllAssets data
  const Assets = data?.data || [];

  // Handle loading
  if (status === "loading")
    return <Loading
      message="Loading Assets..."
      subText="Please wait while we fetch Assets data."
    />;

  // Handle errors
  if (isError) return <Error
    errors={data?.errors || []} />;

  // console.log(Assets);
  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-t flex items-center justify-between px-6 py-4 mx-2 mt-4">

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800">
          My Assets
        </h3>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <Shared_Input
            type="search"
            label="Search"
            placeholder="Search Assets..."
            className="min-w-75"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto relative px-2 mb-16" >
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                { label: "Asset", align: "left" },
                { label: "Barcode", align: "center" },
                { label: "Category", align: "left" },
                { label: "Status", align: "left" },
                { label: "Purchase Price", align: "left" },
                { label: "Assigned Date", align: "left" },
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
                <td colSpan={6} className="py-12 text-center">
                  <Loading
                    height='min-h-[500px]'
                    background_color='bg-white'
                  />
                </td>
              </tr>
            ) : Assets?.length > 0 ? (
              Assets.map((asset) => (
                <tr
                  key={asset._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                >
                  {/* Icon, name, and ID */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <CategoryId_To_CategoryBlock
                        categoryId={asset?.identification?.categoryId}
                      />

                      {/* Text content */}
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {asset?.identification?.name || "Department Name"}
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm">
                          {asset?.identification?.tag || "Department Description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Serial Number (Barcode) */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-center">
                    <SerialNumber_To_Barcode
                      serialNumber={asset?.details?.serialNumber}
                    />
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <CategoryId_To_CategoryBlock
                      categoryId={asset?.identification?.categoryId}
                      view="name"
                    />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-center cursor-default">
                    {asset?.details?.status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(asset.details.status)}`}>
                        {formatStatusText(asset?.details?.status)}
                      </span>
                    )}
                  </td>

                  {/* Purchase Price */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-center cursor-default">
                    {formatCurrency(asset?.purchase?.cost?.$numberDecimal, {
                      currency: "USD",
                    })}
                  </td>

                  {/* Assigned At */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {asset?.assigned?.assignedAt
                      ? formatDate(asset?.assigned?.assignedAt)
                      : "-"}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* View */}
                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          document.getElementById("View_Asset_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                    </div>
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
                      No Assets Found
                    </p>

                    {/* Subtext for guidance */}
                    <p className="text-gray-400 text-sm">
                      Adjust your filters or you don&apos;t have any assets assigned to you yet.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {/* Table footer with dynamic pagination */}
          <Table_Pagination
            colSpan={8}
            totalItems={data?.pagination?.totalItems || 0}
            totalPages={data?.pagination?.totalPages || 1}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        </table>
      </div>

      {/* View Asset Modal */}
      <dialog id="View_Asset_Modal" className="modal">
        <View_Asset_Modal
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default MyAssetsPage;