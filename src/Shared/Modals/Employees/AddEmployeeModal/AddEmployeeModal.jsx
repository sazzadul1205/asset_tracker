// React Components
import React, { useRef, useState } from "react";

// React Hook Form
import { useForm } from "react-hook-form";

// Icons
import { ImCross } from "react-icons/im";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";

// Hooks
import { useToast } from "@/Hooks/Toasts";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { useImageUpload } from "@/Hooks/useImageUpload";

const AddEmployeeModal = ({
  UserEmail,
  RefetchAll,
}) => {
  const { success } = useToast();
  const imageInputRef = useRef();
  const axiosPublic = useAxiosPublic();
  const { uploadImage } = useImageUpload();

  // States 
  const [isOpen, setIsOpen] = useState(false);
  const [iconImage, setIconImage] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  // Default Icon
  const placeholderIcon = "https://i.ibb.co/9996NVtk/info-removebg-preview.png";

  // Form Handlers
  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Handle Close
  const handleClose = () => {
    reset();
    setFormError(null);
    setIconImage(null);
    setSelectedColor("#ffffff");
    imageInputRef.current?.resetToDefault?.();
    document.getElementById("Add_Employee_Modal")?.close();
  };

  // Handle Submit
  const onSubmit = async (data) => {
    setFormError(null);
    setIsLoading(true);

    // Upload Icon
    try {
      if (!UserEmail) {
        setFormError("User email not found. Please log in.");
        return;
      }

      let uploadedImageUrl = placeholderIcon;

      if (iconImage) {
        const url = await uploadImage(iconImage);
        if (!url) {
          setFormError("Failed to upload icon image.");
          return;
        }
        uploadedImageUrl = url;
      }

      const payload = {
        ...data,
        selectedColor,
        iconImage: uploadedImageUrl,
        depreciation_rate: Number(data.depreciation_rate),
        warranty: Number(data.warranty),
      };

      const response = await axiosPublic.post("/AssetCategory", payload);

      if (response.status === 201 || response.status === 200) {
        success("Asset category created successfully!");
        RefetchAll?.();
        handleClose();
      } else {
        setFormError(response.data?.message || "Failed to create category");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setFormError(err.response?.data?.message || "Failed to submit form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="Add_Employee_Modal"
      className="modal-box w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
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
          name="full_name"
          type="email"
          register={register}
          placeholder="Enter Email Address"
          rules={{ required: "Email is required" }}
          error={errors.full_name}
        />

        {/* Employee Id */}
        <SharedInput
          label="Employee ID"
          name="employee_id"
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

        {/* Department */}
        <SharedInput
          label="Department"
          name="department"
          register={register}
          placeholder="Enter Department"
          rules={{ required: "Department is required" }}
          error={errors.department}
        />

        {/* Position */}
        <SharedInput
          label="Position"
          name="position"
          register={register}
          placeholder="Enter Position"
          rules={{ required: "Position is required" }}
          error={errors.position}
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
            { value: "admin", label: "Admin" },
            { value: "manager", label: "Manager" },
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
          register={register}
          placeholder="Enter Password"
          rules={{ required: "Password is required" }}
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
                "Create Asset Category"
              )}
            </span>
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddEmployeeModal;