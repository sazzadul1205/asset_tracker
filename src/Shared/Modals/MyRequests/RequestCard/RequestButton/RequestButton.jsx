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
    if (!request_id) return error("Invalid request!");
    setLoadingAccept(true);

    try {
      // ---- STEP 1: Update request status → accepted ----
      const res = await axiosPublic.patch(`/Requests/UpdateStatus/${request_id}`, {
        status: "accepted",
      });

      if (!res.data?.success) {
        setLoadingAccept(false);
        return error(res.data.error || "Failed to accept request.");
      }

      // ---- STEP 2: Get asset info ----
      const assetTag = request?.asset?.value;
      const assetRes = await axiosPublic.get(`/Assets/${assetTag}`);
      const asset = assetRes?.data?.data;

      if (!asset || !asset.asset_id) {
        return error("Asset not found!");
      }

      const assetId = asset.asset_id;

      // ---- STEP 3: Build update payload ----
      let payload = { updated_by: UserEmail };
      let endpoint = "";
      let message = "";

      switch (request?.action_type) {
        case "assign":
          payload.employee_id = request?.assign_to?.value;
          endpoint = `/Assets/Assign/${assetId}`;
          message = "Asset assigned successfully.";
          break;

        case "request":
          payload.employee_id = request?.requested_by?.id;
          endpoint = `/Assets/Assign/${assetId}`;
          message = "Asset assigned to requester.";
          break;

        case "return":
          payload.employee_id = null;
          payload.condition_rating =
            request?.condition_rating || asset?.condition_rating;
          endpoint = `/Assets/Return/${assetId}`;
          message = "Asset returned successfully.";
          break;

        case "repair":
          payload.status = "in_repair";
          payload.employee_id = null;
          payload.repair_notes = request?.notes;
          endpoint = `/Assets/Repair/${assetId}`;
          message = "Asset sent for repair.";
          break;

        default:
          return error("Invalid request type.");
      }

      // ---- STEP 4: Update Asset ----
      const updateRes = await axiosPublic.put(endpoint, payload);

      if (!updateRes?.data?.success) {
        return error(updateRes.data.error || "Asset update failed.");
      }

      RefetchAll?.();
      success(message);
    } catch (err) {
      console.error(err);
      error(err?.response?.data?.error || "Something went wrong.");
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