// src/app/employee/myAssets/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Next Components
import { useSession } from 'next-auth/react';

// Icons
import { FaBoxOpen, FaEye, FaSearch } from 'react-icons/fa';

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
import SerialNumber_To_Barcode from '@/app/admin/assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode';
import CategoryId_To_CategoryBlock from '@/app/admin/assets/CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock';

// Modals
import View_Asset_Modal from '@/app/admin/assets/View_Asset_Modal/View_Asset_Modal';


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
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
    <div className="p-2 md:p-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-t-lg flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 md:py-4 md:mx-0 mt-2 md:mt-4 space-y-4 md:space-y-0">
        {/* Title */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            My Assets
          </h3>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle search"
          >
            <FaSearch className="text-gray-600 w-5 h-5" />
          </button>
        </div>

        {/* Search Input - Desktop */}
        <div className="hidden md:flex items-center space-x-2 w-full md:w-auto">
          <Shared_Input
            type="search"
            label="Search"
            placeholder="Search Assets..."
            className="min-w-62.5"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        {/* Search Input - Mobile */}
        {showMobileSearch && (
          <div className="w-full md:hidden animate-fadeIn">
            <Shared_Input
              type="search"
              label="Search"
              placeholder="Search Assets..."
              value={searchTerm}
              onChange={setSearchTerm}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="overflow-x-auto relative mb-16 mt-4 md:mt-0">
        {/* Desktop Table */}
        <div className="hidden md:block">
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
                    className={`px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase ${col.align === "left"
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
                  <td colSpan={7} className="py-12 text-center">
                    <Loading
                      height='min-h-[400px] md:min-h-[500px]'
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
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                      <div className="flex items-center gap-3 md:gap-4">
                        {/* Icon */}
                        <div className="shrink-0">
                          <CategoryId_To_CategoryBlock
                            categoryId={asset?.identification?.categoryId}
                          />
                        </div>

                        {/* Text content */}
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {asset?.identification?.name || "Department Name"}
                          </h3>
                          <p className="text-gray-500 text-xs truncate">
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
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                      <CategoryId_To_CategoryBlock
                        categoryId={asset?.identification?.categoryId}
                        view="name"
                      />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {asset?.details?.status && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(asset.details.status)}`}>
                          {formatStatusText(asset?.details?.status)}
                        </span>
                      )}
                    </td>

                    {/* Purchase Price */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {formatCurrency(asset?.purchase?.cost?.$numberDecimal, {
                        currency: "USD",
                      })}
                    </td>

                    {/* Assigned At */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {asset?.assigned?.assignedAt
                        ? formatDate(asset?.assigned?.assignedAt)
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View */}
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            document.getElementById("View_Asset_Modal").showModal();
                          }}
                          className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                          aria-label="View asset"
                        >
                          <FaEye className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FaBoxOpen className="text-gray-400 w-12 h-12" />
                      <p className="text-gray-500 text-lg font-semibold">
                        No Assets Found
                      </p>
                      <p className="text-gray-400 text-sm text-center px-4">
                        Adjust your filters or you don&apos;t have any assets assigned to you yet.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table footer with dynamic pagination */}
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

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <Loading
                height='min-h-[300px]'
                background_color='bg-white'
              />
            </div>
          ) : Assets?.length > 0 ? (
            Assets.map((asset) => (
              <div
                key={asset._id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
              >
                {/* Asset Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CategoryId_To_CategoryBlock
                      categoryId={asset?.identification?.categoryId}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {asset?.identification?.name || "Department Name"}
                      </h3>
                      <p className="text-gray-500 text-xs truncate">
                        {asset?.identification?.tag || "Department Description"}
                      </p>
                    </div>
                  </div>
                  <SerialNumber_To_Barcode
                    serialNumber={asset?.details?.serialNumber}
                    size="sm"
                  />
                </div>

                {/* Asset Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <CategoryId_To_CategoryBlock
                      categoryId={asset?.identification?.categoryId}
                      view="name"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    {asset?.details?.status && (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(asset.details.status)}`}>
                        {formatStatusText(asset?.details?.status)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(asset?.purchase?.cost?.$numberDecimal, {
                        currency: "USD",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned</p>
                    <p className="text-sm">
                      {asset?.assigned?.assignedAt
                        ? formatDate(asset?.assigned?.assignedAt)
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedAsset(asset);
                      document.getElementById("View_Asset_Modal").showModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                  >
                    <FaEye className="text-sm" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <FaBoxOpen className="text-gray-400 w-12 h-12 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold mb-2">
                No Assets Found
              </p>
              <p className="text-gray-400 text-sm">
                Adjust your filters or you don&apos;t have any assets assigned to you yet.
              </p>
            </div>
          )}

          {/* Mobile Pagination */}
          {Assets?.length > 0 && (
            <div className="mt-6">
              <Table_Pagination
                colSpan={7}
                totalItems={data?.pagination?.totalItems || 0}
                totalPages={data?.pagination?.totalPages || 1}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                mobileView={true}
              />
            </div>
          )}
        </div>
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

      {/* Custom CSS for animations */}
      <style jsx>{`
         @keyframes fadeIn {
           from {
             opacity: 0;
             transform: translateY(-10px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
         .animate-fadeIn {
           animation: fadeIn 0.2s ease-out;
         }
       `}</style>
    </div>
  );
};

export default MyAssetsPage;