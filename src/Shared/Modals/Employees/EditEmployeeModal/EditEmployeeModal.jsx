// React Components
import React, { useEffect, useState } from "react";

// React Hook Form
import { useForm } from "react-hook-form";

// Icons
import { ImCross } from "react-icons/im";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";

// Hooks
import { useToast } from "@/Hooks/Toasts";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const EditEmployeeModal = ({
  RefetchAll,
  UserEmail,
  selectedEmployee,
  setSelectedEmployee,
  DepartmentsBasicInfoData,
}) => {
  const { success } = useToast();
  const axiosPublic = useAxiosPublic();

  // States
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [positionOptions, setPositionOptions] = useState([]);

  // Form
  const {
    reset,
    watch,
    control,
    setValue,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Watchers
  const watchedDepartment = watch("department", null); // default null

  // Position Options
  useEffect(() => {
    if (watchedDepartment && watchedDepartment !== "unAssigned") {
      const selectedDept = DepartmentsBasicInfoData.find(
        (d) => d.dept_id === watchedDepartment
      );

      if (selectedDept && selectedDept.positions) {
        setPositionOptions([
          { label: "Unassigned", value: "unAssigned" },
          ...selectedDept.positions
            .filter((pos) => pos.position_name !== "Manager") // exclude Manager
            .map((pos) => ({
              label: pos.position_name,
              value: pos.position_name,
            })),
        ]);
      } else {
        setPositionOptions([{ label: "Unassigned", value: "unAssigned" }]);
      }

      // Reset selected position when department changes
      setValue("position", "unAssigned");
    } else {
      setPositionOptions([{ label: "Unassigned", value: "unAssigned" }]);
      setValue("position", "unAssigned");
    }
  }, [watchedDepartment, DepartmentsBasicInfoData, setValue]);

  // Pre-fill form when selectedEmployee changes
  useEffect(() => {
    if (selectedEmployee) {
      // Set all fields
      reset({
        full_name: selectedEmployee.full_name || "",
        email: selectedEmployee.email || "",
        employee_id: selectedEmployee.employee_id || "",
        phone: selectedEmployee.phone || "",
        department: selectedEmployee.department || "unAssigned",
        position: selectedEmployee.position || "unAssigned",
        hire_date: selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date) : "",
        status: selectedEmployee.status || "active",
        access_level: selectedEmployee.access_level || "unAssigned",
        password: "", // optional, leave blank to reset password
      });

      // Set position options based on department
      const dept = DepartmentsBasicInfoData.find(
        (d) => d.dept_id === selectedEmployee.department
      );

      if (dept && dept.positions) {
        setPositionOptions([
          { label: "Unassigned", value: "unAssigned" },
          ...dept.positions
            .filter((pos) => pos.position_name !== "Manager") // exclude Manager
            .map((pos) => ({
              label: pos.position_name,
              value: pos.position_name,
            })),
        ]);
      } else {
        setPositionOptions([{ label: "Unassigned", value: "unAssigned" }]);
      }
    }
  }, [selectedEmployee, DepartmentsBasicInfoData, reset]);

  // Close modal
  const handleClose = () => {
    reset();
    setFormError(null);
    setPositionOptions([]);
    setSelectedEmployee(null);
    document.getElementById("Edit_Employee_Modal")?.close();
  };

  // Submit handler (EMPLOYEE UPDATE)
  const onSubmit = async (data) => {
    setFormError(null);
    setIsLoading(true);

    try {
      if (!UserEmail) {
        setFormError("Session error: User email missing.");
        return;
      }

      if (!selectedEmployee?.employee_id) {
        setFormError("No employee selected for update.");
        return;
      }

      // Build employee payload
      const payload = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        department: data.department || "unAssigned",
        position: data.position || "unAssigned",
        hire_date: data.hire_date,
        status: data.status,
        access_level: data.access_level || "unAssigned",
        password: data.password || undefined, // only send if changed
        updated_by: UserEmail,
      };

      // Remove password if it's empty (so it won't overwrite existing)
      if (!payload.password) delete payload.password;

      // Send PUT request to update the employee
      const response = await axiosPublic.put(
        `/Users/${selectedEmployee.employee_id}`,
        payload
      );

      if (response.status === 200) {
        success("Employee updated successfully.");
        RefetchAll?.();
        handleClose();
      } else {
        setFormError(response.data?.message || "Failed to update employee.");
      }
    } catch (err) {
      console.error("Employee update error:", err);
      const serverError =
        err.response?.data?.message || err.message || "Failed to update employee.";
      setFormError(serverError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="Edit_Employee_Modal"
      className="modal-box w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">
          Edit Employee
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
        className="space-y-3 grid grid-cols-2 gap-4"
      >
        {/* Full Name */}
        <SharedInput
          label="Full Name"
          name="full_name"
          register={register}
          placeholder="Enter Full Name"
          rules={{ required: "Full Name is required" }}
          error={errors.full_name}
        />

        {/* Email */}
        <SharedInput
          label="Email"
          name="email"
          type="email"
          register={register}
          placeholder="Enter Email Address"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          }}
          error={errors.email}
        />

        {/* Employee Id */}
        <SharedInput
          label="Employee ID"
          name="employee_id"
          readOnly={true}
          register={register}
          placeholder="Enter Employee ID"
          rules={{ required: "Employee ID is required" }}
          error={errors.employee_id}
        />

        {/* Phone Number */}
        <SharedInput
          label="Phone Number"
          name="phone"
          type="tel"
          register={register}
          placeholder="Enter Phone Number"
          rules={{ required: "Phone Number is required" }}
          error={errors.phone}
        />

        {/* Department Select */}
        <SharedInput
          label="Department"
          name="department"
          type="select"
          register={register}
          placeholder="Select Department"
          options={[
            { label: "Unassigned", value: "unAssigned" },
            ...DepartmentsBasicInfoData.map(d => ({
              label: d.department_name,
              value: d.dept_id
            }))
          ]}
          rules={{ required: "Department is required" }}
        />

        {/* Position */}
        <SharedInput
          label="Position"
          name="position"
          type="select"
          register={register}
          placeholder="Select Position"
          options={positionOptions} // dynamically includes Unassigned
          rules={{ required: "Position is required" }}
          disabled={!positionOptions.length}
        />

        {/* Hire Date */}
        <SharedInput
          label="Hire Date"
          name="hire_date"
          type="date"
          dateLimit=""
          className="w-full"
          control={control}
          register={register}
          rules={{ required: "Hire Date is required" }}
          error={errors.hire_date}
        />

        {/* Status */}
        <SharedInput
          label="Status"
          name="status"
          type="select"
          register={register}
          placeholder="Select Status"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "pending", label: "Pending" },
            { value: "archived", label: "Archived" },
          ]}
          rules={{ required: "Status is required" }}
          error={errors.status}
        />

        {/* Access Level */}
        <SharedInput
          label="Access Level"
          name="access_level"
          type="select"
          register={register}
          placeholder="Select Level"
          options={[
            // { value: "admin", label: "Admin" },
            // { value: "manager", label: "Manager" },
            { value: "employee", label: "Employee" },
            { value: "intern", label: "Intern" },
            { value: "guest", label: "Guest" },
            { value: "supervisor", label: "Supervisor" },
          ]}
          rules={{ required: "Access Level is required" }}
          error={errors.access_level}
        />

        {/* Password */}
        <SharedInput
          label="Password"
          name="password"
          type="password"
          readOnly={true}
          register={register}
          placeholder="Enter Password"
          error={errors.password}
        />

        {/* Buttons */}
        <div className="col-span-2 flex items-center justify-end gap-3 mt-6">
          {/* Cancel */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className={`px-5 h-11 font-semibold rounded-lg border transition-all duration-200 
               ${isSubmitting || isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98]"
              }`}
          >
            Cancel
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`px-6 h-11 font-semibold text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center 
               ${isSubmitting || isLoading
                ? "bg-blue-400 cursor-not-allowed pointer-events-none"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
              }`}
          >
            <span className="flex items-center justify-center w-48">
              {isSubmitting || isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Edit Employee"
              )}
            </span>
          </button>

        </div>
      </form>
    </div>
  );
};

export default EditEmployeeModal;