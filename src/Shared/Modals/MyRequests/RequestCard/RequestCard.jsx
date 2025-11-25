import React from 'react';

// Icons
import {
  BsBoxSeam,
  BsHourglass,
  BsShieldCheck,
  BsPersonBadge,
  BsPersonCircle,
  BsCalendarEvent,
  BsExclamationTriangle,
  BsExclamationCircle,
} from "react-icons/bs";

// Tanstack
import { useQuery } from '@tanstack/react-query';

// Hooks
import useAxiosPublic from '@/Hooks/useAxiosPublic';

// Components
import BarcodeGenerator from '@/app/Admin/Assets/Barcode/Barcode';
import AssignToRole from '@/app/Admin/Assets/AssignToRole/AssignToRole';
import RequestMessage from './RequestMessage/RequestMessage';

// Map action_type to colors
const actionTypeColors = {
  assign: { bg: "bg-blue-100", text: "text-blue-700" },
  request: { bg: "bg-green-100", text: "text-green-700" },
  return: { bg: "bg-yellow-100", text: "text-yellow-700" },
  repair: { bg: "bg-orange-100", text: "text-orange-700" },
  retire: { bg: "bg-red-100", text: "text-red-700" },
  transfer: { bg: "bg-purple-100", text: "text-purple-700" },
  update: { bg: "bg-teal-100", text: "text-teal-700" },
  dispose: { bg: "bg-gray-100", text: "text-gray-700" },
};

// Status colors mapping
const statusColors = {
  accepted: { bg: "bg-green-100", text: "text-green-700" },
  rejected: { bg: "bg-red-100", text: "text-red-700" },
  expired: { bg: "bg-yellow-100", text: "text-yellow-700" },
  pending: { bg: "bg-gray-100", text: "text-gray-700" },
};

// Function to format date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  };
  return date.toLocaleString("en-US", options);
};

const RequestCard = ({ MyRequestData, UserEmail, UserRole }) => {
  const axiosPublic = useAxiosPublic();

  // Destructure MyRequestData
  const request = MyRequestData

  // Fetch Selected Asset Data
  const {
    data: SelectAssetData,
    error: SelectAssetError,
    isLoading: SelectAssetIsLoading,
  } = useQuery({
    queryKey: ["SelectAssetData", request?.asset?.value],
    queryFn: () =>
      axiosPublic.get(`/Assets/${request?.asset?.value}`)
        .then((res) => res.data.data),
    keepPreviousData: true,
    enabled: !!request?.asset?.value
  });

  // Convert action_type to readable title
  const getTitle = (action_type, request_id) => {
    if (!action_type) return `Request #${request_id}`;
    const actionMap = {
      assign: "Assign Assets Request",
      request: "Request Assets Request",
      return: "Return Assets Request",
      repair: "Repair Assets Request",
      retire: "Retire Assets Request",
      transfer: "Transfer Assets Request",
      update: "Asset Update Request",
      dispose: "Dispose Assets Request",
    };
    return `${actionMap[action_type] || "Request"} # ${request_id}`;
  };

  return (
    <div className="mx-5 my-5 p-6 bg-white border border-gray-300 rounded-lg text-black transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">      <div className='' >
      {/* Top Part */}
      <div className='flex justify-between items-center mb-1' >
        {/* Top Left */}
        <div className='flex items-center gap-5' >
          {/* Title */}
          <h3 className='text-lg font-semibold text-gray-900'>
            {getTitle(request?.action_type, request?.request_id) || "Unknown"}
          </h3>

          {/* Action Type Badge */}
          <span
            className={`px-5 py-1 text-xs font-medium rounded-xl ${actionTypeColors[request?.action_type]?.bg || "bg-gray-100"
              } ${actionTypeColors[request?.action_type]?.text || "text-gray-700"
              }`}
          >
            {request?.action_type
              ? `${request?.action_type.charAt(0).toUpperCase()}${request?.action_type.slice(1)}`
              : "Unknown"}
          </span>

          {/* Barcode */}
          {SelectAssetIsLoading ? (
            <p className="text-gray-500">Loading asset...</p>
          ) : SelectAssetError ? (
            <p className="text-red-500">Error fetching asset: {SelectAssetError.message || "Unknown"}</p>
          ) : SelectAssetData ? (
            <BarcodeGenerator
              padding={0}
              barWidth={1}
              barHeight={30}
              numberText="xs"
              numberBellow={0}
              number={SelectAssetData.asset_tag || SelectAssetData.asset?.value} // fallback
            />
          ) : (
            <p className="text-gray-400">No asset data available</p>
          )}

          {/* Status Badge */}
          <span
            className={`px-5 py-1 text-xs font-medium rounded-xl ${statusColors[request?.status?.toLowerCase()]?.bg || statusColors.pending.bg
              } ${statusColors[request?.status?.toLowerCase()]?.text || statusColors.pending.text}`}
          >
            {request?.status
              ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
              : "Pending"}
          </span>
        </div>

        {/* Top Right */}
        {(UserEmail !== request?.requested_by?.email || UserRole === "Admin") && (
          <div className="flex items-center gap-3 w-full max-w-xs">
            {/* Accept Button */}
            <button
              className="w-full px-4 py-2 rounded-lg font-medium
              bg-green-600 text-white shadow-md
              hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5
              active:translate-y-px active:shadow-md
              transition-all duration-200"
            >
              Accept
            </button>

            {/* Reject Button */}
            <button
              className="w-full px-4 py-2 rounded-lg font-medium
              bg-red-600 text-white shadow-md
              hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5
              active:translate-y-px active:shadow-md
              transition-all duration-200"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Middle Part */}
      <div >
        {/* Title */}

        {["assign", "request", "return"].includes(request?.action_type) && (
          <h3 className='text-sm text-gray-600 mb-2'  >Description :</h3>
        )}

        {request?.action_type === "repair" && (
          <h3 className='text-sm text-gray-600 mb-2'>Issue Description :</h3>
        )}

        {/* Description */}
        <>
          <p className='text-sm text-gray-700' >{request?.notes || ""}</p>
          <p className='text-sm text-gray-700' >{request?.issue_description || ""}</p>

        </>

        {/* Request Messages */}
        <RequestMessage
          request={request}
          UserEmail={UserEmail}
        />
      </div>

      {/* Bottom Part - Remaining Data with Icons */}
      <div className="mt-5 text-sm text-gray-800">
        <div className="flex flex-wrap gap-6">

          {/* Asset */}
          {request?.asset && (
            <p className="flex items-center gap-2">
              <BsBoxSeam className="text-xl text-blue-600" />
              <span className="font-semibold">Asset:</span> {request.asset?.label || "Unassigned"}
            </p>
          )}

          {/* Priority */}
          {request?.priority && (
            <p className="flex items-center gap-2">
              <BsExclamationTriangle className={`text-xl ${request.priority === "high" ? "text-red-600" : request.priority === "medium" ? "text-yellow-500" : "text-green-500"}`} />
              <span className="font-semibold">Priority:</span> {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
            </p>
          )}

          {/* Expected / Return Date */}
          {request?.return_date && ["assign", "request", "return"].includes(request?.action_type) && (
            <p className="flex items-center gap-2">
              <BsCalendarEvent className="text-xl text-blue-500" />
              <span className="font-semibold">
                {request.action_type === "return" ? "Return Date:" : "Expected Return:"}
              </span>
              {isNaN(new Date(request?.return_date).getTime())
                ? "Undecided"
                : formatDate(request.return_date)}
            </p>
          )}

          {/* Condition */}
          {request?.condition_rating && (
            <p className="flex items-center gap-2">
              <BsShieldCheck className="text-xl text-green-600" />
              <span className="font-semibold">Condition:</span> {request.condition_rating.charAt(0).toUpperCase() + request.condition_rating.slice(1)}
            </p>
          )}

          {/* Requested By */}
          {request?.requested_by && (
            <p className="flex items-center gap-2">
              <BsPersonCircle className="text-xl text-indigo-600" />
              <span className="font-semibold">Requested By:</span>
              <AssignToRole email={request.requested_by.email} showOnlyName />
            </p>
          )}

          {/* Assigned To */}
          {request?.assign_to && (
            <p className="flex items-center gap-2">
              <BsPersonBadge className="text-xl text-indigo-700" />
              <span className="font-semibold">Assigned To:</span>
              <AssignToRole employee_id={request.assign_to.value} showOnlyName />
            </p>
          )}

          {/* Requested To (for 'request' action type) */}
          {request?.action_type === "request" && (
            <p className="flex items-center gap-2">
              <BsPersonBadge className="text-xl text-indigo-500" />
              <span className="font-semibold">Requested To:</span>
              Manager
            </p>
          )}

          {/* Requested At */}
          {request?.requested_at && (
            <p className="flex items-center gap-2">
              <BsHourglass className="text-xl text-gray-500" />
              <span className="font-semibold">Requested At:</span> {formatDate(request.requested_at)}
            </p>
          )}

          {/* Issue Type */}
          {request?.issue_type && (
            <p className="flex items-center gap-2">
              <BsExclamationCircle className="text-xl text-yellow-600" />
              <span className="font-semibold">Issue Type:</span>
              {request.issue_type
                .split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </p>
          )}

        </div>
      </div>

    </div>
    </div >
  );
};

export default RequestCard;
