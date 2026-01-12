// src/app/admin/myRequests/Make_New_Request/AssignAssetForm/AssignAssetForm.jsx

// React
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

// Shared Components
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';

// Hooks
import { useToast } from '@/hooks/useToast';
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Data for dropdowns
const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const AssignAssetForm = ({
  session,
  RefetchAll,
  handleClose,
  userOptions,
  unassignedAssets,
}) => {
  const { success } = useToast();
  const axiosPublic = useAxiosPublic();

  // States
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // React Hook Form
  const {
    control,
    handleSubmit,
    register,
    formState: { errors }
  } = useForm();

  // Prepare asset options for the select input
  const assetOptions = unassignedAssets?.data?.map(asset => ({
    label: `${asset.tag} — ${asset.name}`,
    value: asset.tag,
  }));

  // Prepare user options for the select input
  const userSelectOptions = userOptions?.data?.map(user => ({
    label: `${user.personal.name} — ${user.personal.userId}`,
    value: user.personal.userId,
  }));

  // Form submission handler
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        assetId: data.assetId,
        type: "assign",
        priority: data.priority || "medium",
        description: data.description || "",
        expectedCompletion: data.expectedCompletion
          ? new Date(data.expectedCompletion).toISOString()
          : new Date().toISOString(),
        participants: {
          requestedById: session?.user?.userId || "system",
          requestedToId: data?.requestedToId || "-",
          departmentId: session?.user?.departmentId || "unassigned",
        },
      };

      // Axios POST request
      const result = await axiosPublic.post("/requests", payload);

      success(result.data.message || "Asset assigned successfully!");
      RefetchAll();
      handleClose();
    } catch (error) {
      console.error("Error assigning asset:", error);
      setGlobalError(error.error || "Failed to assign asset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Global Error */}
      {globalError && (
        <div className="bg-red-100 text-red-700 p-2 sm:p-3 rounded text-xs sm:text-sm font-medium text-center">
          {globalError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

        {/* Asset ID */}
        <div className="md:col-span-2">
          <Controller
            name="assetId"
            control={control}
            rules={{ required: "Asset is required" }}
            render={({ field }) => (
              <Shared_Input
                {...field}
                type="searchable"
                label="Asset"
                options={assetOptions}
                placeholder="Search & select asset"
                errors={errors}
              />
            )}
          />
        </div>

        {/* Action Type */}
        <Shared_Input
          label="Action Type"
          name="type"
          type="select"
          register={register}
          placeholder="Assign Asset"
          readOnly
        />

        {/* Assign To */}
        <Controller
          name="requestedToId"
          control={control}
          rules={{ required: "Assign To is required" }}
          render={({ field }) => (
            <Shared_Input
              {...field}
              type="searchable"
              label="Assign To"
              options={userSelectOptions}
              placeholder="Search & select user"
              errors={errors}
            />
          )}
        />

        {/* Priority */}
        <Shared_Input
          label="Priority"
          name="priority"
          type="select"
          register={register}
          placeholder="Select Priority"
          options={priorities}
        />

        {/* Expected Date */}
        <div className="md:col-span-2">
          <Controller
            name="expectedCompletion"
            control={control}
            rules={{ required: "Expected completion date is required" }}
            render={({ field }) => (
              <Shared_Input
                {...field}
                type="date"
                label="Expected Date"
                placeholder="Select expected completion date"
                error={errors?.expectedCompletion}
              />
            )}
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <Shared_Input
            label="Notes"
            name="description"
            type="textarea"
            register={register}
            placeholder="Enter any additional notes"
            rows="3"
          />
        </div>

        {/* Buttons */}
        <div className='md:col-span-2 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3 pt-2 sm:pt-4'>
          {/* Cancel */}
          <Shared_Button
            type="button"
            onClick={handleClose}
            variant="ghost"
            className="w-full sm:w-auto"
            minWidth="100px"
          >
            Cancel
          </Shared_Button>

          {/* Submit */}
          <Shared_Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full sm:w-auto"
            minWidth="100px"
          >
            <span className="text-sm sm:text-base">Make Assign Asset Request</span>
          </Shared_Button>
        </div>
      </form>
    </div>
  );
};

export default AssignAssetForm;