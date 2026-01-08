import React from 'react';
import { ImCross } from 'react-icons/im';
import CategoryId_To_CategoryBlock from '../../assets/CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock';
import { FaBarcode, FaBuilding, FaCheckCircle, FaEnvelope, FaExclamationCircle, FaHashtag, FaInfoCircle, FaTag, FaUser } from 'react-icons/fa';
import { MdSwapHoriz } from 'react-icons/md';
import useAxiosPublic from '@/hooks/useAxiosPublic';
import Loading from '@/Shared/Loading/Loading';
import { useQuery } from '@tanstack/react-query';
import Error from '@/Shared/Error/Error';
import SerialNumber_To_Barcode from '../../assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode';
import DeptId_To_Name from '../../employees/DeptId_To_Name/DeptId_To_Name';



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

const priorityBadgeMap = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-red-50 text-red-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-green-50 text-green-700",
}

// Format Status
const formatStatus = (status) =>
  status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const View_Request_Modal = ({
  selectedRequest,
  setSelectedRequest,
}) => {
  const axiosPublic = useAxiosPublic();

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
    return <Loading
      variant="modal"
      message="Loading Users..."
      subText="Please wait while we fetch users data."
    />;

  // Handle errors
  if (isErrorAssetInfo || isEmployeeError) return <Error
    variant='modal'
    errors={
      AssetInfoData?.errors ||
      employeeData?.errors ||
      []
    } />;


  return (
    <div
      id="View_Request_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <CategoryId_To_CategoryBlock
            categoryId={selectedRequest?.assetDetails?.categoryId}
          />

          {/* Text content */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">
              {selectedRequest?.assetDetails?.name || "Asset Name"}
            </h3>
            <p className="text-gray-500 text-xs md:text-sm">
              {selectedRequest?.type ? (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                          ${requestTypeBadgeMap[selectedRequest.type] || "bg-gray-100 text-gray-600"}`}
                >
                  {formatStatus(selectedRequest.type)}
                </span>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="hover:text-red-500 transition cursor-pointer"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Transaction Details */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">
          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">
            Transaction Details
          </h3>

          {/* Details */}
          <div className="space-y-5">
            {/* Transaction ID */}
            <div className="flex items-center gap-3">
              <FaHashtag className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium">{selectedRequest?._id || "N/A"}</p>
              </div>
            </div>

            {/* Transaction Type */}
            <div className="flex items-center gap-3">
              <MdSwapHoriz className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Transaction Type</p>
                <p className="font-medium">
                  {selectedRequest?.type ? (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                ${requestTypeBadgeMap[selectedRequest.type] || "bg-gray-100 text-gray-600"}`}
                    >
                      {formatStatus(selectedRequest.type)}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {selectedRequest?.metadata?.status ? (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                ${statusBadgeMap[selectedRequest?.metadata?.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {formatStatus(selectedRequest?.metadata?.status)}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-3">
              <FaExclamationCircle className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <p className="font-medium">
                  {selectedRequest?.priority ? (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                ${priorityBadgeMap[selectedRequest?.priority] || "bg-gray-100 text-gray-600"}`}
                    >
                      {formatStatus(selectedRequest?.priority)}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Asset Information */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">

          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">
            Asset Information
          </h3>

          {/* Details */}
          <div className="space-y-5">
            {/* Asset Name */}
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Asset Name</p>
                <p className="font-medium">
                  {AssetInfo?.identification?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Barcode */}
            <div className="flex items-center gap-3">
              <FaBarcode className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Barcode</p>
                <SerialNumber_To_Barcode
                  serialNumber={AssetInfo?.details?.serialNumber}
                />
              </div>
            </div>

            {/* Asset Tag */}
            <div className="flex items-center gap-3">
              <FaTag className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Asset Tag</p>
                <p className="font-medium">
                  {AssetInfo?.identification?.tag || "N/A"}
                </p>
              </div>
            </div>

            {/* Serial Number */}
            <div className="flex items-center gap-3">
              <FaHashtag className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium">
                  {AssetInfo?.details?.serialNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {formatStatus(AssetInfo?.details?.status)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Information (Requester) */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">

          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">
            User Information (Requester)
          </h3>

          {/* Details */}
          <div className="space-y-5">
            {/* Name */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {employeeData?.requestedBy?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">
                  {employeeData?.requestedBy?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-center gap-3">
              <FaHashtag className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">
                  {employeeData?.requestedBy?.userId || "N/A"}
                </p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">
                  <DeptId_To_Name deptId={employeeData?.requestedBy?.departmentId} />

                </p>
              </div>
            </div>
          </div>

        </div>

        {/* User Information (Requested To) */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">

          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">
            User Information (Requested To)
          </h3>

          {/* Details */}
          <div className="space-y-5">
            {/* Name */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {employeeData?.requestedTo?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">
                  {employeeData?.requestedTo?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-center gap-3">
              <FaHashtag className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">
                  {employeeData?.requestedTo?.userId || "N/A"}
                </p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">
                  <DeptId_To_Name deptId={employeeData?.requestedTo?.departmentId} />

                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Request Details */}
        <div className="grid grid-cols-2 col-span-2 border border-gray-300 rounded-2xl shadow-lg p-6">
          {/* Description & Expected Completion */}
          <div className="space-y-5" >
            {/* Description */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">
                  {selectedRequest?.description || "N/A"}
                </p>
              </div>
            </div>

            {/* Expected Completion */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Expected Completion</p>
                <p className="font-medium">
                  {selectedRequest?.expectedCompletion
                    ? new Date(selectedRequest?.expectedCompletion).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Created At & Updated At */}
          <div className="space-y-5" >
            {/* Created At */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {selectedRequest?.metadata?.createdAt
                    ? new Date(selectedRequest?.metadata?.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-medium">
                  {selectedRequest?.metadata?.updatedAt
                    ? new Date(selectedRequest?.metadata?.updatedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default View_Request_Modal;