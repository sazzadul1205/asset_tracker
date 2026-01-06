// src/app/admin/assets/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Next Components
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';

// Icons
import { MdEdit } from 'react-icons/md';
import { IoMdAdd } from "react-icons/io";
import { FaBoxOpen, FaEye, FaRegTrashAlt } from 'react-icons/fa';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Table_Pagination from '@/Shared/Table_Pagination/Table_Pagination';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Utils
import formatCurrency from '@/Utils/formatCurrency';
import { formatStatusText, getStatusColor } from '@/Utils/formatStatus';

// Components
import AssignedTo_To_Name from './AssignedTo_To_Name/AssignedTo_To_Name';
import SerialNumber_To_Barcode from './SerialNumber_To_Barcode/SerialNumber_To_Barcode';
import CategoryId_To_CategoryBlock from './CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock';

// Modals
import View_Asset_Modal from './View_Asset_Modal/View_Asset_Modal';
import Edit_Asset_Modal from './Edit_Asset_Modal/Edit_Asset_Modal';
import Add_New_Asset_Modal from './Add_New_Asset_Modal/Add_New_Asset_Modal';

const AssetsPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // Toast
  const { success, error, confirm } = useToast();

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
    queryKey: ["AllAssets", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const res = await axiosPublic.get("/assets", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          // includeDeleted is omitted since it's false by default
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  // Get User Options
  const {
    data: AssetCategoryOptionsData,
    isLoading: AssetCategoryLoading,
    isError: AssetCategoryIsError,
    refetch: AssetCategoryRefetch
  } = useQuery({
    queryKey: ["AssetCategoryOptionsData"],
    queryFn: async () =>
      axiosPublic
        .get("/assetsCategories/CategoryOptions")
        .then((res) => res.data.data),
  });

  // Destructure AllAssets data
  const Assets = data?.data || [];

  // Handle loading
  if (status === "loading" || AssetCategoryLoading)
    return <Loading
      message="Loading Assets..."
      subText="Please wait while we fetch Assets data."
    />;

  // Handle errors
  if (isError || AssetCategoryIsError) return <Error
    errors={data?.errors || AssetCategoryOptionsData?.errors || []} />;

  // Refetch all
  const RefetchAll = () => {
    refetch();
    AssetCategoryRefetch();
  };

  // Delete user (improved & safe)
  const handleDeleteAsset = async (asset) => {
    console.log(asset?.identification?.tag);
    
    if (!asset?.identification?.tag) {
      error("Invalid Asset", "Asset ID not found");
      return;
    }

    // Confirm dialog
    const isConfirmed = await confirm(
      "Delete Asset?",
      `This will permanently delete ${asset?.identification?.name}.`,
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      await axiosPublic.delete(`/assets/${asset?.identification?.tag}`);

      success(
        "Asset Deleted",
        `${asset?.identification?.name} has been removed successfully`
      );

      refetch();
    } catch (err) {
      console.error("Delete Asset error:", err);

      error(
        "Delete Failed",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-t flex items-center justify-between px-6 py-4 mx-2 mt-4">

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800">
          Assets
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

          {/* Edit Profile */}
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_Asset_Modal")?.showModal()}
            className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New Asset
          </Shared_Button>
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
                { label: "Assigned To", align: "left" },
                { label: "Status", align: "left" },
                { label: "Purchase Price", align: "left" },
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

                  {/* Assigned To */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <AssignedTo_To_Name
                      assignedTo={asset?.assigned?.assignedTo}
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

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          document.getElementById("Edit_Asset_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteAsset(asset)}
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
                      Adjust your filters or add a new Department.
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

      {/* Add New Asset Modal */}
      <dialog id="Add_New_Asset_Modal" className="modal">
        <Add_New_Asset_Modal
          session={session}
          RefetchAll={RefetchAll}
          AssetCategoryOptionsData={AssetCategoryOptionsData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Asset Modal */}
      <dialog id="Edit_Asset_Modal" className="modal">
        <Edit_Asset_Modal
          session={session}
          RefetchAll={RefetchAll}
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
          AssetCategoryOptionsData={AssetCategoryOptionsData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

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

export default AssetsPage;