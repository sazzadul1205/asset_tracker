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
        className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          {/* Left side: Type, Asset, Priority */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Type with Icon */}
            <div className="flex items-center gap-2">
              {getRequestTypeIcon(myRequests?.type)}
              <span className="font-bold text-gray-800">
                {getTypeLabel(myRequests?.type)}
              </span>
            </div>

            {/* Priority Badge */}
            <div className={`px-3 py-1 rounded-full border ${getPriorityColor(myRequests?.priority)} text-sm font-medium`}>
              {myRequests?.priority.charAt(0).toUpperCase() + myRequests?.priority.slice(1)}
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full border ${getStatusColor(myRequests?.metadata?.status)} text-sm font-medium`}>
              {myRequests?.metadata?.status?.charAt(0).toUpperCase() + myRequests?.metadata?.status?.slice(1) || "Pending"}
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2">
            {/* Barcode */}
            <div className="hidden md:block">
              <SerialNumber_To_Barcode
                serialNumber={myRequests?.assetInfo?.serialNumber || "N/A"}
              />
            </div>

            {/* Accept/Reject Buttons: Show if:
            1. I'm the requestedToId AND status is pending
            2. I'm a manager OR admin
            */}
            {(myRequests?.participants?.requestedToId === UserId ||
              UserRole === "manager" || UserRole === "admin") &&
              myRequests?.metadata?.status === "pending" && (
                <div className="flex items-center gap-2">
                  {/* Accept Button */}
                  <Shared_Button
                    onClick={() => handleRequestAction(myRequests, "approved", UserId)}
                    className="bg-green-600 hover:bg-green-700 border-0 flex items-center justify-center"
                    title="Accept Request"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="text-sm">Processing…</span>
                    ) : (
                      <>
                        <IoCheckmark className="text-lg mr-2" /> Accept
                      </>
                    )}
                  </Shared_Button>

                  {/* Reject Button */}
                  <Shared_Button
                    onClick={() => handleRequestAction(myRequests, "rejected", UserId)}
                    variant="danger"
                    title="Reject Request"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="text-sm">Processing…</span>
                    ) : (
                      <>
                        <IoClose className="text-lg mr-2" /> Reject
                      </>
                    )}
                  </Shared_Button>
                </div>
              )}

            {/* Delete Button: Show if I'm the requestedById AND status is pending */}
            {myRequests?.participants?.requestedById === UserId &&
              myRequests?.metadata?.status === 'pending' && (
                <Shared_Button
                  onClick={() => handleDeleteRequest(myRequests)}
                  className="bg-gray-600 hover:bg-gray-700 border-0"
                  title="Delete Request"
                >
                  <IoTrashOutline className="text-lg mr-2" /> Delete
                </Shared_Button>
              )}

          </div>
        </div>

        {/* Description */}
        <div className="py-2">
          <h4 className="text-gray-800 font-medium">Request Details:</h4>
          <p className="text-gray-600 text-sm">{myRequests?.description || "No description provided."}</p>

          {/* Additional Messages */}
          <div>
            {/* Conditional messages based on user role */}
            <div className='bg-blue-100 p-3 my-2 rounded-lg'>
              {UserId === myRequests?.participants?.requestedById ? (
                // Message for the person who created the request (requestedById)
                <span className='text-sm text-gray-600'>
                  Waiting for   {(() => {
                    const requestedToId = myRequests?.participants?.requestedToId;

                    if (requestedToId === '-' || !requestedToId) {
                      return <span className='font-semibold' >Manager</span>;
                    }

                    return <UserId_To_Name userId={requestedToId} />;
                  })()} to respond to your request
                </span>
              ) : UserId === myRequests?.participants?.requestedToId ? (
                // Message for the person the request is addressed to (requestedToId)
                <span className='text-sm text-gray-600'>
                  If you accept this request, the asset will be assigned to you
                </span>
              ) : (
                // Message for other users (managers/admins viewing)
                <span className='text-sm text-gray-600'>
                  Request is pending action from   {(() => {
                    const requestedToId = myRequests?.participants?.requestedToId;

                    if (requestedToId === '-' || !requestedToId) {
                      return <span className='font-bold' >Manager</span>;
                    }

                    return <UserId_To_Name userId={requestedToId} />;
                  })()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100'>
          {/* Asset Name */}
          <div className='flex items-center gap-2' >
            <BsBoxSeam className="text-xl text-blue-600" />
            <span className='font-semibold pl-1' >Asset Name :</span>
            <h4 className=" text-gray-500 pl-1">
              {myRequests?.assetInfo?.name || "N/A"}
            </h4>
          </div>

          {/* Created At */}
          <div className='flex items-center gap-2' >
            <BsCalendarEvent className="text-xl text-green-600" />
            <span className='font-semibold pl-1' >Requested At :</span>
            <h4 className=" text-gray-500 pl-1">
              {formatDate(myRequests?.metadata?.createdAt)}
            </h4>
          </div>

          {/* Requested By */}
          <div className='flex items-center gap-2' >
            <BsPersonCircle className="text-xl text-indigo-600" />
            <span className='font-semibold pl-1' >Requested By :</span>
            <h4 className=" text-gray-500 pl-1">
              <UserId_To_Name userId={myRequests?.participants?.requestedById} />
            </h4>
          </div>

          {/* Requested To */}
          <div className='flex items-center gap-2'>
            <BsPersonBadge className="text-xl text-purple-600" />
            <span className='font-semibold pl-1'>Requested To :</span>
            <h4>
              {(() => {
                const requestedToId = myRequests?.participants?.requestedToId;

                if (requestedToId === '-' || !requestedToId) {
                  return <p className='font-semibold' >Manager</p>;
                }

                return <UserId_To_Name userId={requestedToId} />;
              })()}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRequestsList;

