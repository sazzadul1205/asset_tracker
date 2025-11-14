// React Components
import React, { useRef, useState } from "react";

// React Hook Form
import { useForm } from "react-hook-form";

// Icons
import { ImCross } from "react-icons/im";

// Shared Components
import SharedInput from "@/Shared/SharedInput/SharedInput";
import MultiFieldInput from "@/Shared/MultiFieldInput/MultiFieldInput";
import SharedImageInput from "@/Shared/SharedImageInput/SharedImageInput";

// Hooks
import { useToast } from "@/Hooks/Toasts";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { useImageUpload } from "@/Hooks/useImageUpload";


const AddDepartmentModal = ({
  UserEmail,
  RefetchAll,
  BasicUserInfoData,
}) => {
  const { success } = useToast();
  const imageInputRef = useRef();
  const axiosPublic = useAxiosPublic();
  const { uploadImage } = useImageUpload();

  // States 
  const [isOpen, setIsOpen] = useState(false);
  const [iconImage, setIconImage] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  // Default Icon
  const placeholderIcon = "https://i.ibb.co/9996NVtk/info-removebg-preview.png";

  // Department Managers Data Destructure
  const managersList = BasicUserInfoData
    .filter(user => user && user.employee_id && user.full_name)
    .map(user => ({
      value: user.employee_id,
      label: user.full_name,
    }));

  // Form Handlers
  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Handle Close
  const handleClose = () => {
    reset();
    setFormError(null);
    setIconImage(null);
    setSelectedColor("#ffffff");
    imageInputRef.current?.resetToDefault?.();
    document.getElementById("Add_Department_Modal")?.close();
  };

  // Handle Submit
  const onSubmit = async (data) => {
    setFormError(null);
    setIsLoading(true);

    try {
      // Check if UserEmail is present
      if (!UserEmail) {
        setFormError("User email not found. Please log in.");
        return;
      }

      // Lookup full manager info by selected value
      const selectedManager = BasicUserInfoData.find(
        user => user.employee_id === data.department_manager.value
      );

      // Check if selected manager is found
      if (!selectedManager) {
        setFormError("Selected manager not found.");
        return;
      }

      // Upload Icon
      let uploadedImageUrl = placeholderIcon;

      // Upload only if a new image is selected
      if (iconImage) {
        const url = await uploadImage(iconImage);
        if (!url) {
          setFormError("Failed to upload icon image.");
          return;
        }
        uploadedImageUrl = url;
      }

      // Prepare Department payload
      const DepartmentPayload = {
        selectedColor,
        created_by: UserEmail,
        manager: selectedManager,
        iconImage: uploadedImageUrl,
        positions: data.positions || [],
        department_name: data.department_name.trim(),
        department_budget: Number(data.department_budget),
        department_description: data.department_description?.trim() || "",
      };

      // Send DepartmentPayload
      const departmentResponse = await axiosPublic.post("/Departments", DepartmentPayload);

      // Grab the dept_id from response
      const deptId = departmentResponse.data?.dept_id;

      if (!deptId) {
        throw new Error("Failed to get department ID from response.");
      }

      // Prepare User payload
      const UserPayload = {
        fixed: true,
        position: "Manager",
        access_level: "Manager",
        department: deptId, // use dept_id instead of name
      };

      // Send UserPayload
      const userResponse = await axiosPublic.put(
        `/Users/${selectedManager.employee_id}`,
        UserPayload
      );

      if (
        departmentResponse.status === 201 ||
        departmentResponse.status === 200 ||
        userResponse.status === 201 ||
        userResponse.status === 200
      ) {
        handleClose();
        RefetchAll?.();
        success("Department created successfully!");
      } else {
        setFormError(departmentResponse.data?.message || "Failed to create department");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setFormError(err.response?.data?.message || "Failed to submit form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="Add_Department_Modal"
      className="modal-box w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto scrollbar-none bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">
          Add New Department
        </h3>
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* form Error */}
      {formError && (
        <div className="py-3 bg-red-100 border border-red-400 rounded-lg mb-4">
          <p className="text-red-500 font-semibold text-center">{formError}</p>
        </div>
      )}

      <hr className="my-3 border-gray-300" />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Department Name */}
        <SharedInput
          label="Department Name"
          name="department_name"
          register={register}
          placeholder="e.g. Computer, Mobile, Laptop"
          rules={{ required: "Department Name is required" }}
          error={errors.department_name}
        />

        {/* Department Description */}
        <SharedInput
          label="Department Description"
          name="department_description"
          type="textarea"
          register={register}
          placeholder="e.g. A Department description"
          rules={{ required: "Department Description is required" }}
          error={errors.department_description}
        />

        {/* Manager */}
        <SharedInput
          label="Manager"
          name="department_manager"
          type="select"
          control={control}
          placeholder="Select Manager"
          options={managersList}
          rules={{ required: "Manager is required" }}
          searchable={true}
        />

        {/* Budget */}
        <SharedInput
          label="Budget"
          name="department_budget"
          register={register}
          type="number"
          placeholder="e.g. 1000"
          rules={{
            required: "Budget is required",
            min: {
              value: 5001,
              message: "Budget must be more than 5000"
            }
          }}
          error={errors.department_budget}
          min={5001}
        />

        {/* Position(s) */}
        <MultiFieldInput
          register={register}
          control={control}
          errors={errors}
          fieldName="positions"
          title="Position(s)"
          minRows={1} // always at least 1 row
          showIndex={false} // optional: hide row index
          fieldsConfig={[
            {
              type: "text",
              name: "position_name",
              label: "Position",
              placeholder: "Enter position",
              widthClass: "flex-1",
              rules: { required: "Position is required" }
            },
          ]}
        />

        {/* Asset Department Icon Drawer */}
        <div className="mt-6">
          {/* Header / Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Department Icon (Optional)
            </h3>
            <span
              className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                }`}
            >
              ▼
            </span>
          </button>

          {/* Drawer Content */}
          <div
            className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-96 mt-4" : "max-h-0"
              }`}
          >
            <div className="mx-auto flex flex-wrap items-center gap-6 justify-center">
              {/* Icon Upload */}
              <div
                className="relative flex items-center justify-center w-20 h-20 border border-gray-300 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
                style={{ backgroundColor: selectedColor }}
              >
                <SharedImageInput
                  ref={imageInputRef}
                  hint=""
                  label=""
                  width={64}
                  height={64}
                  rounded="xl"
                  enableCrop={false}
                  onChange={setIconImage}
                  defaultImage={placeholderIcon}
                />
              </div>

              {/* Background Color Picker */}
              <div className="flex flex-col items-center gap-3">
                <label htmlFor="iconColor" className="text-gray-700 font-medium text-sm">
                  Icon Background:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="iconColor"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-mono">
                    {selectedColor?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          {/* Cancel */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className={`px-5 h-11 font-semibold rounded-lg border transition-all duration-200 
              ${isSubmitting || isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98]"
              }`}
          >
            Cancel
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`px-6 h-11 font-semibold text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center 
              ${isSubmitting || isLoading
                ? "bg-blue-400 cursor-not-allowed pointer-events-none"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
              }`}
          >
            <span className="flex items-center justify-center w-48">
              {isSubmitting || isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Create Department"
              )}
            </span>
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddDepartmentModal;