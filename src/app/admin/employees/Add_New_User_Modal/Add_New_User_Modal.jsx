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
import { FiX, FiUser, FiMail, FiKey, FiCalendar, FiPhone, FiBriefcase, FiUsers } from 'react-icons/fi';
import { FaIdCard, FaBuilding, FaUserCheck } from 'react-icons/fa';

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

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

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

  // Role options
  const roleOptions = [
    { label: "Employee", value: "Employee" }
  ];

  // Status options
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "On Leave", value: "on_leave" },
    { label: "Suspended", value: "suspended" },
    { label: "Terminated", value: "terminated" },
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
      const userId = data.personal?.userId?.trim() || `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Prepare payload
      const payload = {
        personal: {
          name: data.personal?.name?.trim() || "",
          phone: data.personal?.phone?.trim() || "",
          hireDate: data.personal?.hireDate
            ? new Date(data.personal.hireDate)
            : null,
          status: data.personal?.status || "active",
          userId,
        },
        credentials: {
          email: data.credentials?.email?.trim() || "",
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
      if (response.status === 200 || response.status === 201) {
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
    <div className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Add New User</h3>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details to create a new user account
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300 cursor-pointer"
          aria-label="Close modal"
        >
          <FiX className="text-xl text-gray-600" />
        </button>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{globalError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Personal Information Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-2 h-5 rounded-full"></span>
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiUser className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Full Name</label>
              </div>
              <Shared_Input
                name="personal.name"
                register={register}
                placeholder="e.g. John Doe"
                rules={{ required: "Full Name is required." }}
                type="text"
                errors={errors}
                fullWidth
              />
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiMail className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Email Address</label>
              </div>
              <Shared_Input
                name="credentials.email"
                register={register}
                placeholder="e.g. john.doe@company.com"
                rules={{ required: "Email Address is required." }}
                type="email"
                errors={errors}
                fullWidth
              />
            </div>

            {/* Employee ID */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaIdCard className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Employee ID</label>
              </div>
              <Shared_Input
                name="personal.userId"
                register={register}
                placeholder="e.g. USR-0001"
                rules={{ required: "Employee ID is required." }}
                type="text"
                errors={errors}
                fullWidth
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
            </div>

            {/* Phone Number */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiPhone className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
              </div>
              <Shared_Input
                name="personal.phone"
                register={register}
                placeholder="e.g. +1 (555) 123-4567"
                rules={{ required: "Phone Number is required." }}
                type="tel"
                errors={errors}
                fullWidth
              />
            </div>

            {/* Hire Date */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Hire Date</label>
              </div>
              <Controller
                control={control}
                name="personal.hireDate"
                rules={{ required: "Hire Date is required." }}
                render={({ field }) => (
                  <Shared_Input
                    type="date"
                    placeholder="Select hire date"
                    errors={errors}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.personal?.hireDate}
                    fullWidth
                  />
                )}
              />
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaUserCheck className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Status</label>
              </div>
              <Shared_Input
                name="personal.status"
                register={register}
                placeholder="Select user status"
                rules={{ required: "Status is required." }}
                type="select"
                options={statusOptions}
                errors={errors}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Employment Details Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
            Employment Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaBuilding className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Department</label>
              </div>
              <Shared_Input
                name="personal.department"
                register={register}
                placeholder="Select department"
                rules={{ required: "Department is required." }}
                type="select"
                options={deptOptions}
                errors={errors}
                fullWidth
              />
            </div>

            {/* Position */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiBriefcase className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Position</label>
              </div>
              <Shared_Input
                name="personal.position"
                register={register}
                placeholder="Select position"
                rules={{ required: "Position is required." }}
                type="select"
                options={positionOptions}
                errors={errors}
                fullWidth
              />
              {watch("personal.department") && !selectedDept && (
                <p className="text-xs text-yellow-600 mt-1">
                  No positions available for selected department
                </p>
              )}
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <FiUsers className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Role</label>
              </div>
              <Shared_Input
                name="personal.role"
                register={register}
                placeholder="Select user role"
                rules={{ required: "Role is required." }}
                type="select"
                options={roleOptions}
                errors={errors}
                fullWidth
              />
              <div className="flex gap-4 mt-3">
                {roleOptions.map((role) => (
                  <div key={role.value} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${role.value === "Admin" ? "bg-red-500" :
                      role.value === "Manager" ? "bg-blue-500" :
                        "bg-green-500"
                      }`}></div>
                    <span className="text-xs text-gray-600">{role.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account Credentials Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
            Account Credentials
          </h4>
          <div className="space-y-4">
            {/* Password */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiKey className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Password</label>
              </div>
              <Shared_Input
                name="credentials.password"
                register={register}
                placeholder="Enter a secure password"
                rules={{
                  required: "Password is required.",
                  minLength: { value: 8, message: "Password must be at least 8 characters" }
                }}
                type="password"
                errors={errors}
                fullWidth
              />
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${watch("credentials.password")?.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <span>8+ characters</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(watch("credentials.password")) ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <span>Uppercase letter</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(watch("credentials.password")) ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <span>Lowercase letter</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(watch("credentials.password")) ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <span>Number</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-4 md:-mx-6 px-4 md:px-6 pb-2 md:pb-0">
          <div className="flex flex-col-reverse md:flex-row md:items-center justify-end gap-3">
            {/* Cancel */}
            <Shared_Button
              type="button"
              onClick={handleClose}
              variant="ghost"
              className="w-full md:w-auto"
            >
              Cancel
            </Shared_Button>

            {/* Submit */}
            <Shared_Button
              type="submit"
              variant="primary"
              loading={isSubmitting || loading}
              className="w-full md:w-auto"
            >
              Create New User
            </Shared_Button>
          </div>
        </div>
      </form>
    </div>

  );
};

export default Add_New_User_Modal;