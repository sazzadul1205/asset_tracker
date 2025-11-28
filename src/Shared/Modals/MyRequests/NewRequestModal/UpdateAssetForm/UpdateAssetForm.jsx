// React Components
import React, { useState } from "react";

// Icons
import { IoMdArrowRoundBack } from "react-icons/io";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";

const generalUpdateOptions = [
  { label: "Software Update", value: "software" },
  { label: "Hardware Upgrade", value: "hardware" },
  { label: "Configuration Change", value: "config" },
];

const UpdateAssetRequestForm = ({
  reset,
  errors,
  control,
  register,
  isLoading,
  MyAssetData,
  isSubmitting,
  AllAssetData,
  handleSubmit,
  setSelectedAction,
  handleUniversalSubmit,
}) => {
  const [updateType, setUpdateType] = useState("current");
  const [fullAssetOption, setFullAssetOption] = useState("inventory");


  const onSubmit = (formData) => {
    const payload = {
      // Move current_asset to the root as "asset"
      asset: formData.current_asset || null,

      general: {
        // Remove current_asset from here
        action_type: formData.action_type,
        priority: formData.priority,
        notes: formData.notes || "",
      },

      update: {},
    };

    // Update type: current update
    if (updateType === "current") {
      payload.update = {
        type: "current",
        update_option: formData.update_option,
        reason: formData.reason_current,
      };
    }

    // Update type: full update
    else if (updateType === "full") {
      payload.update = {
        type: "full",
        reason: formData.reason_full,
      };

      if (fullAssetOption === "inventory") {
        payload.update.full_option = "inventory";
        payload.update.update_asset_inventory = formData.update_asset_inventory;
      }

      if (fullAssetOption === "new") {
        payload.update.full_option = "new";
        payload.update.new_asset_name = formData.new_asset_name;
        payload.update.asset_description = formData.asset_description;
      }
    }

    handleUniversalSubmit(payload, "update");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Update Asset Request</h3>
          <p className="text-sm text-gray-600">Request an update for your asset.</p>
        </div>

        <button
          onClick={() => { setSelectedAction(null); reset(); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white hover:bg-gray-100 transition shadow-sm"
        >
          <IoMdArrowRoundBack className="text-lg" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 grid grid-cols-2 gap-4"
      >
        {/* Select Asset (Controlled) */}
        <SharedInput
          label="Select Asset"
          name="current_asset"
          type="select"
          control={control}
          searchable={true}
          placeholder="Search & select asset"
          rules={{ required: "Select Asset is required" }}
          options={MyAssetData.map(d => ({
            label: `${d.asset_name} (${d.asset_tag})`,
            value: d.asset_tag,
          }))}
          defaultValue={null}
          getOptionLabel={option => option.label}
          getOptionValue={option => option.value}
        />


        {/* Action Type (Read-only) */}
        <SharedInput
          label="Action Type"
          name="action_type"
          type="select"
          register={register}
          placeholder="Transfer Asset"
          readOnly
        />

        {/* Priority */}
        <SharedInput
          label="Priority"
          name="priority"
          type="select"
          register={register}
          placeholder="Select Priority"
          options={[
            { label: "Critical", value: "critical" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ]}
          rules={{ required: "Priority is required" }}
          error={errors?.priority}
        />

        {/* Update Type */}
        <div className="col-span-2 space-y-2" >
          {/* label */}
          <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-sm font-medium text-gray-700 mb-1">
            Update Type
          </label>

          {/* Toggle Update Type */}
          <div className="flex gap-4 ">
            {/* Current Asset Update */}
            <button
              type="button"
              onClick={() => setUpdateType("current")}
              className={`flex-1 text-center py-2 rounded-lg font-medium transition-colors ${updateType === "current"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Current Asset Update
            </button>

            {/* Full Asset Upgrade */}
            <button
              type="button"
              onClick={() => setUpdateType("full")}
              className={`flex-1 text-center py-2 rounded-lg font-medium transition-colors ${updateType === "full"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Full Asset Upgrade
            </button>
          </div>
        </div>

        {/* Conditional Fields */}
        {updateType === "current" && (
          <>
            {/* Update Option */}
            <SharedInput
              label="Update Option"
              name="update_option"
              type="select"
              register={register}
              placeholder="Select general update"
              options={generalUpdateOptions}
              rules={{ required: "Select update option" }}
            />

            {/* Reason */}
            <div className="col-span-2">
              <SharedInput
                label="Reason for Update"
                name="reason_current"
                type="textarea"
                register={register}
                placeholder="Explain why this asset needs an update"
                rules={{ required: "Reason is required" }}
              />
            </div>
          </>
        )}

        {updateType === "full" && (
          <div className="col-span-2 space-y-4" >
            {/* Full Asset Option Toggle */}
            <div className=" space-y-2">
              {/* Label */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Asset Option
              </label>

              {/* Toggle Buttons */}
              <div className="flex gap-4">
                {/* From Inventory */}
                <button
                  type="button"
                  onClick={() => setFullAssetOption("inventory")}
                  className={`flex-1 text-center py-2 rounded-lg font-medium transition-colors ${fullAssetOption === "inventory"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  From Inventory
                </button>

                {/* Suggest New Asset */}
                <button
                  type="button"
                  onClick={() => setFullAssetOption("new")}
                  className={`flex-1 text-center py-2 rounded-lg font-medium transition-colors ${fullAssetOption === "new"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Suggest New Asset
                </button>
              </div>
            </div>

            {/* From Inventory */}
            {fullAssetOption === "inventory" && (
              <SharedInput
                label="Select Update Asset"
                name="update_asset_inventory"
                type="select"
                control={control}
                searchable
                placeholder="Select asset from inventory"
                options={AllAssetData.map(d => ({ label: `${d.asset_name} (${d.asset_tag})`, value: d.asset_tag }))}
                rules={{ required: "Select asset from inventory" }}
                error={errors?.update_asset_inventory}
              />
            )}

            {/* Suggest New Asset */}
            {fullAssetOption === "new" && (
              <div className="space-y-4" >
                {/* New Asset Name */}
                <SharedInput
                  label="New Asset Name"
                  name="new_asset_name"
                  type="text"
                  register={register}
                  placeholder="Enter new asset name"
                  rules={{ required: "Asset name is required" }}
                  error={errors?.new_asset_name}
                />

                {/* Asset Text */}
                <p className="text-sm text-gray-500 mt-1">Please contact your manager to finalize the new asset.</p>

                {/* Asset Description */}
                <SharedInput
                  label="Asset Description"
                  name="asset_description"
                  type="textarea"
                  register={register}
                  placeholder="Explain why this full asset update is needed"
                  rules={{ required: "asset_description is required" }}
                  error={errors?.asset_description}
                />
              </div>
            )}

            {/* Reason */}
            <SharedInput
              label="Reason for Full Asset Update"
              name="reason_full"
              type="textarea"
              register={register}
              placeholder="Explain why this full asset update is needed"
              rules={{ required: "Reason is required" }}
            />
          </div>
        )}

        {/* Optional Notes */}
        <div className="col-span-2">
          <SharedInput
            label="Notes"
            name="notes"
            type="textarea"
            register={register}
            placeholder="Any additional information (optional)"
          />
        </div>

        {/* Submit Button */}
        <div className="col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`h-11 w-64 font-semibold text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center 
              ${isSubmitting || isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
          >
            {isSubmitting || isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Create Update Asset Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateAssetRequestForm;
