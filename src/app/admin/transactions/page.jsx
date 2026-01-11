// arc/app/admin/transactions/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Table_Pagination from '@/Shared/Table_Pagination/Table_Pagination';

// Icons
import { FaBoxOpen, FaEye, FaSearch } from 'react-icons/fa';

// Modal
import View_Request_Modal from './View_Request_Modal/View_Request_Modal';

// Components
import RequestedById_To_Name from './RequestedById_To_Name/RequestedById_To_Name';
import SerialNumber_To_Barcode from '../assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode';
import CategoryId_To_CategoryBlock from '../assets/CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock';

// Request Type Badge Map
const requestTypeBadgeMap = {
  assign: "bg-blue-100 text-blue-700",
  request: "bg-indigo-100 text-indigo-700",
  return: "bg-green-100 text-green-700",
  repair: "bg-yellow-100 text-yellow-700",
  retire: "bg-gray-200 text-gray-700",
  transfer: "bg-purple-100 text-purple-700",
  update: "bg-orange-100 text-orange-700",
  dispose: "bg-red-100 text-red-700",
};

const statusBadgeMap = {
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-yellow-100 text-yellow-700",
  pending: "bg-gray-100 text-gray-700",
  completed: "bg-teal-100 text-teal-700",
  cancelled: "bg-red-100 text-red-700",
};

// Format Status
const formatStatus = (status) =>
  status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const TransactionPage = () => {
  // Session
  const { data: session, status } = useSession();

  const axiosPublic = useAxiosPublic();

  // State variables -> Requests
  const [itemsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // State Variable -> Selected Request
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch Requests
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["requests", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const res = await axiosPublic.get("/requests", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          requestedBy: session?.user?.userId || undefined,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  // Destructure AllRequest data
  const Request = data?.data || [];

  // Handle loading
  if (status === "loading")
    return <Loading
      message="Loading Transactions..."
      subText="Please wait while we fetch transactions data."
    />;

  // Handle errors
  if (isError) return <Error errors={data?.errors || []} />;

  return (
    <div className="p-2 md:p-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-t-lg flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 md:py-4 md:mx-0 mt-2 md:mt-4 space-y-4 md:space-y-0">
        {/* Title and Mobile Search Toggle */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Transactions
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

        {/* Desktop Search */}
        <div className="hidden md:flex items-center space-x-2 w-full md:w-auto">
          <Shared_Input
            type="search"
            label="Search"
            placeholder="Search transactions..."
            className="min-w-62.5"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        {/* Mobile Search Input */}
        {showMobileSearch && (
          <div className="w-full md:hidden animate-fadeIn">
            <Shared_Input
              type="search"
              label="Search"
              placeholder="Search transactions..."
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
                  { label: "Action", align: "left" },
                  { label: "Requested By", align: "left" },
                  { label: "Requested To", align: "left" },
                  { label: "Status", align: "center" },
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
                      height="min-h-[400px] md:min-h-[500px]"
                      background_color="bg-white"
                    />
                  </td>
                </tr>
              ) : Request?.length > 0 ? (
                Request.map((request) => (
                  <tr
                    key={request._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                  >
                    {/* Icon, name, and ID */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                      <div className="flex items-center gap-3 md:gap-4">
                        {/* Icon */}
                        <div className="shrink-0">
                          <CategoryId_To_CategoryBlock
                            categoryId={request?.assetDetails?.categoryId}
                          />
                        </div>

                        {/* Text content */}
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {request?.assetDetails?.name || "Asset Name"}
                          </h3>
                          <p className="text-gray-500 text-xs truncate">
                            {request?.assetDetails?.tag || "Asset Tag"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Serial Number (Barcode) */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-center">
                      <SerialNumber_To_Barcode
                        serialNumber={request?.assetDetails?.serialNumber}
                      />
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {request?.type ? (
                        <div className="relative group">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                              ${requestTypeBadgeMap[request.type] || "bg-gray-100 text-gray-600"}`}
                          >
                            {formatStatus(request.type)}
                          </span>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              {formatStatus(request.type)} Request
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    {/* Requested By */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <RequestedById_To_Name
                        requestedById={request?.participants?.requestedById}
                        requestedToId={request?.participants?.requestedToId}
                        ShowRequestedById
                        compact={true}
                      />
                    </td>

                    {/* Requested To */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <RequestedById_To_Name
                        requestedById={request?.participants?.requestedById}
                        requestedToId={request?.participants?.requestedToId}
                        ShowRequestedToId
                        compact={true}
                      />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {request?.metadata?.status ? (
                        <div className="relative group">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                              ${statusBadgeMap[request?.metadata?.status] || "bg-gray-100 text-gray-600"}`}
                          >
                            {formatStatus(request?.metadata?.status)}
                          </span>
                          {/* Hover Tooltip */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
                              {formatStatus(request?.metadata?.status)} Status
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <div className="relative group">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              document.getElementById("View_Request_Modal").showModal();
                            }}
                            className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                            aria-label="View transaction"
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FaBoxOpen className="text-gray-400 w-12 h-12" />
                      <p className="text-gray-500 text-lg font-semibold">No Transactions Found</p>
                      <p className="text-gray-400 text-sm text-center px-4">
                        Adjust your filters or you don&apos;t have any transactions yet.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer / Pagination */}
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
          ) : Request?.length > 0 ? (
            Request.map((request) => (
              <div
                key={request._id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
              >
                {/* Transaction Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CategoryId_To_CategoryBlock
                      categoryId={request?.assetDetails?.categoryId}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {request?.assetDetails?.name || "Asset Name"}
                      </h3>
                      <p className="text-gray-500 text-xs truncate">
                        {request?.assetDetails?.tag || "Asset Tag"}
                      </p>
                    </div>
                  </div>
                  <SerialNumber_To_Barcode
                    serialNumber={request?.assetDetails?.serialNumber}
                    size="sm"
                  />
                </div>

                {/* Transaction Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Action</p>
                    {request?.type ? (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                          ${requestTypeBadgeMap[request.type] || "bg-gray-100 text-gray-600"}`}
                      >
                        {formatStatus(request.type)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    {request?.metadata?.status ? (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                          ${statusBadgeMap[request?.metadata?.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {formatStatus(request?.metadata?.status)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">From</p>
                    <RequestedById_To_Name
                      requestedById={request?.participants?.requestedById}
                      requestedToId={request?.participants?.requestedToId}
                      ShowRequestedById
                      compact={true}
                      showAvatar={false}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">To</p>
                    <RequestedById_To_Name
                      requestedById={request?.participants?.requestedById}
                      requestedToId={request?.participants?.requestedToId}
                      ShowRequestedToId
                      compact={true}
                      showAvatar={false}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      document.getElementById("View_Request_Modal").showModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
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
                No Transactions Found
              </p>
              <p className="text-gray-400 text-sm">
                Adjust your filters or you don&apos;t have any transactions yet.
              </p>
            </div>
          )}

          {/* Mobile Pagination */}
          {Request?.length > 0 && (
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

      {/* View Request Modal */}
      <dialog id="View_Request_Modal" className="modal">
        <View_Request_Modal
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
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

export default TransactionPage;