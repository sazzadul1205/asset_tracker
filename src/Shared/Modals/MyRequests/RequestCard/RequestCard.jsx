import React from 'react';

// Icons
import {
  BsRecycle,
  BsBoxSeam,
  BsHourglass,
  BsShieldCheck,
  BsPersonBadge,
  BsPersonCircle,
  BsCalendarEvent,
  BsExclamationCircle,
  BsExclamationTriangle,
} from "react-icons/bs";
import { FaTools } from 'react-icons/fa';
import { IoTrashOutline } from 'react-icons/io5';

// Tanstack
import { useQuery } from '@tanstack/react-query';

// Hooks
import useAxiosPublic from '@/Hooks/useAxiosPublic';

// Components
import RequestMessage from './RequestMessage/RequestMessage';
import BarcodeGenerator from '@/app/Admin/Assets/Barcode/Barcode';
import AssignToRole from '@/app/Admin/Assets/AssignToRole/AssignToRole';

// Utils
import { useToast } from '@/Hooks/Toasts';

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

const RequestCard = ({ request, UserEmail, RefetchAll }) => {
  const axiosPublic = useAxiosPublic();
  const { success, error, confirm } = useToast();

  // Determine asset value for fetching
  const assetValue =
    request?.asset?.value || request?.general?.current_asset?.value;

  // Fetch Selected Asset Data
  const {
    data: SelectAssetData,
    error: SelectAssetError,
    isLoading: SelectAssetIsLoading,
  } = useQuery({
    queryKey: ["SelectAssetData", assetValue],
    queryFn: () =>
      axiosPublic.get(`/Assets/${assetValue}`).then((res) => res.data.data),
    keepPreviousData: true,
    enabled: !!assetValue, // only run query if assetValue exists
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

  // Delete Request Handler
  const handleDeleteRequest = async (request) => {
    if (!request?.request_id) return error("Invalid request selected!");

    // Confirm deletion
    const isConfirmed = await confirm(
      "Are you sure?",
      "This action will permanently delete the request!",
      "Yes, Delete",
      "Cancel",
      "#dc2626",
      "#6b7280"
    );

    if (!isConfirmed) return;

    try {
      // Delete the request via API
      const res = await axiosPublic.delete(`/Requests/${request.request_id}`);

      if (res.status === 200) {
        // Refetch data and show success toast
        RefetchAll?.();
        success("Request deleted successfully!");
      } else {
        error("Failed to delete the request.");
      }
    } catch (err) {
      console.error("Delete request error:", err);
      error(err?.response?.data?.error || "Something went wrong while deleting!");
    }
  };

  return (
    <div className="mx-5 my-5 p-6 bg-white border border-gray-300 rounded-lg text-black transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Top Part */}
      <div className="flex justify-between items-center mb-1">
        {/* Top Left */}
        <div className="flex items-center gap-5">

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900">
            {getTitle(request?.action_type, request?.request_id) || "Unknown"}
          </h3>

          {/* Action Type Badge */}
          <span
            className={`px-5 py-1 text-xs font-medium rounded-xl 
        ${actionTypeColors[request?.action_type]?.bg || "bg-gray-100"} 
        ${actionTypeColors[request?.action_type]?.text || "text-gray-700"}`}
          >
            {request?.action_type
              ? request.action_type.charAt(0).toUpperCase() + request.action_type.slice(1)
              : "Unknown"}
          </span>

          {/* Barcode */}
          {SelectAssetIsLoading ? (
            <p className="text-gray-500">Loading asset...</p>
          ) : SelectAssetError ? (
            <p className="text-red-500">Error: {SelectAssetError.message || "Unknown"}</p>
          ) : SelectAssetData ? (
            <BarcodeGenerator
              padding={0}
              barWidth={1}
              barHeight={30}
              numberText="xs"
              numberBellow={0}
              number={
                SelectAssetData.asset_tag ||
                SelectAssetData.asset?.value ||
                SelectAssetData.general?.current_asset?.value ||
                "N/A"
              }
            />
          ) : (
            <p className="text-gray-400">No asset data</p>
          )}

          {/* Status Badge */}
          <span
            className={`px-5 py-1 text-xs font-medium rounded-xl 
        ${statusColors[request?.status?.toLowerCase()]?.bg || statusColors.pending.bg}
        ${statusColors[request?.status?.toLowerCase()]?.text || statusColors.pending.text}`}
          >
            {request?.status
              ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
              : "Pending"}
          </span>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center">
          {/* Delete Button (only for request creator) */}
          {UserEmail === request?.requested_by?.email && (
            <button
              onClick={() => handleDeleteRequest(request)}
              className="flex items-center justify-center px-5 py-1.5 rounded-lg bg-red-600 text-white shadow-md gap-2 
          hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 
          active:translate-y-px active:shadow-md transition-all duration-200"
            >
              <IoTrashOutline className="text-xl" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Middle Part */}
      <div className="space-y-2">
        {/* Description Heading */}
        {["assign", "request", "return", "transfer", "update", "dispose"].includes(request?.action_type) && (
          <h3 className="text-sm text-gray-600 font-semibold">Description:</h3>
        )}
        {request?.action_type === "repair" && (
          <h3 className="text-sm text-gray-600 font-semibold">Issue Description:</h3>
        )}

        {/* Notes & Issue Descriptions */}
        {[
          request?.notes,
          request?.general?.notes,
          request?.issue_description
        ].filter(Boolean).map((text, idx) => (
          <p key={idx} className="text-sm text-gray-700">{text}</p>
        ))}

        {/* Update Reason */}
        {request?.update?.reason && (
          <>
            <h3 className="text-sm text-gray-600 mt-2 font-semibold">Update Reason:</h3>
            <p className="text-sm text-gray-700">{request.update.reason}</p>
          </>
        )}

        {/* Asset Description */}
        {request?.update?.asset_description && (
          <>
            <h3 className="text-sm text-gray-600 mt-2 font-semibold">Asset Description:</h3>
            <p className="text-sm text-gray-700">{request.update.asset_description}</p>
          </>
        )}

        {/* Request Messages */}
        {request && <RequestMessage request={request} UserEmail={UserEmail} />}
      </div>

      {/* Bottom Part - Remaining Data with Icons */}
      <div className="mt-5 text-sm text-gray-800">
        <div className="flex flex-wrap gap-6">
          {[
            {
              condition: request?.asset || request?.general?.current_asset,
              icon: <BsBoxSeam className="text-xl text-blue-600" />,
              label: "Asset",
              value: () => (request.asset?.label || request.general?.current_asset?.label || "Unassigned"),
            },
            {
              condition: request?.priority || request?.general?.priority,
              icon: () => {
                const priority = request.priority || request.general?.priority;
                const colorMap = {
                  critical: "text-red-700",
                  high: "text-red-600",
                  medium: "text-yellow-500",
                  low: "text-green-500",
                };
                return <BsExclamationTriangle className={`text-xl ${colorMap[priority] || "text-green-500"}`} />;
              },
              label: "Priority",
              value: () => {
                const priority = request.priority || request.general?.priority;
                return priority.charAt(0).toUpperCase() + priority.slice(1);
              },
            },
            {
              condition: request?.return_date && ["assign", "request", "return"].includes(request?.action_type),
              icon: <BsCalendarEvent className="text-xl text-blue-500" />,
              label: request?.action_type === "return" ? "Return Date" : "Expected Return",
              value: () => isNaN(new Date(request.return_date).getTime()) ? "Undecided" : formatDate(request.return_date),
            },
            {
              condition: request?.condition_rating,
              icon: <BsShieldCheck className="text-xl text-green-600" />,
              label: "Condition",
              value: () => request.condition_rating.charAt(0).toUpperCase() + request.condition_rating.slice(1),
            },
            {
              condition: request?.requested_by,
              icon: <BsPersonCircle className="text-xl text-indigo-600" />,
              label: "Requested By",
              value: () => <AssignToRole email={request.requested_by.email} showOnlyName />,
            },
            {
              condition: request?.assign_to,
              icon: <BsPersonBadge className="text-xl text-indigo-700" />,
              label: "Assigned To",
              value: () => <AssignToRole employee_id={request.assign_to.value} showOnlyName />,
            },
            {
              condition: request?.update?.update_option,
              icon: <FaTools className="text-xl text-purple-600" />,
              label: "Update Option",
              value: () => request.update.update_option
                .split("_")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            },
            {
              condition: ["request", "retire", "repair", "dispose", "update"].includes(request?.action_type),
              icon: <BsPersonBadge className="text-xl text-indigo-500" />,
              label: "Requested To",
              value: () => "Manager",
            },
            {
              condition: request?.transfer_to,
              icon: <BsPersonBadge className="text-xl text-indigo-500" />,
              label: "Transfer To",
              value: () => request.transfer_to?.label || "Unassigned",
            },
            {
              condition: request?.retire_reason,
              icon: <BsExclamationCircle className="text-xl text-orange-600" />,
              label: "Retire Reason",
              value: () => request.retire_reason
                .split("_")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            },
            {
              condition: request?.update?.full_option,
              icon: <FaTools className="text-xl text-purple-600" />,
              label: "Updated Type",
              value: () => request.update.full_option
                .split("_")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            },
            {
              condition: request?.update,
              icon: <BsBoxSeam className="text-xl text-blue-500" />,
              label: "Updated Asset To",
              value: () => {
                if (request.update.full_option === "inventory" && request.update.update_asset_inventory) return request.update.update_asset_inventory.label;
                if (request.update.full_option === "new" && request.update.new_asset_name) return request.update.new_asset_name;
                return "Unassigned";
              },
            },
            {
              condition: request?.disposal_method,
              icon: <BsRecycle className="text-xl text-green-600" />,
              label: "Disposal Method",
              value: () => request.disposal_method
                .split("_")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            },
            {
              condition: request?.requested_at,
              icon: <BsHourglass className="text-xl text-gray-500" />,
              label: "Requested At",
              value: () => formatDate(request.requested_at),
            },
            {
              condition: request?.issue_type,
              icon: <BsExclamationCircle className="text-xl text-yellow-600" />,
              label: "Issue Type",
              value: () => request.issue_type
                .split("_")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            },
            {
              condition: request?.transfer_reason,
              icon: <BsExclamationCircle className="text-xl text-blue-600" />,
              label: "Transfer Reason",
              value: () => request.transfer_reason
                .split("_")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            },
          ]
            .filter(f => f.condition)
            .map((f, idx) => (
              <p key={idx} className="flex items-center gap-2">
                {typeof f.icon === "function" ? f.icon() : f.icon}
                <span className="font-semibold">{f.label}:</span> {f.value()}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
