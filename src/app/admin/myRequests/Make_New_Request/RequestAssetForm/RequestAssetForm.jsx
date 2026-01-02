// src/app/admin/myRequests/Make_New_Request/RequestAssetForm/RequestAssetForm.jsx/RequestAssetForm/RequestAssetForm.jsx.jsx

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

const RequestAssetForm = ({
  session,
  RefetchAll,
  handleClose,
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

  // Form submission handler
  const onSubmit = async (data) => {
    setLoading(true);
    setGlobalError("");

    try {
      const payload = {
        assetId: data.assetId,
        type: "request", // key change
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

        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "pending",
        },
      };

      const result = await axiosPublic.post("/requests", payload);

      success(result.data.message || "Asset request created successfully!");
      RefetchAll();
      handleClose();
    } catch (error) {
      console.error("Error creating request:", error);
      setGlobalError(error.error || "Failed to create asset request. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">

      {/* Global Error */}
      {globalError && (
        <div className="bg-red-100 text-red-700 p-2 rounded mt-3 mb-1 text-sm font-medium text-center">
          {globalError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">

        {/* Asset ID */}
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

        {/* Action Type */}
        <Shared_Input
          label="Action Type"
          name="action_type"
          type="select"
          register={register}
          placeholder="Request Asset"
          readOnly
        />

        {/* Priority */}
        <Shared_Input
          label="Priority"
          name="priority"
          type="select"
          register={register}
          placeholder="Select Priority"
          options={priorities}
          rules={{ required: "Priority is required" }}
          error={errors?.priority}
        />

        {/* Expected Date */}
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

        {/* Notes */}
        <div className="col-span-2">
          <Shared_Input
            label="Notes"
            name="description"
            type="textarea"
            register={register}
            placeholder="Enter notes (optional)"
            error={errors?.description}
            rows={4}
          />
        </div>

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
            loading={loading}
            minWidth="100px"
          >
            Make &quot;Request&quot; Asset Request
          </Shared_Button>
        </div>
      </form>



    </div>
  );
};

export default RequestAssetForm;