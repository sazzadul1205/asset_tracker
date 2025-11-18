// Admin/AssetsCategory/page.jsx
"use client";

// React Components
import React, { useState } from 'react';

// Next Components
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
import Barcode from './Barcode/Barcode';
import AssignToRole from './AssignToRole/AssignToRole';
import CategoryToIcon from './CategoryToIcon/CategoryToIcon';

const AssetsPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();
  const { success, error, confirm } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Pagination States
  const itemsPerPage = 8;
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

  // Fetch Asset Category Options
  const {
    data: AssetCategoryOptionData,
    error: AssetCategoryOptionError,
    refetch: AssetCategoryOptionRefetch,
    isLoading: AssetCategoryOptionIsLoading,
  } = useQuery({
    queryKey: ["AssetCategoryOptionData"],
    queryFn: () =>
      axiosPublic.get(`/AssetCategory/Options`).
        then((res) => res.data.data),
    keepPreviousData: true,
  });

  // Fetch Departments Options
  const {
    data: DepartmentsOptionData,
    error: DepartmentsOptionError,
    refetch: DepartmentsOptionRefetch,
    isLoading: DepartmentsOptionIsLoading,
  } = useQuery({
    queryKey: ["DepartmentsOptionData"],
    queryFn: () =>
      axiosPublic.get(`/Departments/Options`).
        then((res) => res.data.data),
    keepPreviousData: true,
  });

  // Destructure AllUsers data
  const assets = AssetsData?.data || [];
  const totalItems = AssetsData?.total || 0;
  const totalPages = AssetsData?.totalPages || 1;

  // Handle loading
  if (
    status === "loading" ||
    DepartmentsOptionIsLoading ||
    AssetCategoryOptionIsLoading
  ) {
    return <Loading />;
  }

  // Handle errors
  if (
    AssetsError ||
    DepartmentsOptionError ||
    AssetCategoryOptionError
  ) {
    return <Error errors={[
      AssetsError,
      DepartmentsOptionError,
      AssetCategoryOptionError,
    ]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    AssetsRefetch();
    DepartmentsOptionRefetch();
    AssetCategoryOptionRefetch();
  };

  // Delete Assets Handler
  const handleDeleteAsset = async (assets) => {
    const isConfirmed = await confirm(
      "Are you sure?",
      "This action will permanently delete the Asset!",
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      // 1) Delete the Assets
      const res = await axiosPublic.delete(`/Assets/${assets?.asset_id}`);

      // 2) Check response
      if (res.status === 200) {
        RefetchAll?.();
        success("Asset Deleted Successfully!");
      } else {
        error("Failed to delete the Asset.");
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
            Assets
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

          {/* Add Button */}
          <button
            onClick={() => { document.getElementById("Add_Asset_Modal").showModal() }}
            className="gap-2 font-semibold text-white  py-2 bg-blue-600 rounded-lg shadow-md 
                     hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
                     active:translate-y-px active:shadow-md"
          >
            <div className='flex items-center w-44 justify-between px-5' >
              <FaPlus className="text-sm" />
              Add New Asset
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
                { label: "Assets", align: "left" },
                { label: "Barcode", align: "center" },
                { label: "Category", align: "left" },
                { label: "Assigned To", align: "left" },
                { label: "Status", align: "center" },
                { label: "Purchase Price", align: "left" },
                { label: "Action", align: "center" },
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
            {AssetsIsLoading || status === "loading" ? (
              // Loading
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loading
                    height='min-h-[500px]'
                    background_color='bg-white'
                  />
                </td>
              </tr>
            ) : assets?.length > 0 ? (
              assets.map((assets) => (
                <tr
                  key={assets._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                >
                  {/* Icon, name, and ID */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default w-60 min-w-60">
                    <div className="flex items-center gap-4">
                      {/* Icon container */}
                      <CategoryToIcon category={assets?.asset_category} />

                      {/* Text content */}
                      <div className="flex flex-col overflow-hidden">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {assets?.asset_name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {assets?.asset_tag}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Barcode */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <Barcode number={assets?.serial_number} />
                  </td>

                  {/* Barcode */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <CategoryToIcon
                      category={assets?.asset_category}
                      showOnlyName={true}
                    />
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-4 text-sm text-left cursor-default">
                    <AssignToRole email={assets?.assigned_to} />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                    <div className="flex justify-center">
                      <StatusBadge status={assets?.status} />
                    </div>
                  </td>

                  {/* purchase_cost */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                    {assets?.purchase_cost != null
                      ? Number(assets.purchase_cost).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                      : "N/A"} BDT
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* View */}
                      <button
                        data-tooltip-id={`view-tooltip-${assets._id}`}
                        data-tooltip-content="View Asset"
                        onClick={() => {
                          setSelectedAsset(assets);
                          document.getElementById("View_Asset_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {/* Edit */}
                      <button
                        data-tooltip-id={`edit-tooltip-${assets._id}`}
                        data-tooltip-content="Edit Asset"
                        onClick={() => {
                          setSelectedAsset(assets);
                          document.getElementById("Edit_Asset_Modal").showModal();
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <MdEdit className="text-sm" />
                      </button>

                      {/* Delete */}
                      <button
                        data-tooltip-content="Delete Asset"
                        data-tooltip-id={`delete-tooltip-${assets._id}`}
                        onClick={() => handleDeleteAsset(assets)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg shadow-md hover:shadow-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                      >
                        <FaRegTrashAlt className="text-sm" />
                      </button>
                    </div>

                    {/* Tooltip components with unique IDs */}
                    <Tooltip id={`view-tooltip-${assets._id}`} place="top" effect="solid" />
                    <Tooltip id={`edit-tooltip-${assets._id}`} place="top" effect="solid" />
                    <Tooltip id={`delete-tooltip-${assets._id}`} place="top" effect="solid" />
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
                      No Assets found
                    </p>

                    {/* Subtext for guidance */}
                    <p className="text-gray-400 text-sm">
                      Adjust your filters or add a new asset to get started.
                    </p>
                  </div>
                </td>
              </tr>

            )}
          </tbody>

          {/* Table footer with dynamic pagination */}
          <tfoot>
            <tr>
              <td colSpan={7} className="px-6 py-4 border-t border-gray-200">
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

      {/* Add Asset Modal */}
      <dialog id="Add_Asset_Modal" className="modal">
        <AddAssetModal
          RefetchAll={RefetchAll}
          UserEmail={session?.user?.email}
          DepartmentOptionData={DepartmentsOptionData}
          AssetCategoryOptionData={AssetCategoryOptionData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Asset Modal */}
      <dialog id="Edit_Asset_Modal" className="modal">
        <EditAssetModal
          RefetchAll={RefetchAll}
          selectedAsset={selectedAsset}
          UserEmail={session?.user?.email}
          setSelectedAsset={setSelectedAsset}
          DepartmentOptionData={DepartmentsOptionData}
          AssetCategoryOptionData={AssetCategoryOptionData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>


      {/* View Asset Modal */}
      <dialog id="View_Asset_Modal" className="modal">
        <ViewAssetModal
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

// Status Badge
const StatusBadge = ({ status }) => {
  // Map status to Tailwind color classes
  const statusColors = {
    active: "bg-green-100 text-green-800",
    assigned: "bg-blue-100 text-blue-800",
    in_stock: "bg-gray-100 text-gray-800",
    in_repair: "bg-yellow-100 text-yellow-800",
    damaged: "bg-red-100 text-red-800",
    lost: "bg-red-200 text-red-900",
    retired: "bg-purple-100 text-purple-800",
    default: "bg-gray-100 text-gray-800",
  };

  const colorClass = statusColors[status] || statusColors.default;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass} uppercase text-center inline-block w-24`}
    >
      {status?.replace("_", " ") || "Unassigned"}
    </span>
  );
};
