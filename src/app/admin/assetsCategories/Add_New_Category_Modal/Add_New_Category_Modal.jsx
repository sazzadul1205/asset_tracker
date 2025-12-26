// src/app/admin/departments/Add_New_Category_Modal/Add_New_Category_Modal.jsx

// React Components
import React, { useState } from "react";
import { useForm } from "react-hook-form";

// Hooks
import { useToast } from "@/hooks/useToast";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { useImageUpload } from "@/hooks/useImageUpload";

// Shared
import Shared_Input from "@/Shared/Shared_Input/Shared_Input";
import Shared_Button from "@/Shared/Shared_Button/Shared_Button";
import Shared_Input_Image from "@/Shared/Shared_Input_Image/Shared_Input_Image";

// Icons
import { ImCross } from "react-icons/im";

const Add_New_Category_Modal = ({
  session,
  RefetchAll,
}) => {
  const axiosPublic = useAxiosPublic();
  const { success, error } = useToast();
  const { uploadImage, error: imageError } = useImageUpload();

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [iconImage, setIconImage] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [placeholderIcon] = useState("https://i.ibb.co/9996NVtk/info-removebg-preview.png");

  // Global states
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // react-hook-form
  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  // Close modal
  const handleClose = () => {
    reset();
    setLoading(false);
    setIsOpen(false);
    setIconImage(null);
    setGlobalError("");
    setIconPreview(null);
    setSelectedColor("#ffffff");
    document.getElementById("Add_New_Category_Modal")?.close();
  };

  // Submit handler
  const onSubmit = async (data) => {
    setGlobalError("");
    setLoading(true);

    try {
      // Generate categoryId
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const categoryId = `CAT-${Date.now()}-${randomSuffix}`;

      // Upload Icon
      let iconUrl = placeholderIcon;
      if (iconImage) {
        const uploadedUrl = await uploadImage(iconImage);
        if (uploadedUrl) iconUrl = uploadedUrl;
      }

      // Prepare payload (strict type & defaults)
      const payload = {
        info: {
          categoryId,
          name: String(data.info?.name || ""),
          description: String(data.info?.description || ""),
          status: "active",
          icon: iconUrl,
          iconBgColor: String(selectedColor || "#ffffff")
        },
        depreciation: {
          averageRate: Number(data.info?.depreciation || 0),
          defaultWarrantyMonths: Number(data.info?.warranty || 0)
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // POST request
      const response = await axiosPublic.post("/assetsCategories", payload);

      if (response.status === 201) {
        success("Category created successfully!");
        handleClose();
        RefetchAll();
      } else {
        setGlobalError(response.data?.error || "Something went wrong.");
      }
    } catch (err) {

      console.error("[Axios Public] Error creating category:", err);
      setGlobalError(err?.response?.data?.error || err.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  if (imageError) error(imageError);

  return (
    <div
      id="Add_New_Category_Modal"
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
        {/* Category Name */}
        <Shared_Input
          label="Category Name"
          name="info.name"
          register={register}
          errors={errors}
          placeholder="e.g. Mobile, Hardware, etc..."
          rules={{ required: "Category name is required" }}
          control={control}
          error={errors?.info?.name}
        />

        {/* Category Description */}
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

        {/* Depreciation & Warranty */}
        <div className="grid grid-cols-2 gap-3">
          {/* Depreciation */}
          <Shared_Input
            label="Depreciation (%)"
            name="info.depreciation"
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
            error={errors?.depreciation}
          />

          {/* Warranty */}
          <Shared_Input
            label="Warranty (Months)"
            name="info.warranty"
            type="number"
            register={register}
            errors={errors}
            placeholder="e.g. 12"
            rules={{ required: "Warranty is required", min: { value: 0, message: "Must be >= 0" } }}
            control={control}
            error={errors?.warranty}
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
          {/* Cancel Button */}
          <Shared_Button
            type="button"
            onClick={handleClose}
            variant="ghost"
            minWidth="100px">
            Cancel
          </Shared_Button>

          {/* Submit Button */}
          <Shared_Button
            type="submit"
            variant="primary"
            loading={isSubmitting || loading}
            minWidth="100px">
            Create New Category
          </Shared_Button>
        </div>
      </form>
    </div>
  );
};

export default Add_New_Category_Modal;
