import { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import SharedInput from "@/Shared/SharedInput/SharedInput";

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const generalUpdateOptions = [
  { label: "Software Update", value: "software" },
  { label: "Hardware Upgrade", value: "hardware" },
  { label: "Configuration Change", value: "config" },
];

function RemoveAssigned(data) {
  return data.filter(item => !item.assigned_to);
}

const UpdateAssetRequestForm = ({
  reset,
  errors,
  control,
  register,
  isLoading,
  UserEmail,
  formError,
  isSubmitting,
  handleSubmit,
  setSelectedAction,
  AssetBasicInfoData,
  onAssetUpdateSubmit,
}) => {
  const [updateType, setUpdateType] = useState("current");
  const [fullAssetOption, setFullAssetOption] = useState("inventory");

  const MyAssetData = AssetBasicInfoData.filter(asset => asset.assigned_to === UserEmail);
  const AssetData = RemoveAssigned(AssetBasicInfoData);


  // Payload builder
  const onSubmit = (formData) => {
    const payload = {
      general: {
        current_asset: formData.current_asset,
        action_type: formData.action_type,
        priority: formData.priority,
        notes: formData.notes || "",
      },
      update: {},
    };

    if (updateType === "current") {
      payload.update = {
        type: "current",
        update_option: formData.update_option,
        reason: formData.reason_current,
      };
    } else if (updateType === "full") {
      payload.update = {
        type: "full",
        reason: formData.reason_full,
      };

      if (fullAssetOption === "inventory") {
        payload.update.full_option = "inventory";
        payload.update.update_asset_inventory = formData.update_asset_inventory;
      } else if (fullAssetOption === "new") {
        payload.update.full_option = "new";
        payload.update.new_asset_name = formData.new_asset_name;
        payload.update.asset_description = formData.asset_description;
      }
    }
    // Pass payload to your API or handler
    onAssetUpdateSubmit(payload);
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

      {formError && (
        <div className="py-3 bg-red-100 border border-red-400 rounded-lg mb-4">
          <p className="text-red-500 font-semibold text-center">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 grid grid-cols-2 gap-4">
        {/* Select Current Asset */}
        <SharedInput
          label="Select Current Asset"
          name="current_asset"
          type="select"
          control={control}
          searchable
          placeholder="Search & select your asset"
          rules={{ required: "Select asset is required" }}
          options={MyAssetData.map(d => ({ label: `${d.asset_name} (${d.asset_tag})`, value: d.asset_tag }))}
          error={errors?.current_asset}
        />

        {/* Action Type (Read-only) */}
        <SharedInput
          label="Action Type"
          name="action_type"
          type="select"
          register={register}
          placeholder="Update Asset"
          readOnly
        />

        {/* Priority */}
        <SharedInput
          label="Priority"
          name="priority"
          type="select"
          register={register}
          placeholder="Select priority"
          options={priorityOptions}
          rules={{ required: "Priority is required" }}
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
            <SharedInput
              label="Update Option"
              name="update_option"
              type="select"
              register={register}
              placeholder="Select general update"
              options={generalUpdateOptions}
              rules={{ required: "Select update option" }}
            />

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


            {fullAssetOption === "inventory" && (
              <SharedInput
                label="Select Update Asset"
                name="update_asset_inventory"
                type="select"
                control={control}
                searchable
                placeholder="Select asset from inventory"
                options={AssetData.map(d => ({ label: `${d.asset_name} (${d.asset_tag})`, value: d.asset_tag }))}
                rules={{ required: "Select asset from inventory" }}
                error={errors?.update_asset_inventory}
              />
            )}

            {fullAssetOption === "new" && (
              <div className="space-y-4" >
                <SharedInput
                  label="New Asset Name"
                  name="new_asset_name"
                  type="text"
                  register={register}
                  placeholder="Enter new asset name"
                  rules={{ required: "Asset name is required" }}
                  error={errors?.new_asset_name}
                />
                <p className="text-sm text-gray-500 mt-1">Please contact your manager to finalize the new asset.</p>

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
            className={`px-6 h-11 font-semibold text-white rounded-lg shadow-md transition-all duration-200 ${isSubmitting || isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
          >
            {isSubmitting || isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Submit Update Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateAssetRequestForm;
