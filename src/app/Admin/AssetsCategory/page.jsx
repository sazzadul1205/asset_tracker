// Admin/AssetsCategory
"use client";

// React Components
import React, { useState } from 'react';

// Next Components
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Icons
import { MdEdit } from 'react-icons/md';
import { FaBoxOpen, FaEye, FaInbox, FaPlus, FaRegTrashAlt } from 'react-icons/fa';

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

// Hooks
import useAxiosPublic from '@/Hooks/useAxiosPublic';


const AssetsCategoryPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();

  // States
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch AssetsCategory
  const {
    data: AssetsCategoryData,
    error: AssetsCategoryError,
    refetch: AssetsCategoryRefetch,
    isLoading: AssetsCategoryIsLoading,
  } = useQuery({
    queryKey: ["AssetsCategoryData"],
    queryFn: () =>
      axiosPublic.get(`/AssetCategory`).then((res) => res.data.data),
    keepPreviousData: true,
  });

  // Handle Loading
  if (
    AssetsCategoryIsLoading ||
    status === "loading"
  ) return <Loading />;

  // Handle errors
  if (AssetsCategoryError) {
    return <Error errors={[AssetsCategoryError]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    AssetsCategoryRefetch();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 ">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <FaInbox className="text-2xl text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">
            Asset Categories
          </h3>
        </div>

        {/* Right: Add Button */}
        <button
          onClick={() => { document.getElementById("Add_Asset_Category_Modal").showModal() }}
          className="flex items-center gap-2 font-semibold text-white px-4 py-2 bg-blue-600 rounded-lg shadow-md 
               hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
               active:translate-y-px active:shadow-md"
        >
          <FaPlus className="text-sm" />
          Add New Category
        </button>
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto mt-4 relative px-2">
        {/* Table */}
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          {/* Table Header */}
          <thead className="bg-white">
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
            {AssetsCategoryData?.length > 0 ? (
              AssetsCategoryData.map((category) => (
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
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        data-tooltip-id={`delete-tooltip-${category._id}`}
                        data-tooltip-content="Delete Asset Category"
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