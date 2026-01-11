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
import { FaBoxOpen, FaEye, FaRegTrashAlt, FaSearch } from 'react-icons/fa';

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
  const [itemsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
      message="Loading Categories..."
      subText="Please wait while we fetch categories data."
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

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-2 md:p-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-t-lg flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 md:py-4 md:mx-0 mt-2 md:mt-4 space-y-4 md:space-y-0">
        {/* Title and Mobile Search Toggle */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Assets Categories
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

        {/* Desktop Search and Add Button */}
        <div className="hidden md:flex items-center space-x-2 w-full md:w-auto">
          {/* Search Input */}
          <Shared_Input
            type="search"
            label="Search"
            placeholder="Search Categories..."
            className="min-w-62.5"
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {/* Add New Category Button */}
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_Category_Modal")?.showModal()}
            className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New Category
          </Shared_Button>
        </div>

        {/* Mobile Add Button (outside search area) */}
        <div className="md:hidden w-full">
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Add_New_Category_Modal")?.showModal()}
            className="w-full bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
          >
            <IoMdAdd className="inline-block mr-2" />
            Add New Category
          </Shared_Button>
        </div>

        {/* Mobile Search Input */}
        {showMobileSearch && (
          <div className="w-full md:hidden animate-fadeIn">
            <Shared_Input
              type="search"
              label="Search"
              placeholder="Search Categories..."
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
                  { label: "Category", align: "left" },
                  { label: "Deprecation Rate", align: "left" },
                  { label: "Warranty (Months)", align: "left" },
                  { label: "Created At", align: "left" },
                  { label: "Actions", align: "center" },
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
                  <td colSpan={5} className="py-12 text-center">
                    <Loading
                      height='min-h-[400px] md:min-h-[500px]'
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
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                      <div className="flex items-center gap-3 md:gap-4">
                        {/* Icon container */}
                        <div
                          className="shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg"
                          style={{ backgroundColor: category?.info?.iconBgColor || "#e2e8f0" }}
                        >
                          <Image
                            src={category?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                            alt={category?.info?.name || "Category Icon"}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </div>

                        {/* Text content */}
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {category?.info?.name || "Category Name"}
                          </h3>
                          <p className="text-gray-500 text-xs truncate">
                            {category?.info?.description || "Category Description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Deprecation Rate */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {`${Number(
                        category?.depreciation?.averageRate?.$numberDecimal || 0
                      ).toFixed(2)}%`}
                    </td>

                    {/* Warranty Months */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {(() => {
                        const m = parseInt(
                          category?.depreciation?.defaultWarrantyMonths?.$numberDecimal || "0",
                          10
                        );
                        return m === 1 ? "1 Month" : `${m} Months`;
                      })()}
                    </td>

                    {/* Created At */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {formatDate(category?.metadata?.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <div className="relative group">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              document.getElementById("View_Category_Modal").showModal();
                            }}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="View category"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              View Details
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <div className="relative group">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              document.getElementById("Edit_Category_Modal").showModal();
                            }}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="Edit category"
                          >
                            <MdEdit className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              Edit Category
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="relative group">
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-red-600 text-white hover:bg-red-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="Delete category"
                          >
                            <FaRegTrashAlt className="text-sm" />
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              Delete Category
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FaBoxOpen className="text-gray-400 w-12 h-12" />
                      <p className="text-gray-500 text-lg font-semibold">
                        No Categories Found
                      </p>
                      <p className="text-gray-400 text-sm text-center px-4">
                        Adjust your filters or add a new Category.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table footer with dynamic pagination */}
            <Table_Pagination
              colSpan={5}
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
          ) : Categories?.length > 0 ? (
            Categories.map((category) => (
              <div
                key={category._id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-start gap-3">
                  <div
                    className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: category?.info?.iconBgColor || "#e2e8f0" }}
                  >
                    <Image
                      src={category?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                      alt={category?.info?.name || "Category Icon"}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {category?.info?.name || "Category Name"}
                    </h3>
                    <p className="text-gray-500 text-xs truncate">
                      {category?.info?.description || "Category Description"}
                    </p>
                  </div>
                </div>

                {/* Category Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deprecation Rate</p>
                    <p className="text-sm font-medium">
                      {`${Number(
                        category?.depreciation?.averageRate?.$numberDecimal || 0
                      ).toFixed(2)}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Warranty</p>
                    <p className="text-sm">
                      {(() => {
                        const m = parseInt(
                          category?.depreciation?.defaultWarrantyMonths?.$numberDecimal || "0",
                          10
                        );
                        return m === 1 ? "1 Month" : `${m} Months`;
                      })()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="text-sm">
                      {formatDate(category?.metadata?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      document.getElementById("View_Category_Modal").showModal();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <FaEye className="text-sm" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      document.getElementById("Edit_Category_Modal").showModal();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <MdEdit className="text-sm" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <FaRegTrashAlt className="text-sm" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <FaBoxOpen className="text-gray-400 w-12 h-12 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold mb-2">
                No Categories Found
              </p>
              <p className="text-gray-400 text-sm">
                Adjust your filters or add a new Category.
              </p>
            </div>
          )}

          {/* Mobile Pagination */}
          {Categories?.length > 0 && (
            <div className="mt-6">
              <Table_Pagination
                colSpan={5}
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

      {/* Modals */}
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

export default AssetsCategoriesPage;