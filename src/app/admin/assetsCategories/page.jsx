// src/app/admin/assetsCategories/page.jsx
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

// Modals
import Edit_Category_Modal from './Edit_Category_Modal/Edit_Category_Modal';
import View_Category_Modal from './View_Category_Modal/View_Category_Modal';
import Add_New_Category_Modal from './Add_New_Category_Modal/Add_New_Category_Modal';

const AssetsCategoriesPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // Toast
  const { success, error, confirm } = useToast();

  // State variables -> Categories
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // State Variable -> Selected Category
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch Category
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["assetsCategories", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const res = await axiosPublic.get("/assetsCategories", {
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

  // Destructure AllCategories data
  const Categories = data?.data || [];

  // Handle loading
  if (status === "loading")
    return <Loading
      message="Loading Departments..."
      subText="Please wait while we fetch departments data."
    />;

  // Handle errors
  if (isError) return <Error errors={data?.errors || []} />;

  // Refetch all
  const RefetchAll = () => {
    refetch();
  };

  // Delete user (improved & safe)
  const handleDeleteCategory = async (Category) => {
    if (!Category?.info?.categoryId) {
      error("Invalid Category", "Category ID not found");
      return;
    }

    // Confirm dialog
    const isConfirmed = await confirm(
      "Delete Category?",
      `This will permanently delete ${Category?.info?.name}.`,
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      await axiosPublic.delete(`/assetsCategories/${Category?.info?.categoryId}`);

      success(
        "Category Deleted",
        `${Category?.info?.name} has been removed successfully`
      );

      refetch();
    } catch (err) {
      console.error("Delete Category error:", err);

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
          Assets Categories
        </h3>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <Shared_Input
            type="search"
            label="Search"
            placeholder="Search Categories..."
            className="min-w-75"
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {/* Edit Profile */}
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_Category_Modal")?.showModal()}
            className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New Category
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
                { label: "Category", align: "left" },
                { label: "Deprecation Rate", align: "left" },
                { label: "Warranty (Months)", align: "left" },
                { label: "Created At", align: "left" },
                { label: "Actions", align: "center" },
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
            ) : Categories?.length > 0 ? (
              Categories.map((category) => (
                <tr
                  key={category._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                >
                  {/* Icon, name, and ID */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <div className="flex items-center gap-4">
                      {/* Icon container */}
                      <div
                        className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
                        style={{ backgroundColor: category?.info?.iconBgColor || "#e2e8f0" }}
                      >
                        <Image
                          src={category?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                          alt={category?.info?.name || "Category Icon"}
                          width={32} // 8 * 4 = 32px (matches w-8)
                          height={32} // matches h-8
                          className="object-contain"
                        />
                      </div>

                      {/* Text content */}
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {category?.info?.name || "category Name"}
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm">
                          {category?.info?.description || "category Description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Deprecation Rate */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {`${Number(
                      category?.depreciation?.averageRate?.$numberDecimal || 0
                    ).toFixed(2)}%`}
                  </td>

                  {/* Budget */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {(() => {
                      const m = parseInt(
                        category?.depreciation?.defaultWarrantyMonths?.$numberDecimal || "0",
                        10
                      );
                      return m === 1 ? "1 Month" : `${m} Months`;
                    })()}
                  </td>

                  {/* Created At */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {new Date(category?.metadata?.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* View */}
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          document.getElementById("View_Category_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          document.getElementById("Edit_Category_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteCategory(category)}
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
                      No Categories Found
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

      {/* Add New Category Modal */}
      <dialog id="Add_New_Category_Modal" className="modal">
        <Add_New_Category_Modal
          session={session}
          RefetchAll={RefetchAll}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Category Modal */}
      <dialog id="Edit_Category_Modal" className="modal">
        <Edit_Category_Modal
          session={session}
          RefetchAll={RefetchAll}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* View Category Modal */}
      <dialog id="View_Category_Modal" className="modal">
        <View_Category_Modal
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default AssetsCategoriesPage;