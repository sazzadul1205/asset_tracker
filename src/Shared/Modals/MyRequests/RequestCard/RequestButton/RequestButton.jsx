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

  const shouldShowButtons =
    request?.action_type === "assign" &&
    request?.assign_to?.value === UserId &&
    !["accepted", "rejected"].includes(request?.status);

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
      const res = await axiosPublic.patch(`/Requests/UpdateStatus/${request_id}`, {
        status: "accepted",
      });

      if (res.status !== 200 || !res.data.success) {
        setLoadingAccept(false);
        return error(res.data.error || "Failed to approve the request.");
      }

      // Fetch asset
      const assetTag = request?.asset?.value;

      const assetRes = await axiosPublic.get(`/Assets/${assetTag}`);
      const assetData = assetRes?.data?.data;   // FIXED

      if (!assetData || !assetData.asset_id) {
        return error("Asset not found or missing asset_id.");
      }

      const realAssetId = assetData.asset_id;

      // Assign
      const assignRes = await axiosPublic.put(`/Assets/Assign/${realAssetId}`, {
        employee_id: request?.assign_to?.value,
        updated_by: UserEmail,
      });

      if (assignRes.status !== 200 || !assignRes.data.success) {
        error(assignRes.data.error || "Status updated, but asset assign failed.");
      }

      RefetchAll?.();
      success("Request accepted and asset assigned successfully!");
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