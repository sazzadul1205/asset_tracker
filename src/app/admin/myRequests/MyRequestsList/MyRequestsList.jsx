import React, { useState } from 'react';

// Icons
import {
  BsBoxSeam,
  BsPersonBadge,
  BsPersonCircle,
  BsCalendarEvent,
} from "react-icons/bs";
import {
  IoClose,
  IoCheckmark,
  IoTrashOutline,
  IoBuildOutline,
  IoRepeatOutline,
  IoCreateOutline,
  IoPersonAddOutline,
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoReturnDownBackOutline
} from 'react-icons/io5';

// Components
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import UserId_To_Name from '../../departments/UserId_To_Name/UserId_To_Name';
import SerialNumber_To_Barcode from '../../assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';
import { useToast } from '@/hooks/useToast';


// Date formatter function
const formatDate = (dateString) => {
  if (!dateString) return "Not Set";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    // Format: "Jan 29, 2026"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
};

const MyRequestsList = ({
  UserId,
  UserRole,
  RefetchAll,
  myRequests,
}) => {
  const axiosPublic = useAxiosPublic();

  // Toast
  const { success, error, confirm } = useToast();

  // Loading state
  const [loading, setLoading] = useState(false);

  // Helper function to get request type icon
  const getRequestTypeIcon = (type) => {
    const iconMap = {
      assign: <IoPersonAddOutline className="text-xl text-blue-600" />,
      request: <IoDocumentTextOutline className="text-xl text-green-600" />,
      return: <IoReturnDownBackOutline className="text-xl text-yellow-600" />,
      repair: <IoBuildOutline className="text-xl text-orange-600" />,
      retire: <IoCloseCircleOutline className="text-xl text-red-600" />,
      transfer: <IoRepeatOutline className="text-xl text-purple-600" />,
      update: <IoCreateOutline className="text-xl text-teal-600" />,
      dispose: <IoTrashOutline className="text-xl text-gray-600" />,
    };
    return iconMap[type] || <BsBoxSeam className="text-xl text-gray-600" />;
  };

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    const colorMap = {
      urgent: "bg-red-100 text-red-800 border-red-200",
      high: "bg-red-50 text-red-700 border-red-100",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
      low: "bg-green-50 text-green-700 border-green-100",
    };
    return colorMap[priority] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colorMap = {
      pending: "bg-blue-50 text-blue-700 border-blue-100",
      approved: "bg-green-50 text-green-700 border-green-100",
      rejected: "bg-red-50 text-red-700 border-red-100",
      completed: "bg-teal-50 text-teal-700 border-teal-100",
      in_progress: "bg-yellow-50 text-yellow-700 border-yellow-100",
    };
    return colorMap[status] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  // Helper function to get type label
  const getTypeLabel = (type) => {
    const labelMap = {
      assign: "Assign Asset",
      request: "Request Asset",
      return: "Return Asset",
      repair: "Repair Asset",
      retire: "Retire Asset",
      transfer: "Transfer Asset",
      update: "Update Asset",
      dispose: "Dispose Asset",
    };
    return labelMap[type] || type;
  };

  const handleDeleteRequest = async (request) => {
    if (!request || !request?._id) {
      console.error("Invalid request data for deletion.");
      return;
    }

    // Confirm deletion
    const isConfirmed = await confirm(
      "Delete Request",
      "This Will Permanently Delete The Request. Are You Sure?",
      "Yes, Delete It",
      "Cancel",
      "#dc2626",
      "#6b7280"
    )

    // If confirmed, delete the request
    if (!isConfirmed) return;

    // Delete request API call
    try {
      await axiosPublic.delete(`/requests/${request?._id}`);
      success("Request deleted successfully.");
      RefetchAll();
    } catch (err) {
      console.error("Error deleting request:", err);
      error("Failed to delete request.", err.response?.data?.message || err.message);
    }
  }

  // Handle Accept/Reject Actions
  const handleRequestAction = async (request, action, UserId) => {
    if (!request?._id) {
      console.error("Invalid request data for action.");
      return;
    }

    if (!UserId) {
      console.error("No UserId found. User must be logged in.");
      return;
    }

    setLoading(true); // start loading
    const payload = { UserId };

    try {
      if (action === "rejected") {
        await axiosPublic.put(`/requests/Rejected/${request._id}`, payload);
        success("Request rejected successfully.");
      } else if (action === "approved") {
        await axiosPublic.put(`/requests/Accepted/${request._id}`, payload);
        success("Request accepted successfully.");
      }

      RefetchAll();
    } catch (err) {
      console.error(`Error ${action} request:`, err);
      error(`Failed to ${action} request.`, err.response?.data?.message || err.message);
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className='space-y-4 mb-2'>
      <div
        key={myRequests?._id}
        className="bg-white shadow-lg rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-200"
      >
        {/* Header Section - Fixed to stack properly on mobile */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-4 pb-4 border-b border-gray-100">
          {/* First Row: Type, Priority, Status - Mobile friendly */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left side: Type and badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Type with Icon */}
              <div className="flex items-center gap-2 shrink-0">
                {getRequestTypeIcon(myRequests?.type)}
                <span className="font-bold text-gray-800 text-sm sm:text-base">
                  {getTypeLabel(myRequests?.type)}
                </span>
              </div>

              {/* Priority Badge */}
              <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full border ${getPriorityColor(myRequests?.priority)} text-xs sm:text-sm font-medium shrink-0`}>
                {myRequests?.priority.charAt(0).toUpperCase() + myRequests?.priority.slice(1)}
              </div>

              {/* Status Badge */}
              <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full border ${getStatusColor(myRequests?.metadata?.status)} text-xs sm:text-sm font-medium shrink-0`}>
                {myRequests?.metadata?.status?.charAt(0).toUpperCase() + myRequests?.metadata?.status?.slice(1) || "Pending"}
              </div>
            </div>

            {/* Barcode - Only visible on mobile in header */}
            <div className="block sm:hidden self-end">
              <SerialNumber_To_Barcode
                serialNumber={myRequests?.assetInfo?.serialNumber || "N/A"}
                size="small"
              />
            </div>
          </div>

          {/* Second Row: Actions and Barcode (desktop) - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Action Buttons */}
            <div className="flex flex-cols lg:flex-wrap items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
              {/* Accept/Reject Buttons */}
              {myRequests?.metadata?.status === "pending" && (() => {
                const isTransfer = myRequests?.type === "transfer";
                const isRequestedTo = myRequests?.participants?.requestedToId === UserId;
                const isManagerOrAdmin = UserRole === "manager" || UserRole === "admin";

                // Transfer: only requestedToId can act
                if (isTransfer && !isRequestedTo) return null;

                // Non-transfer: block if no permission
                if (!isTransfer && !(isRequestedTo || isManagerOrAdmin)) return null;

                return (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Accept Button */}
                    <Shared_Button
                      onClick={() => handleRequestAction(myRequests, "approved", UserId)}
                      className="bg-green-600 hover:bg-green-700 border-0 flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"
                      title="Accept Request"
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? (
                        <span className="text-xs sm:text-sm">Processing…</span>
                      ) : (
                        <>
                          <IoCheckmark className="text-base sm:text-lg mr-1 sm:mr-2" /> Accept
                        </>
                      )}
                    </Shared_Button>

                    {/* Reject Button */}
                    <Shared_Button
                      onClick={() => handleRequestAction(myRequests, "rejected", UserId)}
                      variant="danger"
                      title="Reject Request"
                      disabled={loading}
                      className="w-full sm:w-auto"
                      size="sm"
                    >
                      {loading ? (
                        <span className="text-xs sm:text-sm">Processing…</span>
                      ) : (
                        <>
                          <IoClose className="text-base sm:text-lg mr-1 sm:mr-2" /> Reject
                        </>
                      )}
                    </Shared_Button>
                  </div>
                );
              })()}

              {/* Delete Button */}
              {myRequests?.participants?.requestedById === UserId &&
                myRequests?.metadata?.status === 'pending' && (
                  <Shared_Button
                    onClick={() => handleDeleteRequest(myRequests)}
                    className="bg-gray-600 hover:bg-gray-700 border-0 text-sm sm:text-base w-full sm:w-auto"
                    title="Delete Request"
                    size="sm"
                  >
                    <IoTrashOutline className="text-base sm:text-lg mr-1 sm:mr-2" /> Delete
                  </Shared_Button>
                )}
            </div>

            {/* Barcode for desktop */}
            <div className="hidden sm:block">
              <SerialNumber_To_Barcode
                showText={false}
                serialNumber={myRequests?.assetInfo?.serialNumber || "N/A"}
              />
            </div>


          </div>
        </div>

        {/* Description */}
        <div className="py-3 sm:py-4">
          <h4 className="text-gray-800 font-medium text-sm sm:text-base">Request Details:</h4>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            {myRequests?.description || "No description provided."}
          </p>

          {/* Additional Messages */}
          <div className="mt-3">
            <div className='bg-blue-100 p-2 sm:p-3 rounded-lg'>
              {UserId === myRequests?.participants?.requestedById ? (
                <span className='text-xs sm:text-sm text-gray-600'>
                  Waiting for {(() => {
                    const requestedToId = myRequests?.participants?.requestedToId;

                    if (requestedToId === '-' || !requestedToId) {
                      return <span className='font-semibold'>Manager</span>;
                    }

                    return <UserId_To_Name userId={requestedToId} />;
                  })()} to respond to your request
                </span>
              ) : UserId === myRequests?.participants?.requestedToId ? (
                <span className='text-xs sm:text-sm text-gray-600'>
                  If you accept this request, the asset will be assigned to you
                </span>
              ) : (
                <span className='text-xs sm:text-sm text-gray-600'>
                  Request is pending action from {(() => {
                    const requestedToId = myRequests?.participants?.requestedToId;

                    if (requestedToId === '-' || !requestedToId) {
                      return <span className='font-bold'>Manager</span>;
                    }

                    return <UserId_To_Name userId={requestedToId} />;
                  })()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information - Responsive Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-100'>
          {/* Asset Name */}
          <div className='flex items-start sm:items-center gap-2'>
            <BsBoxSeam className="text-lg sm:text-xl text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className='font-semibold text-xs sm:text-sm pl-1'>Asset Name:</span>
              <h4 className="text-gray-500 text-xs sm:text-sm pl-0 sm:pl-1 truncate">
                {myRequests?.assetInfo?.name || "N/A"}
              </h4>
            </div>
          </div>

          {/* Created At */}
          <div className='flex items-start sm:items-center gap-2'>
            <BsCalendarEvent className="text-lg sm:text-xl text-green-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className='font-semibold text-xs sm:text-sm pl-1'>Requested At:</span>
              <h4 className="text-gray-500 text-xs sm:text-sm pl-0 sm:pl-1">
                {formatDate(myRequests?.metadata?.createdAt)}
              </h4>
            </div>
          </div>

          {/* Requested By */}
          <div className='flex items-start sm:items-center gap-2'>
            <BsPersonCircle className="text-lg sm:text-xl text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className='font-semibold text-xs sm:text-sm pl-1'>Requested By:</span>
              <h4 className="text-gray-500 text-xs sm:text-sm pl-0 sm:pl-1">
                <UserId_To_Name userId={myRequests?.participants?.requestedById} />
              </h4>
            </div>
          </div>

          {/* Requested To */}
          <div className='flex items-start sm:items-center gap-2'>
            <BsPersonBadge className="text-lg sm:text-xl text-purple-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className='font-semibold text-xs sm:text-sm pl-1'>Requested To:</span>
              <h4 className="text-xs sm:text-sm pl-0 sm:pl-1">
                {(() => {
                  const requestedToId = myRequests?.participants?.requestedToId;

                  if (requestedToId === '-' || !requestedToId) {
                    return <p className='font-semibold text-gray-500'>Manager</p>;
                  }

                  return <UserId_To_Name userId={requestedToId} />;
                })()}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRequestsList;