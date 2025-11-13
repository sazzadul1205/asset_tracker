// React Components
import React, { useRef, useState } from "react";

// React Hook Form
import { useForm } from "react-hook-form";

// Icons
import { ImCross } from "react-icons/im";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";
import SharedImageInput from "@/Shared/SharedImageInput/SharedImageInput";
import { useImageUpload } from "@/Hooks/useImageUpload";

const AddAssetCategoryModal = ({ UserEmail }) => {
  const {
    uploadImage,
    loading: uploadingImage,
    error: imageUploadError
  } = useImageUpload();

  // Hooks
  const imageInputRef = useRef();

  // States
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Image & Color States
  const [iconImage, setIconImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  // Placeholder Icon
  const placeholderIcon =
    "https://i.ibb.co/9996NVtk/info-removebg-preview.png";

  // React Hook Form
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Handle close
  const handleClose = () => {
    reset();
    setError(null);
    setIsOpen(false);
    setSelectedColor("#ffffff");
    imageInputRef.current?.resetToDefault();
    document.getElementById("Add_Asset_Category_Modal")?.close();
  };

  // Handle submit
  const onSubmit = async (data) => {
    setError(null);
    setIsLoading(true);

    try {
      // Ensure user is logged in
      if (!UserEmail) {
        setError("User email not found. Please log in.");
        throw new Error("User email not found. Please log in.");
      }

      let uploadedImageUrl = null;

      // Upload image if selected
      if (iconImage) {
        uploadedImageUrl = await uploadImage(iconImage);
        if (!uploadedImageUrl) {
          setError("Failed to upload icon image.");
          return;
        }
      }

      // Prepare payload with uploaded image URL and color
      const payload = {
        ...data,
        selectedColor,
        iconImage: uploadedImageUrl || placeholderIcon,
      };

      console.log("Payload ready for API:", payload);

      // TODO: send payload to your API
      // await axios.post("/api/asset-categories", payload);

    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to submit form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="Add_Asset_Category_Modal"
      className="modal-box w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Add New Asset Category</h3>
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="py-3 bg-red-100 border border-red-400 rounded-lg mb-4">
          <p className="text-red-500 font-semibold text-center">{error}</p>
        </div>
      )}

      <hr className="my-3 border-gray-300" />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Category Name */}
        <SharedInput
          label="Category Name"
          name="category_name"
          register={register}
          placeholder="e.g. Computer, Mobile, Laptop"
          rules={{ required: "Category Name is required" }}
          error={errors.category_name}
        />

        {/* Category Description */}
        <SharedInput
          label="Category Description"
          name="category_description"
          type="textarea"
          register={register}
          placeholder="e.g. A category description"
          rules={{ required: "Category Description is required" }}
          error={errors.category_description}
        />

        {/* Depreciation & Warranty */}
        <div className="grid grid-cols-2 gap-3">
          <SharedInput
            label="Depreciation Rate (%)"
            name="depreciation_rate"
            type="number"
            register={register}
            placeholder="e.g. 5%"
            rules={{
              required: "Depreciation Rate is required",
              min: { value: 0, message: "Value cannot be less than 0%" },
              max: { value: 100, message: "Value cannot exceed 100%" },
              pattern: {
                value: /^[0-9]+(\.[0-9]{1,2})?$/,
                message: "Enter a valid number (up to 2 decimals)",
              },
            }}
            error={errors.depreciation_rate}
          />
          <SharedInput
            label="Default Warranty (Months)"
            name="warranty"
            register={register}
            placeholder="e.g. 12"
            rules={{ required: "Default Warranty is required" }}
            error={errors.warranty}
          />
        </div>

        {/* Asset Category Icon Drawer */}
        <div className="mt-6">
          {/* Header / Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Category Icon (Optional)
            </h3>
            <span
              className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                }`}
            >
              ▼
            </span>
          </button>

          {/* Drawer Content */}
          <div
            className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-96 mt-4" : "max-h-0"
              }`}
          >
            <div className="mx-auto flex flex-wrap items-center gap-6 justify-center">
              {/* Icon Upload */}
              <div
                className="relative flex items-center justify-center w-20 h-20 border border-gray-300 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
                style={{ backgroundColor: selectedColor }}
              >
                <SharedImageInput
                  ref={imageInputRef}
                  hint=""
                  label=""
                  width={64}
                  height={64}
                  rounded="xl"
                  enableCrop={false}
                  onChange={setIconImage}
                  defaultImage={placeholderIcon}
                />
              </div>

              {/* Background Color Picker */}
              <div className="flex flex-col items-center gap-3">
                <label htmlFor="iconColor" className="text-gray-700 font-medium text-sm">
                  Icon Background:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="iconColor"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-mono">
                    {selectedColor?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className={`px-5 h-11 font-semibold rounded-lg border transition-all duration-200
              ${isSubmitting || isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98]"
              }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`px-6 h-11 font-semibold text-white rounded-lg shadow-md transition-all duration-200
              ${isSubmitting || isLoading
                ? "bg-blue-400 cursor-not-allowed pointer-events-none"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
              }`}
          >
            {isSubmitting || isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Create Asset Category"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssetCategoryModal;
