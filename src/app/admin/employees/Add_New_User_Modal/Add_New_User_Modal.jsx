// src/app/admin/employees/Add_New_User_Modal/Add_New_User_Modal.jsx

// React Components
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

// Hooks
import { useToast } from '@/hooks/useToast';
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Shared
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';

// Icons
import { ImCross } from 'react-icons/im';

const Add_New_User_Modal = ({
  session,
  RefetchAll,
  departmentOptionsData,
}) => {
  const { success } = useToast();
  const axiosPublic = useAxiosPublic();

  // States
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // React Hook Form
  const {
    reset,
    watch,
    control,
    register,
    setError,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm();

  // Department options
  const deptOptions = [
    { label: "Unassigned", value: "unassigned" },
    ...(departmentOptionsData?.map((dept) => ({
      label: dept?.info?.name,
      value: dept?.departmentId,
    })) || []),
  ];

  // Position options based on selected department
  const selectedDept = departmentOptionsData?.find(
    (dept) => dept?.departmentId === watch("personal.department")
  );

  // Position options
  const positionOptions = [
    { label: "Unassigned", value: "unassigned" },
    ...(selectedDept?.positions?.map((pos) => ({
      label: pos?.position_name,
      value: pos?.position_name,
    })) || []),
  ];



  // Close modal
  const handleClose = () => {
    reset();
    setGlobalError("");
    document.getElementById("Add_New_User_Modal")?.close();
  };

  // Submit Handler
  const onSubmit = async (data) => {
    setGlobalError("");
    setLoading(true);

    try {
      // Generate userId if not provided
      const userId = data.personal?.userId?.trim() || `USR-${Date.now()}`;

      // Prepare payload
      const payload = {
        personal: {
          name: data.personal?.name || "",
          phone: data.personal?.phone || "",
          hireDate: data.personal?.hireDate
            ? new Date(data.personal.hireDate)
            : null,
          status: data.personal?.status || "active",
          userId,
        },
        credentials: {
          email: data.credentials?.email || "",
          password: data.credentials?.password || "",
        },
        employment: {
          departmentId: data.personal?.department || "",
          position: data.personal?.position || "",
          role: data.personal?.role || "Employee",
          lastUpdatedBy: userId,
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      // Send request
      const response = await axiosPublic.post("/users", payload);

      // Success
      if (response.status === 200) {
        success("User added successfully!");
        handleClose();
        RefetchAll();
      }
    } catch (error) {
      console.error("[Axios Public] Error adding user:", error);

      // Get server error message
      const serverError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        error?.error ||
        "Something went wrong. Please try again.";

      setGlobalError(serverError);

      // Highlight fields based on server message
      if (serverError.toLowerCase().includes("email")) {
        setError("credentials.email", { type: "server", message: serverError });
      }
      if (serverError.toLowerCase().includes("name")) {
        setError("personal.name", { type: "server", message: serverError });
      }
      if (serverError.toLowerCase().includes("phone")) {
        setError("personal.phone", { type: "server", message: serverError });
      }
      if (serverError.toLowerCase().includes("user id")) {
        setError("personal.userId", { type: "server", message: serverError });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="Add_New_User_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="tracking-tight text-xl font-semibold text-gray-900">Add New User</h3>
        <button type="button" onClick={handleClose} className="hover:text-red-500 transition-colors duration-300 cursor-pointer">
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
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 pt-4">
        {/* Full Name */}
        <Shared_Input
          label="Full Name"
          name="personal.name"
          register={register}
          placeholder="Enter your Full Name"
          rules={{ required: "Full Name is required." }}
          type="text"
          errors={errors}
        />

        {/* Email */}
        <Shared_Input
          label="Email Address"
          name="credentials.email"
          register={register}
          placeholder="Enter your Email Address"
          rules={{ required: "Email Address is required." }}
          type="email"
          errors={errors}
        />

        {/* Employee ID */}
        <Shared_Input
          label="Employee ID"
          name="personal.userId"
          register={register}
          placeholder="Enter your Employee ID"
          rules={{ required: "Employee ID is required." }}
          type="text"
          errors={errors}
        />

        {/* Phone Number */}
        <Shared_Input
          label="Phone Number"
          name="personal.phone"
          register={register}
          placeholder="Enter your Phone Number"
          rules={{ required: "Phone Number is required." }}
          type="text"
          errors={errors}
        />

        {/* Department */}
        <Shared_Input
          label="Department"
          name="personal.department"
          register={register}
          placeholder="Select Department"
          rules={{ required: "Department is required." }}
          type="select"
          options={deptOptions}
          errors={errors}
        />

        {/* Position */}
        <Shared_Input
          label="Position"
          name="personal.position"
          register={register}
          placeholder="Select Position"
          rules={{ required: "Position is required." }}
          type="select"
          options={positionOptions}
          errors={errors}
        />

        {/* Hire Date */}
        <Controller
          control={control}
          name="personal.hireDate"
          rules={{ required: "Hire Date is required." }}
          render={({ field }) => (
            <Shared_Input
              label="Hire Date"
              type="date"
              placeholder="Select your Hire Date"
              errors={errors}
              value={field.value}
              onChange={field.onChange}
              errorMessage={errors.personal?.hireDate?.message}
            />
          )}
        />

        {/* Status */}
        <Shared_Input
          label="Status"
          name="personal.status"
          register={register}
          placeholder="Select Status"
          rules={{ required: "Status is required." }}
          type="select"
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "On Leave", value: "on_leave" },
            { label: "Suspended", value: "suspended" },
            { label: "Terminated", value: "terminated" },
          ]}
          errors={errors}
        />

        {/* Role */}
        <Shared_Input
          label="Role"
          name="personal.role"
          register={register}
          placeholder="Select Role"
          rules={{ required: "Role is required." }}
          type="select"
          options={[
            { label: "Manager", value: "Manager" },
            { label: "Employee", value: "Employee" },
          ]}
          errors={errors}
        />

        {/* Password */}
        <Shared_Input
          label="Password"
          name="credentials.password"
          register={register}
          placeholder="Enter your Password"
          rules={{ required: "Password is required." }}
          type="password"
          errors={errors}
        />

        {/* Buttons */}
        <div className='col-span-2 justify-end flex items-center gap-2 pt-2'>
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
            Create New User
          </Shared_Button>
        </div>
      </form>
    </div>
  );
};

export default Add_New_User_Modal;
