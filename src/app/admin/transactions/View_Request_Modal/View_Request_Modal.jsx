// src/app/admin/transactions/View_Request_Modal/View_Request_Modal.jsx

// React
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Icons
import { FiX, FiCalendar, FiClock, FiMail, FiUser, FiHash, FiFileText } from 'react-icons/fi';
import { FaBarcode, FaBuilding, FaCheckCircle, FaExclamationCircle, FaTag, FaIdCard } from 'react-icons/fa';
import { MdSwapHoriz } from 'react-icons/md';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';

// Components
import DeptId_To_Name from '../../employees/DeptId_To_Name/DeptId_To_Name';
import SerialNumber_To_Barcode from '../../assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode';
import CategoryId_To_CategoryBlock from '../../assets/CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock';

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

const priorityBadgeMap = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-red-50 text-red-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-green-50 text-green-700",
}

// Format Status
const formatStatus = (status) =>
  status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Format Date
const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const View_Request_Modal = ({
  selectedRequest,
  setSelectedRequest,
}) => {
  const axiosPublic = useAxiosPublic();

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Fetch Asset Info
  const {
    data: AssetInfoData,
    isLoading: isAssetInfoLoading,
    isError: isErrorAssetInfo,
  } = useQuery({
    queryKey: ["assetInfo", selectedRequest?.assetId],
    queryFn: async () => {
      if (!selectedRequest?.assetId) return null;

      // Only request the fields we need
      const includeFields = [
        "identification.name",
        "identification.tag",
        "details.serialNumber",
        "details.status",
      ].join(",");

      const res = await axiosPublic.get(
        `/assets/${selectedRequest?.assetId}?include=${includeFields}`
      );
      return res.data;
    },
    enabled: !!selectedRequest?.assetId,
  });

  // Fetch Employee Manager
  const {
    data: employeeData,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
  } = useQuery({
    queryKey: [
      "EmployeeManager",
      selectedRequest?.participants?.requestedById,
      selectedRequest?.participants?.requestedToId,
    ],
    queryFn: async () => {
      if (
        !selectedRequest?.participants?.requestedById ||
        !selectedRequest?.participants?.requestedToId
      ) {
        return null;
      }

      const res = await axiosPublic.post("/users/EmployeeManager", {
        requestedById: selectedRequest.participants.requestedById,
        requestedToId: selectedRequest.participants.requestedToId,
      });

      return res.data?.data;
    },
    enabled:
      !!selectedRequest?.participants?.requestedById &&
      !!selectedRequest?.participants?.requestedToId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get asset info
  const AssetInfo = AssetInfoData?.data;

  // Check if asset is selected
  if (!selectedRequest) return null;

  // Handle Close
  const handleClose = () => {
    setSelectedRequest(null);
    document.getElementById("View_Request_Modal")?.close();
  };

  // Handle loading
  if (isAssetInfoLoading || isEmployeeLoading)
    return (
      <div className="modal" onClick={handleBackdropClick}>
        <div className="modal-box">
          <Loading
            variant="modal"
            message="Loading Transaction Details..."
            subText="Please wait while we fetch transaction data."
          />
        </div>
      </div>
    );

  // Handle errors
  if (isErrorAssetInfo || isEmployeeError) return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-box">
        <Error
          variant='modal'
          errors={
            AssetInfoData?.errors ||
            employeeData?.errors ||
            []
          }
        />
      </div>
    </div>
  );

  return (
    <div className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full">
          {/* Icon */}
          <CategoryId_To_CategoryBlock
            categoryId={selectedRequest?.assetDetails?.categoryId}
            size="lg"
          />

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-lg md:text-xl truncate">
              {selectedRequest?.assetDetails?.name || "Transaction Details"}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                    ${requestTypeBadgeMap[selectedRequest.type] || "bg-gray-100 text-gray-600"}`}
              >
                {formatStatus(selectedRequest.type)}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                    ${statusBadgeMap[selectedRequest?.metadata?.status] || "bg-gray-100 text-gray-600"}`}
              >
                {formatStatus(selectedRequest?.metadata?.status)}
              </span>
              {selectedRequest?.priority && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${priorityBadgeMap[selectedRequest?.priority] || "bg-gray-100 text-gray-600"}`}
                >
                  {formatStatus(selectedRequest?.priority)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
          aria-label="Close modal"
        >
          <FiX className="text-xl text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Transaction Details */}
        <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-2 h-5 rounded-full"></span>
            Transaction Details
          </h3>

          <div className="space-y-4">
            {/* Transaction ID */}
            <div className="flex items-start gap-3">
              <FiHash className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium text-gray-800 text-sm font-mono truncate">
                  {selectedRequest?._id || "N/A"}
                </p>
              </div>
            </div>

            {/* Transaction Type */}
            <div className="flex items-start gap-3">
              <MdSwapHoriz className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Transaction Type</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1
                      ${requestTypeBadgeMap[selectedRequest.type] || "bg-gray-100 text-gray-600"}`}
                >
                  {formatStatus(selectedRequest.type)}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1
                      ${statusBadgeMap[selectedRequest?.metadata?.status] || "bg-gray-100 text-gray-600"}`}
                >
                  {formatStatus(selectedRequest?.metadata?.status)}
                </span>
              </div>
            </div>

            {/* Priority */}
            {selectedRequest?.priority && (
              <div className="flex items-start gap-3">
                <FaExclamationCircle className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">Priority</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1
                        ${priorityBadgeMap[selectedRequest?.priority] || "bg-gray-100 text-gray-600"}`}
                  >
                    {formatStatus(selectedRequest?.priority)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Asset Information */}
        <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
            Asset Information
          </h3>

          <div className="space-y-4">
            {/* Asset Name */}
            <div className="flex items-start gap-3">
              <FaBuilding className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Asset Name</p>
                <p className="font-medium text-gray-800 truncate">
                  {AssetInfo?.identification?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Barcode */}
            <div className="flex items-start gap-3">
              <FaBarcode className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Barcode</p>
                <div className="mt-1">
                  <SerialNumber_To_Barcode
                    serialNumber={AssetInfo?.details?.serialNumber}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Asset Tag */}
            <div className="flex items-start gap-3">
              <FaTag className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Asset Tag</p>
                <p className="font-medium text-gray-800">
                  {AssetInfo?.identification?.tag || "N/A"}
                </p>
              </div>
            </div>

            {/* Serial Number */}
            <div className="flex items-start gap-3">
              <FiHash className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium text-gray-800">
                  {AssetInfo?.details?.serialNumber || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Information (Requester) */}
        <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
            Requester Information
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-start gap-3">
              <FiUser className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800 truncate">
                  {employeeData?.requestedBy?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <FiMail className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800 truncate">
                  {employeeData?.requestedBy?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-start gap-3">
              <FaIdCard className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-800">
                  {employeeData?.requestedBy?.userId || "N/A"}
                </p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start gap-3">
              <FaBuilding className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Department</p>
                <div className="font-medium text-gray-800">
                  <DeptId_To_Name
                    deptId={employeeData?.requestedBy?.departmentId}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Information (Requested To) */}
        <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 w-2 h-5 rounded-full"></span>
            Requested To
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-start gap-3">
              <FiUser className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800 truncate">
                  {employeeData?.requestedTo?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <FiMail className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800 truncate">
                  {employeeData?.requestedTo?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-start gap-3">
              <FaIdCard className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-800">
                  {employeeData?.requestedTo?.userId || "N/A"}
                </p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start gap-3">
              <FaBuilding className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Department</p>
                <div className="font-medium text-gray-800">
                  <DeptId_To_Name
                    deptId={employeeData?.requestedTo?.departmentId}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information - Full Width */}
      <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 w-full mt-4 md:mt-6">
        <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-600 w-2 h-5 rounded-full"></span>
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4">
          {/* Description & Timeline */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiFileText className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Description</label>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {selectedRequest?.description || "No description provided"}
                </p>
              </div>
            </div>

            {/* Expected Completion */}
            {selectedRequest?.expectedCompletion && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="text-gray-400 w-4 h-4" />
                  <label className="text-sm font-medium text-gray-700">Expected Completion</label>
                </div>
                <p className="font-medium text-gray-800 text-sm">
                  {formatDateTime(selectedRequest.expectedCompletion)}
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="text-gray-400 w-4 h-4" />
              <label className="text-sm font-medium text-gray-700">Timeline</label>
            </div>

            <div className="space-y-4">
              {/* Created At */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Created</span>
                </div>
                <p className="font-medium text-gray-800 text-sm">
                  {formatDateTime(selectedRequest?.metadata?.createdAt)}
                </p>
              </div>

              {/* Updated At */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Last Updated</span>
                </div>
                <p className="font-medium text-gray-800 text-sm">
                  {formatDateTime(selectedRequest?.metadata?.updatedAt)}
                </p>
              </div>

              {/* Transaction ID */}
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <FiHash className="text-gray-400 w-4 h-4" />
                  <span className="text-sm text-gray-600">Transaction ID</span>
                </div>
                <p className="font-medium text-gray-800 text-sm font-mono">
                  {selectedRequest?._id?.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Mobile */}
      <div className="md:hidden mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default View_Request_Modal;