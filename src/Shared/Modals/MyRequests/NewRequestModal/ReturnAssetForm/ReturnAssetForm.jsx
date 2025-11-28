// Icons
import { IoMdArrowRoundBack } from "react-icons/io";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";

// Condition Rating Options
const conditionRatingOptions = [
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
  { label: "Broken", value: "broken" },
];

const ReturnAssetForm = ({
  reset,
  errors,
  control,
  register,
  isLoading,
  MyAssetData,
  isSubmitting,
  handleSubmit,
  setSelectedAction,
  handleUniversalSubmit,
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Return Asset
          </h3>
          <p className="text-sm text-gray-600">
            Fill in the details to return an asset.
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

      {/* Form */}
      <form
        onSubmit={handleSubmit((data) => handleUniversalSubmit(data, "return"))}
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
          options={MyAssetData.map(d => ({
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
          placeholder="Return Asset"
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

        {/* Return Date */}
        <SharedInput
          label="Return Date"
          name="return_date"
          type="date"
          control={control}
          placeholder="Select return date"
          defaultValue=""
          dateLimit="future"
          rules={{ required: "Return Date is required" }}
          error={errors?.return_date}
        />

        {/* Condition Rating */}
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
            className={`h-11 w-64 font-semibold text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center 
              ${isSubmitting || isLoading
                ? "bg-blue-400 cursor-not-allowed pointer-events-none"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
              }`}
          >
            {isSubmitting || isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Create Asset Return Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnAssetForm;