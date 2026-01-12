// src/app/admin/profile/Change_Password_Modal/Change_Password_Modal.jsx
// React Components
import React, { useState } from "react";
import { useForm } from "react-hook-form";

// Hooks
import { useToast } from "@/hooks/useToast";
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Shared
import Shared_Input from "@/Shared/Shared_Input/Shared_Input";
import Shared_Button from "@/Shared/Shared_Button/Shared_Button";

// Icons
import { ImCross } from "react-icons/im";
import { IoLockClosedOutline } from "react-icons/io5";

const Change_Password_Modal = ({ session }) => {
  const { success } = useToast();
  const axiosPublic = useAxiosPublic();

  // States
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Form Management
  const {
    reset,
    register,
    setError,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Close modal
  const handleClose = () => {
    reset();
    setGlobalError("");
    document.getElementById("Change_Password_Modal")?.close();
  };

  // Submit Handler
  const onSubmit = async (data) => {
    setGlobalError(""); // reset previous error
    setLoading(true);

    try {
      // Update password
      const response = await axiosPublic.post(
        `/auth/UpdatePassword/${session?.user?.userId}`,
        {
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
          updatedBy: session?.user?.userId || "SYSTEM",
        }
      );

      // Handle success
      if (response.status === 200) {
        handleClose();
        success("Password updated successfully.");
      }
    } catch (error) {
      console.error("[Axios Public] Error updating password:", error);

      // Use the actual server error directly
      const serverError = error?.error || error?.message || "Something went wrong. Please try again.";

      // If the server returned { error: 'Old password is incorrect.' }
      const displayError = serverError.error || serverError;

      // Set global error
      setGlobalError(displayError);

      // Highlight old password field if relevant
      if (displayError.includes("Old password")) {
        setError("currentPassword", {
          type: "server",
          message: displayError,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="Change_Password_Modal"
      className="modal-box w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-4 sm:px-6 py-4 sm:py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
          <IoLockClosedOutline className="inline-block mr-1 sm:mr-2 text-lg sm:text-xl" />
          <span className="truncate">Change Password</span>
        </h3>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300 cursor-pointer shrink-0"
        >
          <ImCross className="text-lg" />
        </button>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="bg-red-100 text-red-700 p-2 sm:p-3 rounded text-xs sm:text-sm font-medium text-center mb-3 sm:mb-4">
          {globalError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 pt-3 sm:pt-5">
        {/* Hidden username field for browser password managers */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          value={session?.user?.email || ""}
          readOnly
          hidden
        />

        {/* Current Password */}
        <Shared_Input
          label="Current Password"
          name="currentPassword"
          register={register}
          placeholder="Enter your current password"
          rules={{ required: "Current password is required." }}
          type="password"
          autoComplete="current-password"
          errors={errors}
        />

        {/* New Password */}
        <Shared_Input
          label="New Password"
          name="newPassword"
          register={register}
          placeholder="Enter your new password"
          rules={{
            required: "New password is required.",
            validate: (value) => {
              const regex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
              return regex.test(value)
                ? true
                : "Password must be 8+ chars, include uppercase, lowercase, number & special char";
            },
          }}
          type="password"
          autoComplete="new-password"
          errors={errors}
        />

        {/* Confirm Password */}
        <Shared_Input
          label="Confirm Password"
          name="confirmPassword"
          register={register}
          placeholder="Confirm your new password"
          rules={{
            required: "Confirm password is required.",
            validate: (value) =>
              value === getValues("newPassword") || "Passwords do not match",
          }}
          type="password"
          autoComplete="new-password"
          errors={errors}
        />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3 py-2 sm:py-4 pt-4 sm:pt-6">
          {/* Cancel */}
          <Shared_Button
            type="button"
            onClick={handleClose}
            variant="ghost"
            className="w-full sm:w-auto"
            minWidth="100px"
          >
            Cancel
          </Shared_Button>

          {/* Submit */}
          <Shared_Button
            type="submit"
            variant="primary"
            loading={isSubmitting || loading}
            className="w-full sm:w-auto"
            minWidth="100px"
          >
            <span className="text-sm sm:text-base">Update Password</span>
          </Shared_Button>
        </div>
      </form>
    </div>
  );
};

export default Change_Password_Modal;