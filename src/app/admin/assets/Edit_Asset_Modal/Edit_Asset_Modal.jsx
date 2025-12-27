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
import { ImCross } from "react-icons/im";

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
            ? new Date(selectedAsset.purchase.purchasedAt)
            : null,
          cost: selectedAsset.purchase?.cost || 0,
          warrantyExpiry: selectedAsset.purchase?.warrantyExpiry
            ? new Date(selectedAsset.purchase.warrantyExpiry)
            : null,
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
          purchasedAt: data.purchase?.purchasedAt ? new Date(data.purchase.purchasedAt) : null,
          cost: Number(data.purchase?.cost || 0),
          warrantyExpiry: data.purchase?.warrantyExpiry ? new Date(data.purchase.warrantyExpiry) : null,
          supplier: data.purchase?.supplier?.trim() || "",
          location: data.purchase?.location?.trim() || "",
        },
        assigned: {
          assignedTo: data.assigned?.assignedTo || null,
          assignedAt: data.assigned?.assignedAt ? new Date(data.assigned.assignedAt) : null,
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
      className="modal-box w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="tracking-tight text-xl font-semibold text-gray-900">Add New Asset</h3>
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
      <form onSubmit={handleSubmit(onSubmit)} className="pt-4 grid grid-cols-2 gap-4 ">
        {/* Asset Tag */}
        <Shared_Input
          label="Asset Tag"
          name="identification.tag"
          register={register}
          errors={errors}
          placeholder="w.g ASSET-1234"
          rules={{ required: "Asset Tag is required" }}
          control={control}
          error={errors.identification?.tag}
        />

        {/* Serial Number */}
        <Shared_Input
          label="Serial Number"
          name="details.serialNumber"
          register={register}
          errors={errors}
          placeholder="w.g MBT234511"
          rules={{ required: "Serial Number is required" }}
          control={control}
          error={errors.details?.serialNumber}
        />

        {/* Asset Name */}
        <Shared_Input
          label="Asset Name"
          name="identification.name"
          register={register}
          errors={errors}
          placeholder="w.g Computer"
          rules={{ required: "Asset Name is required" }}
          control={control}
          error={errors.identification?.name}
        />

        {/* Category */}
        <Controller
          name="identification.categoryId"
          control={control}
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <Shared_Input
              {...field}
              label="Category (Select or search for the category)"
              type="searchable"
              placeholder="Select or search for the category"
              errors={errors}
              options={AssetCategoryOptions}
            />
          )}
        />

        {/* Brand */}
        <Shared_Input
          label="Brand"
          name="details.brand"
          register={register}
          errors={errors}
          placeholder="w.g Dell"
          rules={{ required: "Brand is required" }}
          control={control}
          error={errors.details?.brand}
        />

        {/* Model */}
        <Shared_Input
          label="Model"
          name="details.model"
          register={register}
          errors={errors}
          placeholder="w.g Dell"
          rules={{ required: "Model is required" }}
          control={control}
          error={errors.details?.model}
        />

        {/* Purchased At */}
        <Controller
          control={control}
          name="purchase.purchasedAt"
          rules={{ required: "Purchased Date is required" }}
          render={({ field }) => (
            <Shared_Input
              label="Purchased Date"
              type="date"
              placeholder="Purchased Date"
              errors={errors}
              rules={{ required: "Purchased Date is required" }}
              value={field.value}
              onChange={field.onChange}
              error={errors.purchase?.purchasedAt}
            />
          )}
        />


        {/* Cost */}
        <Controller
          name="purchase.cost"
          control={control}
          rules={{ required: "cost is required" }}
          render={({ field }) => (
            <Shared_Input
              label="cost"
              type="currency"
              placeholder="Enter the cost"
              {...field}
            />
          )}
        />

        {/* Warranty Expiry */}
        <Controller
          control={control}
          name="purchase.warrantyExpiry"
          rules={{ required: "Warranty Expiry is required" }}
          render={({ field }) => (
            <Shared_Input
              label="Warranty Expiry"
              type="date"
              placeholder="Warranty Expiry"
              errors={errors}
              rules={{ required: "Warranty Expiry is required" }}
              value={field.value}
              onChange={field.onChange}
              error={errors.purchase?.warrantyExpiry}
            />
          )}
        />

        {/* Supplier */}
        <Shared_Input
          label="Supplier"
          name="purchase.supplier"
          register={register}
          errors={errors}
          placeholder="w.g Dell"
          rules={{ required: "Supplier is required" }}
          control={control}
          error={errors.purchase?.supplier}
        />

        {/* Location */}
        <Shared_Input
          label="Location"
          name="purchase.location"
          register={register}
          errors={errors}
          placeholder="w.g Dell"
          rules={{ required: "Location is required" }}
          control={control}
          error={errors.purchase?.location}
        />

        {/* Status */}
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
        />

        {/* Condition */}
        <div className="col-span-2" >
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
          />
        </div>

        {/* Description */}
        <Shared_Input
          label="Description"
          type="textarea"
          name="details.description"
          register={register}
          errors={errors}
          placeholder="w.g Product description"
          rules={{ required: "Description is required" }}
          control={control}
          error={errors.details?.description}
        />

        {/* Notes */}
        <Shared_Input
          label="Notes"
          type="textarea"
          name="details.notes"
          register={register}
          errors={errors}
          placeholder="w.g Product notes"
          control={control}
          error={errors.details?.notes}
        />

        {/* Buttons */}
        <div className='col-span-2 justify-end flex items-center gap-2 pt-2'>
          {/* Cancel */}
          <Shared_Button
            type="button"
            onClick={handleClose}
            variant="ghost"
            minWidth="100px"
          >
            Cancel
          </Shared_Button>

          {/* Submit */}
          <Shared_Button
            type="submit"
            variant="primary"
            loading={isSubmitting || loading}
            minWidth="100px"
          >
            Update Asset
          </Shared_Button>
        </div>
      </form>
    </div>
  );
};

export default Edit_Asset_Modal;