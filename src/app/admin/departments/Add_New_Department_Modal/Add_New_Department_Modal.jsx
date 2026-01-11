// src/app/admin/departments/Add_New_Department_Modal/Add_New_Department_Modal.jsx

// React Components
import { Controller, useForm } from 'react-hook-form';
import React, { useState } from 'react';

// Hooks
import { useToast } from '@/hooks/useToast';
import useAxiosPublic from '@/hooks/useAxiosPublic';
import { useImageUpload } from '@/hooks/useImageUpload';

// Shared
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Shared_Input_Image from '@/Shared/Shared_Input_Image/Shared_Input_Image';
import Shared_Multi_Field_Input from '@/Shared/Shared_Multi_Field_Input/Shared_Multi_Field_Input';

// Icons
// Icons
import { FiX, FiUpload, FiImage, FiBriefcase, FiUsers, FiDollarSign, FiInfo, FiHome, FiUser, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { FaPalette, FaCalendarAlt, FaBuilding } from "react-icons/fa";
import { BsFillPaletteFill } from 'react-icons/bs';
import Image from 'next/image';

const Add_New_Department_Modal = ({
  session,
  RefetchAll,
  managerOptionsData,
}) => {
  const axiosPublic = useAxiosPublic();
  const { success, error } = useToast();
  const { uploadImage, error: imageError } = useImageUpload();

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [iconImage, setIconImage] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#e2e8f0");
  const [placeholderIcon] = useState("https://i.ibb.co/9996NVtk/info-removebg-preview.png");

  // Global states
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Inside component, after useForm initialization
  const {
    reset,
    control,
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Transform into { label, value } format for the select
  const managerOptions = [
    { label: "Unassigned", value: "unassigned" },
    ...(managerOptionsData?.map((user) => (
      {
        label: user.personal.name,
        value: user.personal.userId,
      }))
      || []),
  ];

  // Close modal handler
  const handleClose = () => {
    reset();
    setLoading(false);
    setIsOpen(false);
    setIconImage(null);
    setGlobalError("");
    setIconPreview(null);
    setSelectedColor("#e2e8f0");
    document.getElementById("Add_New_Department_Modal")?.close();
  }

  // Submit Handler (react-hook-form)
  const onSubmit = async (data) => {
    setGlobalError("");
    setLoading(true);

    try {
      // Generate Department ID if not provided
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const departmentId = data.departmentId?.trim() || `DEP-${Date.now()}-${randomSuffix}`;

      // Upload Icon
      let iconUrl = placeholderIcon;
      if (iconImage) {
        const uploadedUrl = await uploadImage(iconImage);
        if (uploadedUrl) iconUrl = uploadedUrl;
      }

      // Ensure manager.userId is always string
      const managerUserId = data.manager?.userId || "unassigned";

      // Map positions to objects that backend expects
      const positions = (data.items || [])
        .map(item => item.position_name?.trim())
        .filter(Boolean)
        .map(position_name => ({ position_name }));

      // Ensure at least one position
      if (positions.length === 0) {
        setError("items", { type: "manual", message: "At least one position is required" });
        setLoading(false);
        return;
      }

      // Prepare payload
      const payload = {
        departmentId,
        info: {
          name: data.info?.name || "",
          description: data.info?.description || "",
          status: data.info?.status || "active",
          icon: iconUrl,
          iconBgColor: selectedColor || "#e5e7eb",
        },
        manager: {
          userId: managerUserId,
        },
        stats: {
          employeeCount: parseInt(data.stats?.employeeCount || 0, 10),
          budget: Number(data.stats?.budget || 0),
        },
        items: positions,
      };

      // Send request
      const response = await axiosPublic.post("/department", payload);

      // Handle response
      if (response.status === 201) {
        success("Department created successfully!");
        handleClose?.();
        RefetchAll?.();
      }
    } catch (error) {

      // Log error
      console.error("[Axios Public] Error creating department:", error);

      // Handle error
      const serverError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        error?.error ||
        "Something went wrong. Please try again.";

      // Set error
      setGlobalError(serverError);

      // Set errors
      if (serverError.toLowerCase().includes("department")) setError("departmentId", { type: "server", message: serverError });
      if (serverError.toLowerCase().includes("name")) setError("info.name", { type: "server", message: serverError });
      if (serverError.toLowerCase().includes("description")) setError("info.description", { type: "server", message: serverError });
      if (serverError.toLowerCase().includes("manager")) setError("manager.userId", { type: "server", message: serverError });
      if (serverError.toLowerCase().includes("budget")) setError("stats.budget", { type: "server", message: serverError });
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Error
  if (imageError) error(imageError);

  return (
    <div
      id="Add_New_Department_Modal"
      className="modal-box w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Add New Department</h3>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details to create a new department
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
        {/* Basic Information Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-2 h-5 rounded-full"></span>
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Name */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <FiHome className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Department Name *</label>
              </div>
              <Shared_Input
                name="info.name"
                register={register}
                placeholder="e.g., Marketing Department"
                rules={{ required: "Department name is required" }}
                type="text"
                errors={errors}
                fullWidth
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <FiInfo className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Description *</label>
              </div>
              <Shared_Input
                name="info.description"
                register={register}
                placeholder="Describe the department's purpose and responsibilities"
                rules={{ required: "Description is required" }}
                type="textarea"
                rows={3}
                errors={errors}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Management & Finance Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
            Management & Finance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manager */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiUsers className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Manager *</label>
              </div>
              <Controller
                name="manager.userId"
                control={control}
                rules={{ required: "Manager is required" }}
                render={({ field }) => (
                  <Shared_Input
                    {...field}
                    placeholder="Select or search for the manager"
                    type="searchable"
                    options={managerOptions}
                    errors={errors}
                    fullWidth
                  />
                )}
              />
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Budget *</label>
              </div>
              <Controller
                name="stats.budget"
                control={control}
                rules={{ required: "Budget is required" }}
                render={({ field }) => (
                  <Shared_Input
                    type="currency"
                    placeholder="Enter annual budget"
                    errors={errors}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.stats?.budget}
                    fullWidth
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Positions Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
            Department Positions
          </h4>
          <Shared_Multi_Field_Input
            register={register}
            control={control}
            errors={errors}
            fieldName="items"
            title="Positions"
            comment="Add one or more positions. At least one is required."
            showIndex={true}
            fieldsConfig={[
              {
                type: "text",
                name: "position_name",
                label: "Position",
                placeholder: "Enter position (e.g., Senior Developer)",
                widthClass: "flex-1 min-w-0",
                rules: { required: "Position is required" },
              },
            ]}
            compact={true}
          />
        </div>

        {/* Department Icon Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <h4 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
              Department Icon & Appearance
            </h4>
            <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
              ▼
            </span>
          </button>


          {/* Drawer Content */}
          {/* Icon Preview Section */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              {/* Icon Preview Display (Read-only) */}
              <div className="flex-1">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FiImage className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Icon Preview</label>
                  </div>
                  <div
                    className="w-24 h-24 md:w-32 md:h-32 mx-auto flex items-center justify-center rounded-xl border-2 border-gray-200 overflow-hidden"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {/* Static Image Display - Not interactive */}
                    {iconPreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={iconPreview}
                          alt="Icon Preview"
                          fill
                          sizes="(max-width: 768px) 128px, 256px"
                          className="object-contain p-2"
                          unoptimized={iconPreview?.startsWith("blob:") || iconPreview?.startsWith("http:")}
                        />
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No icon selected</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Preview of selected icon
                  </p>
                </div>
              </div>

              {/* Color Picker and Upload Controls */}
              <div className="flex-1 space-y-6">
                {/* Color Picker */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FaPalette className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Icon Background Color</label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                      aria-label="Select icon background color"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">Selected Color:</span>
                        <span className="text-sm font-mono text-gray-600">{selectedColor.toUpperCase()}</span>
                      </div>
                      <div className="flex gap-2">
                        {["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition"
                            style={{ backgroundColor: color }}
                            aria-label={`Select ${color} color`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Button - SINGLE upload component */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FiUpload className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Upload Icon</label>
                  </div>
                  <div>
                    <Shared_Input_Image
                      file={iconImage}
                      setFile={setIconImage}
                      previewUrl={iconPreview}
                      setPreviewUrl={setIconPreview}
                      placeholderImage={placeholderIcon}
                      label="Click to choose icon file"
                      hideLabel={true}
                      size="sm"
                      accept="image/*"
                      containerClass="mx-auto"
                    />
                    <div className="mt-2 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIconImage(null);
                          setIconPreview(placeholderIcon);
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove Icon
                      </button>
                      <p className="text-xs text-gray-500">
                        Recommended: 512x512px PNG/SVG with transparent background
                      </p>
                    </div>
                  </div>
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
              Create New Department
            </Shared_Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Add_New_Department_Modal;