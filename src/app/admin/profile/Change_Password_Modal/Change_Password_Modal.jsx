import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { useToast } from "@/hooks/useToast";
import Shared_Button from "@/Shared/Shared_Button/Shared_Button";
import Shared_Input from "@/Shared/Shared_Input/Shared_Input";
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
      className="modal-box w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
          <IoLockClosedOutline className="inline-block mr-2" />
          Change Password
        </h3>
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300 cursor-pointer"
        >
          <ImCross className="text-lg" />
        </button>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="bg-red-100 text-red-700 p-2 rounded mt-3 mb-1 text-sm font-medium text-center">
          {globalError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-5">
        <Shared_Input
          label="Current Password"
          name="currentPassword"
          register={register}
          placeholder="Enter your current password"
          rule={true}
          rules={{ required: "Current password is required." }}
          type="password"
          errors={errors}
        />
        <Shared_Input
          label="New Password"
          name="newPassword"
          register={register}
          placeholder="Enter your new password"
          rule={true}
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
          errors={errors}
        />
        <Shared_Input
          label="Confirm Password"
          name="confirmPassword"
          register={register}
          placeholder="Confirm your new password"
          rule={true}
          rules={{
            required: "Confirm password is required.",
            validate: (value) =>
              value === getValues("newPassword") || "Passwords do not match",
          }}
          type="password"
          errors={errors}
        />

        {/* Buttons */}
        <div className="justify-end flex items-center gap-2 py-2">
          {/* Cancel */}
          <Shared_Button
            type="button"
            onClick={handleClose}
            variant="ghost"
            minWidth="100px"
          >
            Cancel
          </Shared_Button>

          {/* Submit */}
          <Shared_Button
            type="submit"
            variant="primary"
            loading={isSubmitting || loading}
            minWidth="100px"
          >
            Update Password
          </Shared_Button>
        </div>
      </form>
    </div>
  );
};

export default Change_Password_Modal;
