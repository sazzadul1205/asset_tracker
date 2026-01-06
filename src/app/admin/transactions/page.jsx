// arc/app/admin/transactions/page.jsx
"use client";

// React Components
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';


// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Table_Pagination from '@/Shared/Table_Pagination/Table_Pagination';

// Icons
import { FaBoxOpen, FaEye } from 'react-icons/fa';


// Modal
import View_Request_Modal from './View_Request_Modal/View_Request_Modal';


// Components
import RequestedById_To_Name from './RequestedById_To_Name/RequestedById_To_Name';
import SerialNumber_To_Barcode from '../assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode';
import CategoryId_To_CategoryBlock from '../assets/CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock';
import { useSession } from 'next-auth/react';


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
};

// Format Status
const formatStatus = (status) =>
  status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());


const TransactionPage = () => {
  // Session
  const { data: session, status } = useSession();

  const axiosPublic = useAxiosPublic();

  // State variables -> Requests
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
      message="Loading Users..."
      subText="Please wait while we fetch users data."
    />;

  // Handle errors
  if (isError) return <Error errors={data?.errors || []} />;

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-t flex items-center justify-between px-6 py-4 mx-2 mt-4">

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800">
          Transactions
        </h3>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <Shared_Input
            type="search"
            label="Search"
            placeholder="Search transaction asset..."
            className="min-w-75"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      </div>

      {/* Content */}

      <div className="overflow-x-auto relative px-2 mb-16">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                { label: "Asset", align: "left" },
                { label: "Barcode", align: "center" },
                { label: "Action", align: "left" },
                { label: "Requested By", align: "left" },
                { label: "Requested To", align: "center" },
                { label: "Status", align: "center" },
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
                <td colSpan={8} className="py-12 text-center">
                  <Loading height="min-h-[500px]" background_color="bg-white" />
                </td>
              </tr>
            ) : Request?.length > 0 ? (
              Request.map((request) => (
                <tr
                  key={request._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                >
                  {/* Icon, name, and ID */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <CategoryId_To_CategoryBlock
                        categoryId={request?.assetDetails?.categoryId}
                      />

                      {/* Text content */}
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {request?.assetDetails?.name || "Asset Name"}
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm">
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
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left">
                    {request?.type ? (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                          ${requestTypeBadgeMap[request.type] || "bg-gray-100 text-gray-600"}`}
                      >
                        {formatStatus(request.type)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <RequestedById_To_Name
                      requestedById={request?.participants?.requestedById}
                      requestedToId={request?.participants?.requestedToId}
                      ShowRequestedById
                    />
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <RequestedById_To_Name
                      requestedById={request?.participants?.requestedById}
                      requestedToId={request?.participants?.requestedToId}
                      ShowRequestedToId
                    />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    {request?.metadata?.status ? (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                          ${statusBadgeMap[request?.metadata?.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {formatStatus(request?.metadata?.status)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* View */}
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          document.getElementById("View_Request_Modal").showModal();
                        }}
                        className="flex items-center justify-center cursor-pointer gap-1 px-3 py-2 text-xs rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <FaEye className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FaBoxOpen className="text-gray-400 w-12 h-12" />
                    <p className="text-gray-500 text-lg font-semibold">No Transaction found</p>
                    <p className="text-gray-400 text-sm">
                      Adjust your filters or add a new transaction to get started.
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

      {/* View Asset Modal */}
      <dialog id="View_Request_Modal" className="modal">
        <View_Request_Modal
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default TransactionPage;