// src/app/admin/assetsCategories/Edit_Category_Modal/Edit_Category_Modal.jsx

// React Components
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';

// Hooks
import { useToast } from '@/hooks/useToast';
import useAxiosPublic from '@/hooks/useAxiosPublic';
import { useImageUpload } from '@/hooks/useImageUpload';

// Shared Components
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Shared_Input_Image from '@/Shared/Shared_Input_Image/Shared_Input_Image';

// Icons
import { FiX, FiUpload, FiImage, FiEdit2 } from "react-icons/fi";
import { FaPalette, FaPercent, FaCalendarAlt, FaTag, FaInfoCircle, FaSignal } from "react-icons/fa";
import Image from 'next/image';

const Edit_Category_Modal = ({
  session,
  RefetchAll,
  selectedCategory,
  setSelectedCategory,
}) => {
  const axiosPublic = useAxiosPublic();
  const { success, error } = useToast();
  const { uploadImage, error: imageError } = useImageUpload();

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [iconImage, setIconImage] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#3B82F6"); // Blue-500 as default
  const [placeholderIcon] = useState("https://i.ibb.co/9996NVtk/info-removebg-preview.png");

  // Global states
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Form initialization
  const {
    reset,
    control,
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Preload Category data into form when modal opens
  useEffect(() => {
    if (!selectedCategory) return;

    // Safely extract Decimal128 values
    const avgRateRaw =
      selectedCategory.depreciation?.averageRate?.$numberDecimal ??
      selectedCategory.depreciation?.averageRate;

    const warrantyRaw =
      selectedCategory.depreciation?.defaultWarrantyMonths?.$numberDecimal ??
      selectedCategory.depreciation?.defaultWarrantyMonths;

    // Reset form values
    reset({
      info: {
        name: selectedCategory.info?.name || "",
        description: selectedCategory.info?.description || "",
        status: selectedCategory.info?.status || "active",
      },
      depreciation: {
        averageRate: avgRateRaw !== undefined ? Number(avgRateRaw) : 0,
        defaultWarrantyMonths:
          warrantyRaw !== undefined ? Number(warrantyRaw) : 0,
      },
    });

    // Set icon preview and background color
    setIconPreview(selectedCategory.info?.icon || placeholderIcon);
    setSelectedColor(selectedCategory.info?.iconBgColor || "#3B82F6");
  }, [selectedCategory, reset, placeholderIcon]);

  // Close modal handler
  const handleClose = () => {
    reset();
    setLoading(false);
    setIsOpen(false);
    setIconImage(null);
    setGlobalError("");
    setIconPreview(null);
    setSelectedCategory(null);
    setSelectedColor("#3B82F6");
    document.getElementById('Edit_Category_Modal')?.close();
  };

  // Submit handler
  const onSubmit = async (data) => {
    setGlobalError("");
    setLoading(true);

    try {
      /* ---------------------------------
         1. Upload icon if changed
      ----------------------------------*/
      let finalIcon = iconPreview;

      if (iconImage) {
        const uploadedUrl = await uploadImage(iconImage);
        if (!uploadedUrl) {
          throw new Error("Icon upload failed");
        }
        finalIcon = uploadedUrl;
      }

      /* ---------------------------------
         2. Build payload (MATCHES ROUTE)
      ----------------------------------*/
      const payload = {
        info: {
          name: data.info.name.trim(),
          description: data.info.description.trim(),
          status: data.info.status === "inactive" ? "inactive" : "active",
          icon: finalIcon,
          iconBgColor: /^#([A-Fa-f0-9]{6})$/.test(selectedColor)
            ? selectedColor
            : "#3B82F6",
        },

        depreciation: {
          // send plain numbers – server converts to Decimal128
          averageRate: parseInt(data.depreciation.averageRate, 10),
          defaultWarrantyMonths: parseInt(
            data.depreciation.defaultWarrantyMonths,
            10
          ),
        },
      };

      /* ---------------------------------
         3. PATCH request
      ----------------------------------*/
      const res = await axiosPublic.patch(
        `/assetsCategories/${selectedCategory?.info?.categoryId}`,
        payload
      );

      /* ---------------------------------
         4. Success
      ----------------------------------*/
      if (res.status === 200) {
        success("Category updated successfully");
        handleClose();
        RefetchAll?.();
      }
    } catch (err) {
      console.error("[Edit Category] PATCH error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Something went wrong";

      setGlobalError(message);

      // field-level errors (optional but clean)
      if (message.toLowerCase().includes("name")) {
        setError("info.name", { type: "server", message });
      }
      if (message.toLowerCase().includes("description")) {
        setError("info.description", { type: "server", message });
      }
      if (message.toLowerCase().includes("depreciation")) {
        setError("depreciation.averageRate", {
          type: "server",
          message,
        });
      }
      if (message.toLowerCase().includes("warranty")) {
        setError("depreciation.defaultWarrantyMonths", {
          type: "server",
          message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Error
  if (imageError) error(imageError);

  if (!selectedCategory) return null

  return (

    <div
      id='Edit_Category_Modal'
      className="modal-box w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
            Edit Category: <span className="text-blue-600">{selectedCategory?.info?.name}</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Category ID: {selectedCategory?.info?.categoryId}
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
          <div className="space-y-4">
            {/* Category Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaTag className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Category Name</label>
              </div>
              <Shared_Input
                name="info.name"
                register={register}
                errors={errors}
                placeholder="e.g. Laptops, Mobile Devices, Hardware, etc."
                rules={{ required: "Category name is required" }}
                control={control}
                error={errors?.category_name}
                fullWidth
              />
            </div>

            {/* Category Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaInfoCircle className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Category Description</label>
              </div>
              <Shared_Input
                name="info.description"
                type="textarea"
                register={register}
                errors={errors}
                placeholder="Describe this asset category..."
                rules={{ required: "Category description is required" }}
                control={control}
                error={errors?.category_description}
                rows={3}
                fullWidth
              />
            </div>

            {/* Category Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaSignal className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Status</label>
              </div>
              <Shared_Input
                name="info.status"
                type="select"
                register={register}
                errors={errors}
                control={control}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                error={errors?.info?.status}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Financial Settings Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
            Financial Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Depreciation */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaPercent className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Depreciation Rate (%)</label>
              </div>
              <Shared_Input
                name="depreciation.averageRate"
                type="number"
                register={register}
                errors={errors}
                placeholder="e.g. 25"
                rules={{
                  required: "Depreciation rate is required",
                  min: { value: 0, message: "Must be 0 or higher" },
                  max: { value: 100, message: "Cannot exceed 100%" }
                }}
                control={control}
                error={errors?.depreciation?.averageRate}
                fullWidth
              />
              <p className="text-xs text-gray-500 mt-1">Annual depreciation percentage</p>
            </div>

            {/* Warranty */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaCalendarAlt className="text-gray-400 w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Warranty Period (Months)</label>
              </div>
              <Shared_Input
                name="depreciation.defaultWarrantyMonths"
                type="number"
                register={register}
                errors={errors}
                placeholder="e.g. 36"
                rules={{
                  required: "Warranty period is required",
                  min: { value: 0, message: "Must be 0 or higher" }
                }}
                control={control}
                error={errors?.depreciation?.defaultWarrantyMonths}
                fullWidth
              />
              <p className="text-xs text-gray-500 mt-1">Default warranty period in months</p>
            </div>
          </div>
        </div>

        {/* Icon Upload Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <h4 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
              Category Icon & Appearance
            </h4>
            <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
              ▼
            </span>
          </button>

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
              Update Category
            </Shared_Button>
          </div>
        </div>
      </form>
    </div>

  );
};

export default Edit_Category_Modal;