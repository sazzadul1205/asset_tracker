// src/app/admin/assetsCategories/Edit_Category_Modal/Edit_Category_Modal.jsx

// React Components
import { Controller, useForm } from 'react-hook-form';
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
import { ImCross } from 'react-icons/im';


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
  const [selectedColor, setSelectedColor] = useState("#ffffff");
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
    setSelectedColor(selectedCategory.info?.iconBgColor || "#ffffff");
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
    setSelectedColor("#ffffff");
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
            : "#ffffff",
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

  return (
    <div
      id="Edit_Category_Modal"
      className="modal-box w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="tracking-tight text-xl font-semibold text-gray-900">Add New Category</h3>
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
      <form onSubmit={handleSubmit(onSubmit)} className="pt-4 space-y-4">
        <Shared_Input
          label="Category Name"
          name="info.name"
          register={register}
          errors={errors}
          placeholder="e.g. Mobile, Hardware, etc..."
          rules={{ required: "Category name is required" }}
          control={control}
          error={errors?.category_name}
        />

        <Shared_Input
          label="Category Description"
          name="info.description"
          type="textarea"
          register={register}
          errors={errors}
          placeholder="e.g. Mobile, Hardware, etc..."
          rules={{ required: "Category description is required" }}
          control={control}
          error={errors?.category_description}
        />

        <div className="grid grid-cols-2 gap-3">
          <Shared_Input
            label="Depreciation (%)"
            name="depreciation.averageRate"
            type="number"
            register={register}
            errors={errors}
            placeholder="e.g. 5"
            rules={{
              required: "Depreciation is required",
              min: { value: 0, message: "Must be >= 0" },
              max: { value: 100, message: "Must be <= 100" }
            }}
            control={control}
            error={errors?.depreciation?.averageRate}
          />
          <Shared_Input
            label="Warranty (Months)"
            name="depreciation.defaultWarrantyMonths"
            type="number"
            register={register}
            errors={errors}
            placeholder="e.g. 12"
            rules={{ required: "Warranty is required", min: { value: 0, message: "Must be >= 0" } }}
            control={control}
            error={errors?.depreciation?.defaultWarrantyMonths}
          />
        </div>

        {/* Icon Upload */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800">Category Icon (Optional)</h3>
            <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>▼</span>
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-96 mt-4" : "max-h-0"}`}>
            <div className="mx-auto flex flex-wrap items-center gap-6 justify-center">
              <div
                className="relative flex items-center justify-center w-20 h-20 border border-gray-300 rounded-xl shadow-sm hover:shadow-md"
                style={{ backgroundColor: selectedColor }}
              >
                <Shared_Input_Image
                  file={iconImage}
                  setFile={setIconImage}
                  previewUrl={iconPreview}
                  setPreviewUrl={setIconPreview}
                  placeholderImage={placeholderIcon}
                  hideLabel
                  size="sm"
                  containerClass="w-20 h-20"
                />
              </div>

              <div className="flex flex-col items-center gap-3">
                <label htmlFor="iconColor" className="text-gray-700 font-medium text-sm">Icon Background:</label>
                <div className="flex items-center gap-2">
                  <input
                    id="iconColor"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-mono">{selectedColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="col-span-2 justify-end flex items-center gap-2 pt-2">
          <Shared_Button type="button" onClick={handleClose} variant="ghost" minWidth="100px">Cancel</Shared_Button>
          <Shared_Button type="submit" variant="primary" loading={isSubmitting || loading} minWidth="100px">
            Update Category
          </Shared_Button>
        </div>
      </form>
    </div>
  );
};

export default Edit_Category_Modal;