// React Components
import React, { useState } from "react";

// React Hook Form
import { useForm } from "react-hook-form";

// Icons
import { ImCross } from "react-icons/im";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";

// Hooks
import { useToast } from "@/Hooks/Toasts";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const ChangePasswordModal = ({ MyUserData, RefetchAll }) => {
  const { success } = useToast();
  const axiosPublic = useAxiosPublic();

  // States
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form
  const {
    reset,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  // Close modal
  const handleClose = () => {
    reset();
    setFormError(null);
    document.getElementById("Change_Password_Modal")?.close();
  };

  // Submit
  const onSubmit = async (data) => {
    setIsLoading(true);
    setFormError(null);

    try {
      if (!MyUserData?.employee_id) {
        setFormError("Session error: User ID missing.");
        return;
      }

      const payload = {
        old_password: data.current_password,
        new_password: data.new_password,
      };

      const response = await axiosPublic.patch(
        `/Users/ChangePassword/${MyUserData?.employee_id}`,
        payload
      );

      if (response.status === 200) {
        handleClose();
        RefetchAll?.();
        success("Password updated successfully.");
      }
    } catch (error) {
      setFormError(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="Change_Password_Modal"
      className="modal-box w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">
          Add New Employee
        </h3>
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* form Error */}
      {formError && (
        <div className="py-3 bg-red-100 border border-red-400 rounded-lg mb-4">
          <p className="text-red-500 font-semibold text-center">{formError}</p>
        </div>
      )}

      <hr className="my-3 border-gray-300" />

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        {/* Current Password */}
        <SharedInput
          label="Current Password"
          type="password"
          placeholder="Enter your current password"
          name="current_password"
          register={register}
          rules={{
            required: "Current password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          error={errors.current_password}
        />

        {/* New Password */}
        <SharedInput
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          name="new_password"
          register={register}
          rules={{
            required: "New password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
            validate: (value) =>
              value !== watch("current_password") ||
              "New password cannot be same as current password",
          }}
          error={errors.new_password}
        />

        {/* Confirm New Password */}
        <SharedInput
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          name="confirm_new_password"
          register={register}
          rules={{
            required: "Confirm password is required",
            validate: (value) =>
              value === watch("new_password") || "Passwords do not match",
          }}
          error={errors.confirm_new_password}
        />


        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={`btn w-full h-11 font-semibold tracking-wide ${isSubmitting || isLoading
            ? "btn-disabled bg-blue-400 text-white cursor-not-allowed"
            : "btn-primary bg-blue-600 hover:bg-blue-700 text-white transition-all"
            }`}
        >
          {isSubmitting || isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordModal;