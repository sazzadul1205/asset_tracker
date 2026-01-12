// src/app/admin/profile/Edit_My_Profile_Modal/Edit_My_Profile_Modal.jsx

// React Components
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

// Hooks
import { useToast } from '@/hooks/useToast';
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Shared
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';

// Icons
import { ImCross } from 'react-icons/im';
import { FaRegUser } from 'react-icons/fa';

const Edit_My_Profile_Modal = ({
  session,
  MyUserData,
  MyUserRefetch,
}) => {
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
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      personal: {
        name: MyUserData?.personal?.name || "",
        phone: MyUserData?.personal?.phone || "",
      },
      credentials: {
        email: MyUserData?.credentials?.email || "",
      },
    },
  });

  // Close the modal and reset form state
  const handleClose = () => {
    reset();
    setGlobalError("");
    document.getElementById("Edit_My_Profile_Modal")?.close();
  }

  // Form submit handler
  const onSubmit = async (data) => {
    setGlobalError("");
    setLoading(true);

    try {
      // Get the user ID safely
      const userId = MyUserData?.personal?.userId?.trim();
      if (!userId) {
        setGlobalError("User ID is missing! Cannot update profile.");
        setLoading(false);
        return;
      }

      // Prepare payload for the API
      const payload = {
        personal: {
          name: data.personal.name,
          phone: data.personal.phone,
        },
        credentials: {
          email: data.credentials.email,
        },
        updatedBy: session?.user?.userId || "SYSTEM",
      };

      // Send POST request to update profile
      const response = await axiosPublic.post(
        `/users/updatePersonalInfo/${userId}`,
        payload
      );

      // On success
      if (response.status === 200) {
        handleClose();
        success("Profile updated successfully.");
        MyUserRefetch?.();
      }
    } catch (error) {
      console.error("[Axios Public] Error updating profile:", error);

      // Extract server error message
      const serverError =
        error?.error || error?.message || "Something went wrong. Please try again.";

      setGlobalError(serverError);

      // Highlight fields if server returned field-specific errors
      if (serverError.toLowerCase().includes("email")) {
        setError("credentials.email", { type: "server", message: serverError });
      }

      // Highlight fields if server returned field-specific errors
      if (serverError.toLowerCase().includes("name")) {
        setError("personal.name", { type: "server", message: serverError });
      }

      // Highlight fields if server returned field-specific errors
      if (serverError.toLowerCase().includes("phone")) {
        setError("personal.phone", { type: "server", message: serverError });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="Edit_My_Profile_Modal"
      className="modal-box w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-4 sm:px-6 py-4 sm:py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* Title */}
        <h3 className="tracking-tight text-lg sm:text-xl font-semibold text-gray-900 truncate">
          Edit Profile
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

      {/* Form Container */}
      <div className='pt-2 sm:pt-4' >
        {/* Form Header */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <FaRegUser className="text-lg sm:text-xl" />
          <h3 className="font-semibold text-base sm:text-lg">Personal Information</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

          {/* Full Name */}
          <div className="md:col-span-2">
            <Shared_Input
              label="Full Name"
              name="personal.name"
              defaultValue={MyUserData?.personal?.name || ""}
              register={register}
              placeholder="Enter your Full Name"
              rules={{ required: "Full Name is required." }}
              type="text"
              errors={errors}
            />
          </div>

          {/* Employee ID */}
          <div className="md:col-span-2">
            <Shared_Input
              label="Employee ID"
              name="personal.userId"
              defaultValue={MyUserData?.personal?.userId || ""}
              register={register}
              placeholder="Enter your Employee ID"
              rules={{ required: "Employee ID is required." }}
              type="text"
              errors={errors}
              disabled
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <Shared_Input
              label="Email Address"
              name="credentials.email"
              defaultValue={MyUserData?.credentials?.email || ""}
              register={register}
              placeholder="Enter your Email Address"
              rules={{ required: "Email Address is required." }}
              type="email"
              errors={errors}
            />
          </div>

          {/* Phone Number */}
          <div className="md:col-span-2">
            <Shared_Input
              label="Phone Number"
              name="personal.phone"
              defaultValue={MyUserData?.personal?.phone || ""}
              register={register}
              placeholder="Enter your Phone Number"
              rules={{ required: "Phone Number is required." }}
              type="text"
              errors={errors}
            />
          </div>

          {/* Buttons */}
          <div className='md:col-span-2 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4'>
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
              <span className="text-sm sm:text-base">Update Profile</span>
            </Shared_Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit_My_Profile_Modal;