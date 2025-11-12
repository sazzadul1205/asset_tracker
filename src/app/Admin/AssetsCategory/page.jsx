// Admin/AssetsCategory
"use client";

// React Components
import React from 'react';

// Next Components
import { useSession } from 'next-auth/react';

// Icons
import { MdEdit } from 'react-icons/md';
import { FaDisplay } from "react-icons/fa6";
import { FaEye, FaInbox, FaPlus, FaRegTrashAlt } from 'react-icons/fa';

// Tooltip 
import { Tooltip } from "react-tooltip";
import 'react-tooltip/dist/react-tooltip.css';

// Shared Modal
import AddAssetCategoryModal from '@/Shared/Modals/AssetCategory/AddAssetCategoryModal/AddAssetCategoryModal';

const AssetsCategoryPage = () => {
  const { data: session, status } = useSession();
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
                { label: "Created At", align: "left" },
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
            <tr className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900">
              {/* Icon, name and ID */}
              <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                <div className="flex items-center gap-4">
                  {/* Icon container */}
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-blue-200 rounded-lg">
                    <FaDisplay className="text-blue-800 text-xl" />
                  </div>

                  {/* Text content */}
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">Laptop</h3>
                    <p className="text-gray-500 text-xs md:text-sm">ID: 13131</p>
                  </div>
                </div>
              </td>

              {/* Description Rate */}
              <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                25.00%
              </td>

              {/* Warranty */}
              <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                36 months
              </td>

              {/* Created At */}
              <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                22 Oct 2025
              </td>

              {/* Actions */}
              <td className="py-3 px-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-3">
                  {/* View */}
                  <button
                    data-tooltip-id="view-tooltip"
                    data-tooltip-content="View Asset Category"
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                  >
                    <FaEye className="text-sm" />
                  </button>

                  {/* Edit */}
                  <button
                    data-tooltip-id="edit-tooltip"
                    data-tooltip-content="Edit Asset Category"
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                  >
                    <MdEdit className="text-sm" />
                  </button>

                  {/* Delete */}
                  <button
                    data-tooltip-id="delete-tooltip"
                    data-tooltip-content="Delete Asset Category"
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                  >
                    <FaRegTrashAlt className="text-sm" />
                  </button>
                </div>

                {/* Tooltips */}
                <Tooltip id="view-tooltip" place="top" effect="solid" />
                <Tooltip id="edit-tooltip" place="top" effect="solid" />
                <Tooltip id="delete-tooltip" place="top" effect="solid" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Create New Request Modal */}
      <dialog id="Add_Asset_Category_Modal" className="modal">
        <AddAssetCategoryModal UserEmail={session?.user} />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default AssetsCategoryPage;