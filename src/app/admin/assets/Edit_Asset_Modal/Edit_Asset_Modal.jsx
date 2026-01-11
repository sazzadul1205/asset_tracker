// src/app/admin/assets/Edit_Asset_Modal/Edit_Asset_Modal.jsx

// React Components
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

// Hooks
import { useToast } from "@/hooks/useToast";
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Shared
import Shared_Input from "@/Shared/Shared_Input/Shared_Input";
import Shared_Button from "@/Shared/Shared_Button/Shared_Button";

// Icons
import { FiX } from "react-icons/fi";

const Edit_Asset_Modal = ({
  session,
  RefetchAll,
  selectedAsset,
  setSelectedAsset,
  AssetCategoryOptionsData,
}) => {
  const axiosPublic = useAxiosPublic();
  const { success } = useToast();

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

  // Transform into { label, value } format for the select
  const AssetCategoryOptions = [
    { label: "Unassigned", value: "unassigned" },
    ...(AssetCategoryOptionsData?.map((category) => (
      {
        label: category?.info?.name,
        value: category?.info?.categoryId,
      }))
      || []),
  ];

  // Populate form when selectedAsset changes
  useEffect(() => {
    if (selectedAsset) {
      reset({
        identification: {
          tag: selectedAsset.identification?.tag || "",
          name: selectedAsset.identification?.name || "",
          categoryId: selectedAsset.identification?.categoryId || "unassigned",
        },
        details: {
          serialNumber: selectedAsset.details?.serialNumber || "",
          brand: selectedAsset.details?.brand || "",
          model: selectedAsset.details?.model || "",
          status: selectedAsset.details?.status || "available",
          condition: selectedAsset.details?.condition || "new",
          description: selectedAsset.details?.description || "",
          notes: selectedAsset.details?.notes || "",
        },
        purchase: {
          purchasedAt: selectedAsset.purchase?.purchasedAt
            ? new Date(selectedAsset.purchase.purchasedAt).toISOString().split('T')[0]
            : "",
          cost: selectedAsset.purchase?.cost?.$numberDecimal || selectedAsset.purchase?.cost || 0,
          warrantyExpiry: selectedAsset.purchase?.warrantyExpiry
            ? new Date(selectedAsset.purchase.warrantyExpiry).toISOString().split('T')[0]
            : "",
          supplier: selectedAsset.purchase?.supplier || "",
          location: selectedAsset.purchase?.location || "",
        },
        assigned: {
          assignedTo: selectedAsset.assigned?.assignedTo || null,
          assignedAt: selectedAsset.assigned?.assignedAt || null,
          assignedBy: selectedAsset.assigned?.assignedBy || null,
        },
      });
    }
  }, [selectedAsset, reset]);

  // Close modal
  const handleClose = () => {
    reset();
    setLoading(false);
    setGlobalError("");
    setSelectedAsset(null);
    document.getElementById("Edit_Asset_Modal")?.close();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Form Submit
  const onSubmit = async (data) => {
    if (!selectedAsset?.identification?.tag) {
      setGlobalError("No asset selected to update");
      return;
    }

    setGlobalError("");
    setLoading(true);

    try {
      // Build structured payload
      const payload = {
        identification: {
          tag: data.identification?.tag?.trim() || "",
          name: data.identification?.name?.trim() || "",
          categoryId: data.identification?.categoryId?.trim() || "unassigned",
        },
        details: {
          serialNumber: data.details?.serialNumber?.trim() || "",
          brand: data.details?.brand?.trim() || "",
          model: data.details?.model?.trim() || "",
          status: data.details?.status || "available",
          condition: data.details?.condition || "new",
          description: data.details?.description?.trim() || "",
          notes: data.details?.notes?.trim() || "",
        },
        purchase: {
          purchasedAt: data.purchase?.purchasedAt || null,
          cost: Number(data.purchase?.cost || 0),
          warrantyExpiry: data.purchase?.warrantyExpiry || null,
          supplier: data.purchase?.supplier?.trim() || "",
          location: data.purchase?.location?.trim() || "",
        },
        assigned: {
          assignedTo: data.assigned?.assignedTo || null,
          assignedAt: data.assigned?.assignedAt || null,
          assignedBy: data.assigned?.assignedBy || null,
        },
        updatedBy: session?.user?.id || "system",
      };

      // PATCH request
      const response = await axiosPublic.patch(
        `/assets/${selectedAsset.identification.tag}`,
        payload
      );

      if (response.status === 200) {
        success("Asset updated successfully!");
        handleClose?.();
        RefetchAll?.();
      }

    } catch (error) {
      console.error("[Axios Public] Error updating asset:", error);

      const serverError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";

      setGlobalError(serverError);

    } finally {
      setLoading(false);
    }
  };

  // Return null if no selectedAsset
  if (!selectedAsset) return null;

  return (
    <div
      id="Edit_Asset_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
            Edit Asset: <span className="text-blue-600">{selectedAsset.identification?.name}</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Update the details for asset tag: {selectedAsset.identification?.tag}
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
            {/* Asset Tag (Read-only) */}
            <div className="md:col-span-1">
              <Shared_Input
                label="Asset Tag"
                name="identification.tag"
                register={register}
                errors={errors}
                placeholder="e.g., ASSET-1234"
                rules={{ required: "Asset Tag is required" }}
                control={control}
                error={errors.identification?.tag}
                disabled={true}
                fullWidth
              />
              <p className="text-xs text-gray-500 mt-1">Asset tag cannot be changed</p>
            </div>

            {/* Serial Number */}
            <div className="md:col-span-1">
              <Shared_Input
                label="Serial Number"
                name="details.serialNumber"
                register={register}
                errors={errors}
                placeholder="e.g., MBT234511"
                rules={{ required: "Serial Number is required" }}
                control={control}
                error={errors.details?.serialNumber}
                fullWidth
              />
            </div>

            {/* Asset Name */}
            <div className="md:col-span-2">
              <Shared_Input
                label="Asset Name"
                name="identification.name"
                register={register}
                errors={errors}
                placeholder="e.g., Dell Latitude Laptop"
                rules={{ required: "Asset Name is required" }}
                control={control}
                error={errors.identification?.name}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Category & Status Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
            Category & Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="md:col-span-1">
              <Controller
                name="identification.categoryId"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Shared_Input
                    {...field}
                    label="Category"
                    type="searchable"
                    placeholder="Select or search for the category"
                    errors={errors}
                    options={AssetCategoryOptions}
                    error={errors.identification?.categoryId}
                    fullWidth
                  />
                )}
              />
            </div>

            {/* Status */}
            <div className="md:col-span-1">
              <Shared_Input
                label="Status"
                name="details.status"
                type="select"
                register={register}
                errors={errors}
                control={control}
                rules={{ required: "Status is required" }}
                options={[
                  { label: "Available", value: "available" },
                  { label: "Assigned", value: "assigned" },
                  { label: "Under Maintenance", value: "under_maintenance" },
                  { label: "Lost", value: "lost" },
                  { label: "Retired", value: "retired" }
                ]}
                error={errors.details?.status}
                fullWidth
              />
            </div>

            {/* Condition */}
            <div className="md:col-span-2">
              <Shared_Input
                label="Condition"
                name="details.condition"
                type="select"
                register={register}
                errors={errors}
                control={control}
                rules={{ required: "Condition is required" }}
                options={[
                  { label: "New", value: "new" },
                  { label: "Good", value: "good" },
                  { label: "Fair", value: "fair" },
                  { label: "Poor", value: "poor" },
                  { label: "Broken", value: "broken" }
                ]}
                error={errors.details?.condition}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Manufacturer Details Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
            Manufacturer Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <Shared_Input
                label="Brand"
                name="details.brand"
                register={register}
                errors={errors}
                placeholder="e.g., Dell"
                rules={{ required: "Brand is required" }}
                control={control}
                error={errors.details?.brand}
                fullWidth
              />
            </div>

            {/* Model */}
            <div className="md:col-span-1">
              <Shared_Input
                label="Model"
                name="details.model"
                register={register}
                errors={errors}
                placeholder="e.g., Latitude 5420"
                rules={{ required: "Model is required" }}
                control={control}
                error={errors.details?.model}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Purchase Information Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 w-2 h-5 rounded-full"></span>
            Purchase Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purchased Date */}
            <div className="md:col-span-1">
              <Controller
                control={control}
                name="purchase.purchasedAt"
                render={({ field }) => (
                  <Shared_Input
                    label="Purchased Date"
                    type="date"
                    placeholder="Select purchase date"
                    errors={errors}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.purchase?.purchasedAt}
                    fullWidth
                  />
                )}
              />
            </div>

            {/* Cost */}
            <div className="md:col-span-1">
              <Controller
                name="purchase.cost"
                control={control}
                rules={{ required: "Cost is required" }}
                render={({ field }) => (
                  <Shared_Input
                    label="Cost"
                    type="currency"
                    placeholder="Enter the cost"
                    {...field}
                    error={errors.purchase?.cost}
                    fullWidth
                  />
                )}
              />
            </div>

            {/* Warranty Expiry */}
            <div className="md:col-span-1">
              <Controller
                control={control}
                name="purchase.warrantyExpiry"
                render={({ field }) => (
                  <Shared_Input
                    label="Warranty Expiry"
                    type="date"
                    placeholder="Select warranty expiry date"
                    errors={errors}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.purchase?.warrantyExpiry}
                    fullWidth
                  />
                )}
              />
            </div>

            {/* Supplier */}
            <div className="md:col-span-1">
              <Shared_Input
                label="Supplier"
                name="purchase.supplier"
                register={register}
                errors={errors}
                placeholder="e.g., Dell Technologies"
                rules={{ required: "Supplier is required" }}
                control={control}
                error={errors.purchase?.supplier}
                fullWidth
              />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <Shared_Input
                label="Location"
                name="purchase.location"
                register={register}
                errors={errors}
                placeholder="e.g., Main Office, Floor 3, Room 301"
                rules={{ required: "Location is required" }}
                control={control}
                error={errors.purchase?.location}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Description & Notes Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 w-2 h-5 rounded-full"></span>
            Additional Information
          </h4>
          <div className="space-y-4">
            {/* Description */}
            <Shared_Input
              label="Description"
              type="textarea"
              name="details.description"
              register={register}
              errors={errors}
              placeholder="Provide a detailed description of the asset..."
              rules={{ required: "Description is required" }}
              control={control}
              error={errors.details?.description}
              rows={3}
              fullWidth
            />

            {/* Notes */}
            <Shared_Input
              label="Notes"
              type="textarea"
              name="details.notes"
              register={register}
              errors={errors}
              placeholder="Any additional notes or remarks..."
              control={control}
              error={errors.details?.notes}
              rows={2}
              fullWidth
            />
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
              Update Asset
            </Shared_Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Edit_Asset_Modal;