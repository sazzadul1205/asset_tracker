import React, { useState } from 'react';

// Hooks
import useAxiosPublic from '@/Hooks/useAxiosPublic';

// Utils
import { useToast } from '@/Hooks/Toasts';

const RequestButton = ({
  UserId,
  request,
  UserRole,
  UserEmail,
  RefetchAll,
}) => {
  const axiosPublic = useAxiosPublic();
  const { success, error } = useToast();

  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  // Determine if buttons should be shown
  const shouldShowButtons = (() => {
    const statusBlocked = ["accepted", "rejected"].includes(request?.status);

    // Case 1: Assign request → user-specific
    if (request?.action_type === "assign") {
      return request?.assign_to?.value === UserId && !statusBlocked;
    }

    // Case 2: Normal request or return → only admin/manager can act
    if (["request", "return"].includes(request?.action_type)) {
      return (UserRole === "Admin" || UserRole === "Manager") && !statusBlocked;
    }

    return false;
  })();

  // If buttons shouldn't be shown, return null
  if (!shouldShowButtons) return null;


  // ---------------- Reject Request Handler ----------------
  const handleRejectRequest = async (request_id) => {
    if (!request_id) return error("Invalid request selected!");
    setLoadingReject(true);

    try {
      const res = await axiosPublic.patch(`/Requests/UpdateStatus/${request_id}`, {
        status: "rejected",
      });

      if (res.status === 200 && res.data.success) {
        RefetchAll?.();
        success("Request rejected successfully!");
      } else {
        error(res.data.error || "Failed to reject the request.");
      }
    } catch (err) {
      console.error("Reject request error:", err);
      error(err?.response?.data?.error || "Something went wrong while rejecting!");
    } finally {
      setLoadingReject(false);
    }
  };

  // ---------------- Accept Request Handler ----------------
  const handleAcceptRequest = async (request_id) => {
    if (!request_id) return error("Invalid request selected!");
    setLoadingAccept(true);

    try {
      // 1) Update Request Status
      const res = await axiosPublic.patch(`/Requests/UpdateStatus/${request_id}`, {
        status: "accepted",
      });

      if (res.status !== 200 || !res.data.success) {
        setLoadingAccept(false);
        return error(res.data.error || "Failed to approve the request.");
      }

      // 2) Fetch asset data
      const assetTag = request?.asset?.value; // e.g., "AST-TEST-012"
      const assetRes = await axiosPublic.get(`/Assets/${assetTag}`);
      const assetData = assetRes?.data?.data;

      if (!assetData || !assetData.asset_id) {
        return error("Asset not found or missing asset_id.");
      }

      const realAssetId = assetData.asset_id;

      // 3) Determine employee assignment or return logic
      let payload = { updated_by: UserEmail };
      let message = "Request accepted successfully!";

      if (request?.action_type === "assign") {
        payload.employee_id = request?.assign_to?.value;
        message = "Assign request accepted and asset assigned successfully!";
      } else if (request?.action_type === "request") {
        payload.employee_id = request?.requested_by?.id;
        message = "Request approved and asset assigned successfully!";
      } else if (request?.action_type === "return") {
        payload.condition_rating = request?.condition_rating || assetData.condition_rating;
        // Clear assigned_to for return
        payload.employee_id = null;
        message = "Return request processed successfully!";
      }

      // 4) Call relevant asset endpoint
      const endpoint =
        request?.action_type === "return"
          ? `/Assets/Return/${realAssetId}`
          : `/Assets/Assign/${realAssetId}`;

      const assignRes = await axiosPublic.put(endpoint, payload);

      if (assignRes.status !== 200 || !assignRes.data.success) {
        error(assignRes.data.error || "Status updated, but asset operation failed.");
      }

      RefetchAll?.();
      success(message);

    } catch (err) {
      console.error("Accept request error:", err);
      error(err?.response?.data?.error || "Something went wrong while approving!");
    } finally {
      setLoadingAccept(false);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      {/* Accept Button */}
      <button
        onClick={() => handleAcceptRequest(request?.request_id)}
        disabled={loadingAccept || loadingReject}
        className={`
          flex items-center justify-center px-10 font-semibold py-1.5 rounded-lg bg-green-600 text-white 
          shadow-md gap-2 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-px 
          active:shadow-md transition-all duration-200
          ${loadingAccept ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        {loadingAccept ? 'Accepting...' : 'Accept'}
      </button>


      {/* Reject Button */}
      <button
        onClick={() => handleRejectRequest(request?.request_id)}
        disabled={loadingAccept || loadingReject}
        className={`
          flex items-center justify-center px-10 font-semibold py-1.5 rounded-lg bg-gray-500 text-white 
          shadow-md gap-2 hover:bg-gray-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-px 
          active:shadow-md transition-all duration-200
          ${loadingReject ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        {loadingReject ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  );
};

export default RequestButton;