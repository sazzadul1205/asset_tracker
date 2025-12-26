// src/app/admin/assets/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Next Components
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';

// Icons
import { IoMdAdd } from "react-icons/io";
import { MdEdit } from 'react-icons/md';
import { FaBoxOpen, FaEye, FaRegTrashAlt } from 'react-icons/fa';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Table_Pagination from '@/Shared/Table_Pagination/Table_Pagination';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Components

// Modals
import Add_New_Asset_Modal from './Add_New_Asset_Modal/Add_New_Asset_Modal';
import CategoryId_To_CategoryBlock from './CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock';
import SerialNumber_To_Barcode from './SerialNumber_To_Barcode/SerialNumber_To_Barcode';
import { Assistant } from 'next/font/google';
import AssignedTo_To_Name from './AssignedTo_To_Name/AssignedTo_To_Name';


const AssetsPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // Toast
  const { success, error, confirm } = useToast();

  // State variables -> Assets
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
  if (AssetCategoryIsError) return <Error errors={AssetCategoryOptionsData?.errors || []} />;


  // Refetch all
  const RefetchAll = () => {
    AssetCategoryRefetch();
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

      {/* Edit Category Modal */}
      {/* <dialog id="Edit_Category_Modal" className="modal">
        <Edit_Category_Modal
          session={session}
          RefetchAll={RefetchAll}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog> */}

      {/* View Category Modal */}
      {/* <dialog id="View_Category_Modal" className="modal">
        <View_Category_Modal
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog> */}
    </div>
  );
};

export default AssetsPage;