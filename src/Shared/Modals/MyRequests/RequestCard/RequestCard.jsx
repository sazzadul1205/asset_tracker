import BarcodeGenerator from '@/app/Admin/Assets/Barcode/Barcode';
import useAxiosPublic from '@/Hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { BsClock, BsPerson, BsStar, BsFlag, BsBox } from "react-icons/bs";
import React from 'react';

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
  pending: { bg: "bg-gray-100", text: "text-gray-700" }, // default
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

const RequestCard = ({ MyRequestData }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch Selected Asset Data
  const request = MyRequestData?.data?.[6];

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
    <div className='mx-5 my-2 p-6 bg-white border border-gray-300 rounded-lg text-black' >
      <div className='' >
        {/* Top Part */}
        <div className='flex items-center gap-5 mb-1' >
          {/* Title */}
          <h3 className='text-lg font-semibold text-gray-900'>
            {getTitle(request?.action_type, request?.request_id)}
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
            <p className="text-red-500">Error fetching asset: {SelectAssetError.message}</p>
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

        {/* Middle Part */}
        <div >
          {/* Title */}
          <h3 className='text-sm text-gray-600 mb-2'  >Description :</h3>

          {/* Description */}
          <p className='text-sm text-gray-700' >{request?.notes || ""}</p>

          {/* Information */}
          <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-medium' >
            Return Request: When accepted, this asset will be returned to your Manager.
          </div>

          {/* Reply */}
          {request?.reply && (
            <>
              {/* Title */}
              <h3 className='text-sm text-gray-600 my-2' >
                Reply / Notes:
              </h3>

              {/* Reply - text */}
              <div className='text-sm text-gray-700 bg-gray-50 p-2 rounded' >
                {request?.reply || ""}
              </div>
            </>
          )}

        </div>

        {/* Bottom Part - Remaining Data with Icons */}
        <div className='mt-4 text-sm text-gray-800'>
          <div className='flex flex-wrap gap-5'>
            {request?.asset && (
              <p className='flex items-center gap-1'>
                <BsBox />
                Asset: {request?.asset?.label || ""}
              </p>
            )}
            {request?.priority && (
              <p className='flex items-center gap-1'><BsFlag /> Priority: {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}</p>
            )}
            {request?.return_date && (
              <p className='flex items-center gap-1'><BsClock /> Return: {formatDate(request.requested_at)}</p>
            )}
            {request?.condition_rating && (
              <p className='flex items-center gap-1'><BsStar /> Condition: {request.condition_rating.charAt(0).toUpperCase() + request.condition_rating.slice(1)}</p>
            )}
            {request?.requested_by && (
              <p className='flex items-center gap-1'><BsPerson /> Requested By: {request.requested_by}</p>
            )}
            {request?.requested_at && (
              <p className='flex items-center gap-1'><BsClock /> Requested At: {formatDate(request.requested_at)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
