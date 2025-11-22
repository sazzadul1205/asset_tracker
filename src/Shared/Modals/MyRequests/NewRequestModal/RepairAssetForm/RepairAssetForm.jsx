// Icons
import { IoMdArrowRoundBack } from "react-icons/io";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";

// Utils
import { getAssetsByEmail } from "../ReturnAssetForm/ReturnAssetForm";

// Issue Type
const issueTypeOptions = [
  { label: "Not Working", value: "not_working" },
  { label: "Intermittent Issue (Sometimes Works)", value: "intermittent_issue" },
  { label: "Physical Damage", value: "physical_damage" },
  { label: "Power Issue", value: "power_issue" },
  { label: "Connectivity Issue", value: "connectivity_issue" },
  { label: "Performance Issue (Slow / Unresponsive)", value: "performance_issue" },
  { label: "Overheating / Unusual Noise", value: "overheating_noise" },
  { label: "Configuration / Setup Problem", value: "configuration_issue" },
  { label: "Accessory or Component Missing", value: "missing_component" },
  { label: "Preventive Maintenance Required", value: "maintenance_required" },
  { label: "Unknown Issue / Needs Inspection", value: "unknown_issue" },
  { label: "Other", value: "other" },
];

// Condition Rating
const conditionRatingOptions = [
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
  { label: "Broken", value: "broken" },
];

const RepairAssetForm = ({
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
  onAssetRepairSubmit,
}) => {

  const AssetData = getAssetsByEmail(AssetBasicInfoData, UserEmail);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Repair Request</h3>
          <p className="text-sm text-gray-600">Submit a repair request for an asset.</p>
        </div>

        <button
          onClick={() => { setSelectedAction(null); reset(); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border
                     bg-white hover:bg-gray-100 transition shadow-sm"
        >
          <IoMdArrowRoundBack className="text-lg" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="py-3 bg-red-100 border border-red-400 rounded-lg mb-4">
          <p className="text-red-500 font-semibold text-center">{formError}</p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onAssetRepairSubmit)}
        className="space-y-3 grid grid-cols-2 gap-4"
      >
        {/* Select Asset (Controlled & Mandatory) */}
        <SharedInput
          label="Select Asset"
          name="asset"
          type="select"
          control={control}
          searchable={true}
          placeholder="Search & select asset"
          rules={{ required: "Select Asset is required" }}
          options={AssetData.map(d => ({
            label: `${d.asset_name} (${d.asset_tag})`,
            value: d.asset_tag,
          }))}
          defaultValue=""
          error={errors?.asset}
        />

        {/* Action Type (Read-only fixed) */}
        <SharedInput
          label="Action Type"
          name="action_type"
          type="select"
          register={register}
          placeholder="Repair Request"
          readOnly
        />

        {/* Issue Type */}
        <SharedInput
          label="Issue Type"
          name="issue_type"
          type="select"
          register={register}
          placeholder="Select issue type"
          options={issueTypeOptions}
          rules={{ required: "Issue Type is required" }}
          error={errors?.issue_type}
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

        {/* Condition Rating */}
        <SharedInput
          label="Current Condition"
          name="condition_rating"
          type="select"
          register={register}
          placeholder="Select condition"
          options={conditionRatingOptions}
        />

        {/* Issue Description */}
        <div className="col-span-2">
          <SharedInput
            label="Issue Description"
            name="issue_description"
            type="textarea"
            register={register}
            placeholder="Describe the issue"
            rules={{ required: "Issue description is required" }}
            error={errors?.issue_description}
          />
        </div>

        {/* Submit */}
        <div className="col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`px-6 h-11 font-semibold text-white rounded-lg shadow-md transition-all
            ${isSubmitting || isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
          >
            {isSubmitting || isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Submit Repair Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RepairAssetForm;
