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
import { FiX, FiUser, FiMail, FiKey, FiCalendar, FiPhone, FiBriefcase, FiUsers, FiLock } from 'react-icons/fi';
import { FaIdCard, FaBuilding, FaUserCheck, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

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
  const [passwordChanged, setPasswordChanged] = useState(false);

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

  // Role options
  const roleOptions = [
    { label: "Manager", value: "Manager" },
    { label: "Admin", value: "Admin" },
    { label: "Employee", value: "Employee" },
  ];

  // Status options
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "On Leave", value: "on_leave" },
    { label: "Suspended", value: "suspended" },
    { label: "Terminated", value: "terminated" },
  ];


  // Check if user is admin or manager (case-insensitive)
  const userRole = selectedUser?.employment?.role || '';
  const isAdmin = userRole.toLowerCase() === "admin";
  const isManager = userRole.toLowerCase() === "manager";
  const isPrivilegedUser = isAdmin || isManager;

  // Preload data
  useEffect(() => {
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
        status: selectedUser?.personal?.status || 'active',
        department: selectedUser?.employment?.departmentId || '',
        position: selectedUser?.employment?.position || '',
        role: selectedUser?.employment?.role || 'Employee',
      },
      credentials: {
        email: selectedUser?.credentials?.email || '',
        password: '',
      },
    });

    setPasswordChanged(false);
  }, [selectedUser, reset]);

  // Watch password changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'credentials.password') {
        setPasswordChanged(!!value.credentials?.password);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Close modal
  const handleClose = () => {
    reset();
    setGlobalError('');
    setSelectedUser(null);
    setPasswordChanged(false);
    document.getElementById('Edit_User_Modal')?.close();
  };

  // Submit Handler
  const onSubmit = async (data) => {
    setGlobalError("");
    setLoading(true);

    try {
      if (!selectedUser?.personal?.userId) {
        setGlobalError("User ID is missing. Cannot update user.");
        setLoading(false);
        return;
      }

      // Prevent role change for admin/manager (case-insensitive)
      if (isPrivilegedUser) {
        const currentRole = selectedUser?.employment?.role || '';
        const newRole = data.personal.role || '';

        if (currentRole.toLowerCase() !== newRole.toLowerCase()) {
          setGlobalError(`Cannot change role for ${isAdmin ? 'Admin' : 'Manager'} users. Please contact system administrator.`);
          setLoading(false);
          return;
        }
      }

      // Build payload
      const payload = {
        personal: {
          name: data.personal.name?.trim() || "",
          phone: data.personal.phone?.trim() || "",
          hireDate: data.personal.hireDate
            ? new Date(data.personal.hireDate)
            : null,
          status: data.personal.status || "active",
        },
        credentials: {
          email: data.credentials.email?.trim() || "",
          // Only include password if user enters a new one
          ...(data.credentials.password ? { password: data.credentials.password } : {}),
        },
        employment: {
          departmentId: data.personal.department || "",
          position: data.personal.position || "",
          role: isPrivilegedUser ? selectedUser?.employment?.role : data.personal.role, // Keep original role for privileged users
          lastUpdatedBy: session?.user?.userId || "SYSTEM",
        },
        metadata: {
          updatedAt: new Date(),
        },
      };

      // PATCH request to update user
      const response = await axiosPublic.patch(
        `/users/${selectedUser.personal.userId}`,
        payload
      );

      if (response.status === 200) {
        success("User updated successfully!");
        handleClose();
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

  return (
    <div className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Edit User</h3>
          <p className="text-gray-500 text-sm mt-1">
            Update user details for {selectedUser?.personal?.name || "this user"}
            {isPrivilegedUser && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {isAdmin ? 'Admin' : 'Manager'}
              </span>
            )}
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

      {/* Role Restriction Notice */}
      {isPrivilegedUser && (
        <div className="mb-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <FaShieldAlt className="text-yellow-500 text-lg mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800">
                {isAdmin ? 'Admin User Protection' : 'Manager User Protection'}
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {isAdmin
                  ? 'Admin users have elevated system permissions. Their role cannot be changed through this interface. Please contact system administrator for role modifications.'
                  : 'Manager users have department management capabilities. Their role cannot be changed to prevent disruption to department operations.'}
              </p>
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
                type="text"
                errors={errors}
                fullWidth
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
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
                disabled={isAdmin}
              />
              {isAdmin && (
                <p className="text-xs text-gray-500 mt-1">Admin department cannot be changed</p>
              )}
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
                disabled={isAdmin}
              />
              {watch("personal.department") && !selectedDept && (
                <p className="text-xs text-yellow-600 mt-1">
                  No positions available for selected department
                </p>
              )}
              {isAdmin && (
                <p className="text-xs text-gray-500 mt-1">Admin position cannot be changed</p>
              )}
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-gray-400 w-4 h-4" />
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  {isPrivilegedUser && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Protected
                    </span>
                  )}
                </div>
                {isPrivilegedUser && (
                  <span className="text-xs text-gray-500">
                    Role cannot be changed
                  </span>
                )}
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
                disabled={isPrivilegedUser}
                value={selectedUser?.employment?.role || 'Employee'} // Force original value
              />
              <div className="flex gap-4 mt-3">
                {roleOptions.map((role) => (
                  <div key={role.value} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${role.value === "Admin" ? "bg-red-500" :
                      role.value === "Manager" ? "bg-blue-500" :
                        "bg-green-500"
                      }`}></div>
                    <span className={`text-xs ${role.value === selectedUser?.employment?.role ? 'font-semibold' : 'text-gray-600'}`}>
                      {role.label}
                    </span>
                    {role.value === selectedUser?.employment?.role && (
                      <span className="text-xs text-gray-500">(Current)</span>
                    )}
                  </div>
                ))}
              </div>
              {isPrivilegedUser && (
                <p className="text-xs text-gray-500 mt-2">
                  {isAdmin
                    ? 'Admin roles can only be modified by system administrators.'
                    : 'Manager roles are protected to maintain department structure.'}
                </p>
              )}
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiKey className="text-gray-400 w-4 h-4" />
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  {isAdmin && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Restricted
                    </span>
                  )}
                </div>
                {!passwordChanged && !isAdmin && (
                  <span className="text-xs text-gray-500">Leave empty to keep current password</span>
                )}
                {isAdmin && (
                  <span className="text-xs text-red-600 font-medium">Admin password changes restricted</span>
                )}
              </div>

              {isAdmin ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FiLock className="text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Password Change Restricted</p>
                      <p className="text-xs text-red-600 mt-1">
                        Admin passwords can only be changed through the admin security settings
                        or by contacting system administrator.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Shared_Input
                    name="credentials.password"
                    register={register}
                    placeholder="Enter new password (optional)"
                    type="password"
                    errors={errors}
                    fullWidth
                    disabled={isAdmin}
                  />
                  {passwordChanged && (
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
                  )}
                </>
              )}
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
              Update User
            </Shared_Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Edit_User_Modal;