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

// Assets Status Options
const assetStatusOptions = [
  { label: "Active", value: "active" },
  { label: "Assigned", value: "assigned" },
  { label: "In Stock", value: "in_stock" },
  { label: "In Repair", value: "in_repair" },
  { label: "Damaged", value: "damaged" },
  { label: "Lost", value: "lost" },
  { label: "Retired", value: "retired" },
];

// Condition Rating Options
const conditionRatingOptions = [
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
  { label: "Broken", value: "broken" },
];

const AddAssetModal = ({
  UserEmail,
  AssetCategoryOptionData,
}) => {
  const { success } = useToast();
  const axiosPublic = useAxiosPublic();

  // States
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Close modal
  const handleClose = () => {
    reset({
      purchase_date: "",
      warranty_expiry: "",
    });
    setFormError(null);
    document.getElementById("Add_Asset_Modal")?.close();
  };

  // Submit handler (ASSET CREATION)
  const onSubmit = async (data) => {
    setFormError(null);
    setIsLoading(true);

    try {
      if (!UserEmail) {
        setFormError("Session error: User email missing.");
        return;
      }

      // Build employee payload
      const payload = {
        ...data,
        created_by: UserEmail,
      };

      // Create employee
      console.log(payload);

      const response = await axiosPublic.post("/Assets", payload);

      // Check response
      if (response.status === 201 || response.status === 200) {
        success("Asset created successfully.");
        handleClose();
      } else {
        setFormError(response.data?.message || "Failed to create asset.");
      }
    } catch (error) {
      console.error("Employee creation error:", error);

      const serverError =
        error.response?.data?.message ||
        error.message ||
        "Failed to create employee.";

      setFormError(serverError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      id="Add_Asset_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">
          Add New Asset
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
        className="space-y-2 grid grid-cols-2 gap-4"
      >
        {/* Asset Tag */}
        <SharedInput
          label="Asset Tag"
          name="asset_tag"
          register={register}
          placeholder="e.g., ABC123"
          rules={{ required: "Asset Tag is required" }}
          error={errors.asset_tag}
        />

        {/* Serial Number */}
        <SharedInput
          label="Serial Number"
          name="serial_number"
          register={register}
          placeholder="e.g., SN1234567890"
          error={errors.serial_number}
        />

        {/* Asset Name */}
        <SharedInput
          label="Asset Name"
          name="asset_name"
          register={register}
          placeholder="e.g., Laptop, Desktop"
          rules={{ required: "Asset Name is required" }}
          error={errors.asset_name}
        />

        {/* Asset Category Select */}
        <SharedInput
          label="Asset Category"
          name="asset_category"
          type="select"
          register={register}
          placeholder="Select Asset Category"
          options={[
            { label: "Unassigned", value: "unAssigned" },
            ...(AssetCategoryOptionData || []).map(item => ({
              label: item.label,
              value: item.value
            }))
          ]}
          rules={{ required: "Asset Category is required" }}
        />

        {/* Brand */}
        <SharedInput
          label="Brand"
          name="asset_brand"
          register={register}
          placeholder="e.g., Dell, HP, Lenovo"
          error={errors.asset_brand}
        />

        {/* Model */}
        <SharedInput
          label="Model"
          name="asset_model"
          register={register}
          placeholder="e.g., Dell, HP, Lenovo"
          error={errors.asset_model}
        />

        {/* Purchase Date */}
        <SharedInput
          label="Purchase Date"
          name="purchase_date"
          type="date"
          dateLimit=""
          className="w-full"
          control={control}
          register={register}
          error={errors.purchase_date}
        />

        {/* Purchase Cost */}
        <SharedInput
          label="Purchase Cost"
          name="purchase_cost"
          register={register}
          type="number"
          placeholder="0.00"
          error={errors.purchase_cost}
        />

        {/* Warranty Expiry */}
        <SharedInput
          label="Warranty Expiry"
          name="warranty_expiry"
          type="date"
          dateLimit=""
          className="w-full"
          control={control}
          register={register}
          error={errors.warranty_expiry}
        />

        {/* Supplier */}
        <SharedInput
          label="Supplier"
          name="supplier"
          register={register}
          placeholder="e.g., Dell, HP, Lenovo"
          error={errors.Supplier}
        />

        {/* Location */}
        <SharedInput
          label="Location"
          name="location"
          register={register}
          placeholder="e.g., 2nd Floor, 3rd Building"
          error={errors.Location}
        />

        {/* Status */}
        <SharedInput
          label="Status"
          name="status"
          type="select"
          register={register}
          placeholder="Select Status"
          options={[
            { label: "Unassigned", value: "unAssigned" },
            ...assetStatusOptions
          ]}
          rules={{ required: "Status is required" }}
        />

        {/* Condition Rating */}
        <div className="col-span-2" >
          <SharedInput
            label="Condition Rating"
            name="condition_rating"
            type="select"
            register={register}
            placeholder="Select Condition Rating"
            options={[
              { label: "Unassigned", value: "unAssigned" },
              ...conditionRatingOptions
            ]}
            rules={{ required: "Condition Rating is required" }}
          />
        </div>

        {/* Description */}
        <SharedInput
          label="Description"
          name="asset_description"
          type="textarea"
          register={register}
          placeholder="Enter asset description..."
          error={errors.asset_description}
        />

        {/* Notes */}
        <SharedInput
          label="Notes"
          name="asset_notes"
          type="textarea"
          register={register}
          placeholder="Enter asset Notes..."
          error={errors.asset_notes}
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
                "Add New Asset"
              )}
            </span>
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddAssetModal;