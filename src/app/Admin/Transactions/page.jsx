// Admin/AssetsCategory/page.jsx
"use client";

// React Components
import React, { useState } from 'react';

// Next Components
import { useSession } from 'next-auth/react';

// Icons
import { FiSearch } from "react-icons/fi";
import { FaAngleLeft, FaAngleRight, FaBoxOpen, FaEye } from 'react-icons/fa';

// Tanstack
import { useQuery } from '@tanstack/react-query';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';

// Hooks
import useAxiosPublic from '@/Hooks/useAxiosPublic';
import CategoryToIcon from '../Assets/CategoryToIcon/CategoryToIcon';
import BarcodeGenerator from '../Assets/Barcode/Barcode';

const TransactionsPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Pagination States
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Requests
  const {
    data: RequestsData,
    error: RequestsError,
    isLoading: RequestsIsLoading,
  } = useQuery({
    queryKey: [
      "RequestsData",
      currentPage,
      itemsPerPage,
      searchTerm,
      session?.user?.email
    ],
    queryFn: () =>
      axiosPublic.get(`/Requests`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          assigned_to: session?.user?.email,
        },
      }).then((res) => res.data),
    keepPreviousData: true,
    enabled: !!session?.user?.email,
  });

  // Destructure AllUsers data
  const request = RequestsData?.data || [];
  const totalItems = RequestsData?.total || 0;
  const totalPages = RequestsData?.totalPages || 1;

  // Handle loading
  if (
    status === "loading"
  ) { return <Loading /> }

  // Handle errors
  if (RequestsError) { return <Error errors={[RequestsError]} /> }

  console.log(request);

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 flex items-center justify-between px-6 py-4 mx-2 mt-4 ">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Transactions
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
                { label: "Asset", align: "left" },
                { label: "Barcode", align: "center" },
                { label: "Activity", align: "left" },
                { label: "Requester By", align: "left" },
                { label: "Requester To", align: "left" },
                { label: "Status", align: "left" },
                { label: "Request Date", align: "center" },
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
            {RequestsIsLoading || status === "loading" ? (
              // Loading
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loading
                    height='min-h-[500px]'
                    background_color='bg-white'
                  />
                </td>
              </tr>
            ) : request?.length > 0 ? (
              request.map((request) => (
                <tr
                  key={request._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-gray-900"
                >
                  {/* Icon, name, and ID */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default w-60 min-w-60">
                    <div className="flex items-center gap-4">
                      {/* Icon container */}
                      <CategoryToIcon
                        id={
                          request?.asset?.value ||
                          request?.general?.current_asset?.value
                        }
                      />

                      {/* Text content */}
                      <div className="flex flex-col overflow-hidden">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          <p>
                            {
                              request?.asset?.label?.replace(/\s*\(.*?\)\s*/g, "") ||
                              request?.general?.current_asset?.label?.replace(/\s*\(.*?\)\s*/g, "") ||
                              "Unassigned"
                            }
                          </p>
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {
                            request?.asset?.value ||
                            request?.general?.current_asset?.value
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Barcode */}
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-left cursor-default">
                    <BarcodeGenerator
                      assetId={
                        request?.asset?.value ||
                        request?.general?.current_asset?.value
                      }
                      padding={0}
                      barWidth={1}
                      barHeight={30}
                      numberText="xs"
                      numberBellow={0}
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
                      No Request found
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

        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;