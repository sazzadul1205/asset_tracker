// src/app/admin/employees/Edit_User_Modal/Edit_User_Modal.jsx

// React Components
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

// Hooks
import { useToast } from '@/hooks/useToast';
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Shared
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';

// Icons
import { ImCross } from 'react-icons/im';

const Edit_User_Modal = ({
  session,
  RefetchAll,
  selectedUser,
  setSelectedUser,
  departmentOptionsData,
}) => {
  const { success } = useToast();
  const axiosPublic = useAxiosPublic();

  // States
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

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

  // Preload data
  useEffect(() => {
    // Check if user is selected
    if (!selectedUser) return;

    // Preload data
    reset({
      personal: {
        name: selectedUser?.personal?.name || '',
        phone: selectedUser?.personal?.phone || '',
        userId: selectedUser?.personal?.userId || '',
        hireDate: selectedUser?.personal?.hireDate
          ? new Date(selectedUser.personal.hireDate).toISOString().split('T')[0]
          : '',
        status: selectedUser?.personal?.status || '',
        department: selectedUser?.employment?.departmentId || '',
        position: selectedUser?.employment?.position || '',
        role: selectedUser?.employment?.role || '',
      },
      credentials: {
        email: selectedUser?.credentials?.email || '',
        password: '', // never preload passwords
      },
    });
  }, [selectedUser, reset]);

  // Close modal
  const handleClose = () => {
    reset();
    setGlobalError('');
    setSelectedUser(null);
    document.getElementById('Edit_User_Modal')?.close();
  };

  // Submit Handler
  const onSubmit = async (data) => {
    setGlobalError("");
    setLoading(true);

    // Check if user is selected
    try {
      if (!selectedUser?.personal?.userId) {
        setGlobalError("User ID is missing. Cannot update user.");
        setLoading(false);
        return;
      }

      // Build payload
      const payload = {
        personal: {
          name: data.personal.name,
          phone: data.personal.phone,
          hireDate: data.personal.hireDate ? new Date(data.personal.hireDate) : null,
          status: data.personal.status,
        },
        credentials: {
          email: data.credentials.email,
          // Only include password if user enters a new one
          ...(data.credentials.password ? { password: data.credentials.password } : {}),
        },
        employment: {
          departmentId: data.personal.department,
          position: data.personal.position,
          role: data.personal.role,
          lastUpdatedBy: session?.user?.userId || "SYSTEM",
        },
      };

      // PATCH request to update user
      const response = await axiosPublic.patch(
        `/users/${selectedUser.personal.userId}`,
        payload
      );

      if (response.status === 200) {
        handleClose();
        success("User updated successfully.");
        RefetchAll();
      }
    } catch (error) {
      console.error("[Axios Public] Error updating user:", error);

      // Extract server error message
      const serverError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        error?.error ||
        "Something went wrong. Please try again.";

      setGlobalError(serverError);

      // Highlight fields if server returned field-specific errors
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

  // Check if user is admin
  const isAdmin = selectedUser?.employment?.role === "admin";

  return (
    <div
      id="Edit_User_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="tracking-tight text-xl font-semibold text-gray-900">Edit User</h3>
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

      {/* Role Warning */}
      {selectedUser?.employment?.role === "manager" &&
        <div className='bg-red-100 border border-red-500 rounded-lg p-2'>
          <p className="text-sm text-red-600" >Please note: Try not to manually change the role of a manager.</p>
        </div>
      }

      {/* Role Warning */}
      {selectedUser?.employment?.role === "admin" &&
        <div className='bg-red-100 border border-red-500 rounded-lg p-2'>
          <p className="text-sm text-red-600" >Please note: Try not to manually change the role of an admin.</p>
        </div>
      }

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 pt-4">
        {/* Full Name */}
        <Shared_Input
          label="Full Name"
          idPrefix="edit"
          name="personal.name"
          register={register}
          placeholder="Enter your Full Name"
          rules={{ required: "Full Name is required." }}
          autoComplete="name"
          type="text"
          errors={errors}
        />

        {/* Email */}
        <Shared_Input
          label="Email Address"
          idPrefix="edit"
          name="credentials.email"
          register={register}
          placeholder="Enter your Email Address"
          rules={{ required: "Email Address is required." }}
          autoComplete="email"
          type="email"
          errors={errors}
        />

        {/* Employee ID */}
        <Shared_Input
          label="Employee ID"
          idPrefix="edit"
          name="personal.userId"
          register={register}
          placeholder="Enter your Employee ID"
          rules={{ required: "Employee ID is required." }}
          autoComplete="userId"
          type="text"
          errors={errors}
          disabled
        />

        {/* Phone Number */}
        <Shared_Input
          label="Phone Number"
          idPrefix="edit"
          name="personal.phone"
          register={register}
          placeholder="Enter your Phone Number"
          rules={{ required: "Phone Number is required." }}
          autoComplete="phone"
          type="text"
          errors={errors}
        />

        {/* Department */}
        <Shared_Input
          label="Department"
          idPrefix="edit"
          name="personal.department"
          register={register}
          placeholder="Select Department"
          rules={{ required: "Department is required." }}
          autoComplete="department"
          type="select"
          options={deptOptions}
          errors={errors}
          disabled={isAdmin}
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
          disabled={isAdmin}
        />

        {/* Hire Date */}
        <Controller
          control={control}
          name="personal.hireDate"
          rules={{ required: "Hire Date is required." }}
          render={({ field }) => (
            <Shared_Input
              label="Hire Date"
              idPrefix="edit"
              type="date"
              autoComplete="hireDate"
              placeholder="Select your Hire Date"
              errors={errors}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* Status */}
        <Shared_Input
          label="Status"
          idPrefix="edit"
          name="personal.status"
          register={register}
          placeholder="Select Status"
          rules={{ required: "Status is required." }}
          autoComplete="status"
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
          idPrefix="edit"
          name="personal.role"
          register={register}
          placeholder="Select Role"
          rules={{ required: "Role is required." }}
          autoComplete="role"
          type="select"
          options={[
            { label: "Manager", value: "Manager" },
            { label: "Employee", value: "Employee" },
          ]}
          errors={errors}
          disabled={isAdmin}
        />

        {/* Password */}
        <Shared_Input
          label="Password"
          idPrefix="edit"
          name="credentials.password"
          register={register}
          placeholder="Enter your Password"
          type="password"
          autoComplete="new-password"
          errors={errors}
          disabled
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
            Update User
          </Shared_Button>
        </div>
      </form>

    </div>
  );
};

export default Edit_User_Modal;