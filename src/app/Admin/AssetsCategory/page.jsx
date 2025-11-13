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
import AddAssetCategoryModal from '@/Shared/Modals/AssetCategory/AddAssetCategoryModal/AddAssetCategoryModal';
import ViewAssetCategoryModal from '@/Shared/Modals/AssetCategory/ViewAssetCategoryModal/ViewAssetCategoryModal';
import EditAssetCategoryModal from '@/Shared/Modals/AssetCategory/EditAssetCategoryModal/EditAssetCategoryModal';

// Hooks
import { useToast } from '@/Hooks/Toasts';
import useAxiosPublic from '@/Hooks/useAxiosPublic';

const AssetsCategoryPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();
  const { success, error, confirm } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Pagination States
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch AssetsCategory
  const {
    data: AssetsCategoryData,
    error: AssetsCategoryError,
    refetch: AssetsCategoryRefetch,
    isLoading: AssetsCategoryIsLoading,
  } = useQuery({
    queryKey: ["AssetsCategoryData", currentPage, itemsPerPage, searchTerm],
    queryFn: () =>
      axiosPublic.get(`/AssetCategory`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
        },
      }).then((res) => res.data),
    keepPreviousData: true,
  });

  // Destructure AssetsCategory data
  const Categories = AssetsCategoryData?.data || [];
  const totalItems = AssetsCategoryData?.total || 0;
  const totalPages = AssetsCategoryData?.totalPages || 1;

  // Handle errors
  if (AssetsCategoryError) {
    return <Error errors={[AssetsCategoryError]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    AssetsCategoryRefetch();
  };

  // Delete Category Handler
  const handleDeleteCategory = async (categoryId) => {
    // Confirm
    const isConfirmed = await confirm(
      "Are you sure?",
      "This action will permanently delete the asset category!",
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      const res = await axiosPublic.delete(`/AssetCategory/${categoryId}`);
      if (res.status === 200) {
        AssetsCategoryRefetch();
        RefetchAll();
        success("Asset category deleted successfully!");
      } else {
        error("Failed to delete the asset category.");
      }
    } catch (err) {
      console.error(err);
      error(err?.response?.data?.error || "Something went wrong!");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 flex items-center justify-between px-6 py-4 mx-2 mt-4 ">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Asset Categories
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
              placeholder="Search Asset Categories..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 
               focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => { document.getElementById("Add_Asset_Category_Modal").showModal() }}
            className=" gap-2 font-semibold text-white  py-2 bg-blue-600 rounded-lg shadow-md 
               hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
               active:translate-y-px active:shadow-md"
          >
            <div className='flex items-center w-52 justify-between px-5' >
              <FaPlus className="text-sm" />
              Add New Category
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
                { label: "Category", align: "left" },
                { label: "Description Rate (%)", align: "left" },
                { label: "Warranty (Months)", align: "left" },
                { label: "Created Date", align: "left" },
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

          {/* Table Body */}
          <tbody>
            {AssetsCategoryIsLoading || status === "loading" ? (
              // Loading
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
                        style={{ backgroundColor: category.selectedColor || "#e2e8f0" }}
                      >
                        <Image
                          src={category.iconImage || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                          alt={category.category_name}
                          width={32} // 8 * 4 = 32px (matches w-8)
                          height={32} // matches h-8
                          className="object-contain"
                        />
                      </div>

                      {/* Text content */}
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {category.category_name}
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm">
                          ID: {category?.ac_id || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Depreciation Rate */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {category.depreciation_rate?.toFixed(2)}%
                  </td>

                  {/* Warranty */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {category.warranty} months
                  </td>

                  {/* Created At */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {new Date(category.created_at).toLocaleDateString("en-GB", {
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
                        data-tooltip-id={`view-tooltip-${category._id}`}
                        data-tooltip-content="View Asset Category"
                        onClick={() => {
                          setSelectedCategory(category);
                          document.getElementById("View_Asset_Category_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {/* Edit */}
                      <button
                        data-tooltip-id={`edit-tooltip-${category._id}`}
                        data-tooltip-content="Edit Asset Category"
                        onClick={() => {
                          setSelectedCategory(category);
                          document.getElementById("Edit_Asset_Category_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        data-tooltip-content="Delete Asset Category"
                        data-tooltip-id={`delete-tooltip-${category._id}`}
                        onClick={() => handleDeleteCategory(category._id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                      >
                        <FaRegTrashAlt className="text-sm" />
                      </button>
                    </div>

                    {/* Tooltip components with unique IDs */}
                    <Tooltip id={`view-tooltip-${category._id}`} place="top" effect="solid" />
                    <Tooltip id={`edit-tooltip-${category._id}`} place="top" effect="solid" />
                    <Tooltip id={`delete-tooltip-${category._id}`} place="top" effect="solid" />
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
                      No Asset Categories Found
                    </p>

                    {/* Subtext for guidance */}
                    <p className="text-gray-400 text-sm">
                      Adjust your filters or add a new asset category.
                    </p>
                  </div>
                </td>
              </tr>

            )}
          </tbody>

          {/* Table footer with dynamic pagination */}
          <tfoot>
            <tr>
              <td colSpan={6} className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-black">
                  <div>
                    <p className="text-sm">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">Asset Categories</p>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-end space-x-2 mt-4">
                    {/* Previous Button */}
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm transition ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <FaAngleLeft /> Prev
                    </button>

                    {/* Page Number Display */}
                    <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 font-medium">
                      Page {currentPage} of {totalPages}
                    </div>

                    {/* Next Button */}
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm transition ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next <FaAngleRight />
                    </button>
                  </div>

                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Asset Category Modal */}
      <dialog id="Add_Asset_Category_Modal" className="modal">
        <AddAssetCategoryModal
          UserEmail={session?.user?.email}
          RefetchAll={RefetchAll}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Asset Category Modal */}
      <dialog id="Edit_Asset_Category_Modal" className="modal">
        <EditAssetCategoryModal
          RefetchAll={RefetchAll}
          UserEmail={session?.user?.email}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* View Asset Category Modal */}
      <dialog id="View_Asset_Category_Modal" className="modal">
        <ViewAssetCategoryModal
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

export default AssetsCategoryPage;