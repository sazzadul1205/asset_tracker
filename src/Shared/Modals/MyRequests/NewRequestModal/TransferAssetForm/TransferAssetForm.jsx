// Icons
import { IoMdArrowRoundBack } from "react-icons/io";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";

// Utils
import { getAssetsByEmail } from "../ReturnAssetForm/ReturnAssetForm";

const TransferAssetForm = ({
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
  UsersBasicInfoData,
  onAssetTransferSubmit,
}) => {

  // Remove assigned assets
  const AssetData = getAssetsByEmail(AssetBasicInfoData, UserEmail);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Transfer Asset</h3>
          <p className="text-sm text-gray-600">
            Fill in the details to retire an asset.
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
        onSubmit={handleSubmit(onAssetTransferSubmit)}
        className="space-y-3 grid grid-cols-2 gap-4"
      >
        {/* Select Asset */}
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

        {/* Action Type */}
        <SharedInput
          label="Action Type"
          name="action_type"
          type="text"
          register={register}
          readOnly
          defaultValue="Transfer Asset"
        />

        {/* Transfer To (User) */}
        <SharedInput
          label="Transfer To"
          name="transfer_to"
          type="select"
          control={control}
          searchable={true}
          placeholder="Search & select user"
          rules={{ required: "Select User is required" }}
          options={UsersBasicInfoData?.map(d => ({
            label: `${d.full_name} (${d.employee_id})`,
            value: d.employee_id,
          }))}
          defaultValue=""
          error={errors?.transfer_to}
        />

        {/* Transfer Date */}
        <SharedInput
          label="Transfer Date"
          name="transfer_date"
          type="date"
          control={control}
          register={register}
          rules={{ required: "Transfer Date is required" }}
          defaultValue=""
          dateLimit="future"
          error={errors?.return_date}
        />

        {/* Transfer Reason */}
        <SharedInput
          label="Transfer Reason"
          name="transfer_reason"
          type="select"
          register={register}
          placeholder="Select reason"
          options={[
            { label: "Employee Transfer", value: "employee_transfer" },
            { label: "Department Change", value: "department_change" },
            { label: "Replacement", value: "replacement" },
            { label: "Project Assignment", value: "project_assignment" },
            { label: "Other", value: "other" },
          ]}
        />

        {/* Notes */}
        <div className="col-span-2">
          <SharedInput
            label="Notes"
            name="notes"
            type="textarea"
            register={register}
            placeholder="Add optional notes"
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
              "Submit Retire Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferAssetForm;