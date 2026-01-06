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
      id="Change_text_Modal"
      className="modal-box w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Title */}
        <h3 className="tracking-tight text-xl font-semibold text-gray-900">
          Edit Profile
        </h3>

        {/* Close Button */}
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
      <div className='pt-4' >
        {/* Header */}
        <div className="flex items-center gap-2">
          <FaRegUser className="text-xl" />
          <h3 className="font-semibold text-lg">Personal Information</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 pt-4">

          {/* Full Name */}
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

          {/* Employee ID */}
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

          {/* Email */}
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

          {/* Phone Number */}
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

          {/* Buttons */}
          <div className='col-span-2 justify-end flex items-center gap-2' >
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
              Update Profile
            </Shared_Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit_My_Profile_Modal;