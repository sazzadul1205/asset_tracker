// Icons
import { IoMdArrowRoundBack } from "react-icons/io";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";

// Remove assigned assets from list
function RemoveAssigned(data) {
  return data.filter(item => !item.assigned_to);
}

const RequestAssetForm = ({
  reset,
  errors,
  control,
  register,
  isLoading,
  formError,
  isSubmitting,
  handleSubmit,
  AllAssetData,
  setSelectedAction,
  handleUniversalSubmit,
}) => {

  // Remove assigned assets
  const AssetData = RemoveAssigned(AssetBasicInfoData);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Request Asset
          </h3>
          <p className="text-sm text-gray-600">
            Fill in the details to request an asset.
          </p>
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

      {/* form Error */}
      {formError && (
        <div className="py-3 bg-red-100 border border-red-400 rounded-lg mb-4">
          <p className="text-red-500 font-semibold text-center">{formError}</p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit((data) => handleUniversalSubmit(data, "request"))}
        className="space-y-3 grid grid-cols-2 gap-4"
      >
        {/* Select Asset (Controlled) */}
        <SharedInput
          label="Select Asset"
          name="asset"
          type="select"
          control={control}
          searchable={true}
          placeholder="Search & select asset"
          rules={{ required: "Select Asset is required" }}
          options={AllAssetData.map(d => ({
            label: `${d.asset_name} (${d.asset_tag})`,
            value: d.asset_tag,
          }))}
          defaultValue=""
          error={errors?.asset}
        />

        {/* Action Type (Read-only) */}
        <SharedInput
          label="Action Type"
          name="action_type"
          type="select"
          register={register}
          placeholder="Request Asset"
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
            { label: "Select Priority", value: "" },
            { label: "Critical", value: "critical" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ]}
          rules={{ required: "Priority is required" }}
          error={errors?.priority}
        />

        {/* Expected Return Date (Controlled) */}
        <SharedInput
          label="Expected Return Date"
          name="return_date"
          type="date"
          control={control}
          placeholder="Select return date"
          defaultValue=""
          dateLimit="future"
          error={errors?.return_date}
        />

        {/* Notes */}
        <div className="col-span-2">
          <SharedInput
            label="Notes"
            name="notes"
            type="textarea"
            register={register}
            placeholder="e.g. Some notes"
            rules={{ required: "Notes is required" }}
            error={errors?.notes}
          />
        </div>

        {/* Submit Button */}
        <div className="col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`px-6 h-11 font-semibold text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center 
                ${isSubmitting || isLoading
                ? "bg-blue-400 cursor-not-allowed pointer-events-none"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
              }`}
          >
            {isSubmitting || isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Create Asset Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestAssetForm;