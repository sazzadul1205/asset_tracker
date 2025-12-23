// src/app/admin/departments/Add_New_Department_Modal/Add_New_Department_Modal.jsx

// React Components
import { useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import React, { useState } from 'react';

// Hooks
import { useToast } from '@/hooks/useToast';
import useAxiosPublic from '@/hooks/useAxiosPublic';
import { useImageUpload } from '@/hooks/useImageUpload';

// Shared
import Shared_Input from '@/Shared/Shared_Input/Shared_Input';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import Shared_Input_Image from '@/Shared/Shared_Input_Image/Shared_Input_Image';
import Shared_Multi_Field_Input from '@/Shared/Shared_Multi_Field_Input/Shared_Multi_Field_Input';

// Icons
import { ImCross } from 'react-icons/im';

const Add_New_Department_Modal = ({ RefetchAll }) => {
  const axiosPublic = useAxiosPublic();
  const { success, error } = useToast();
  const { uploadImage, error: imageError } = useImageUpload();

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [iconImage, setIconImage] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [placeholderIcon] = useState("https://i.ibb.co/9996NVtk/info-removebg-preview.png");

  // Global states
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Inside component, after useForm initialization
  const {
    reset,
    control,
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Get User Options
  const {
    data: managerOptionsData,
    isLoading: managerLoading,
  } = useQuery({
    queryKey: ["userOptions"],
    queryFn: async () =>
      axiosPublic
        .get(`/users/UserOptions`, {
          params: {
            excludePosition: "manager",
          },
        })
        .then(res => res.data.data),
  });

  // Transform into { label, value } format for the select
  const managerOptions = [
    { label: "Unassigned", value: "unassigned" },
    ...(managerOptionsData?.map((user) => (
      {
        label: user.personal.name,
        value: user.personal.userId,
      }))
      || []),
  ];

  // Close modal handler
  const handleClose = () => {
    reset();
    setGlobalError("");
    document.getElementById("Add_New_Department_Modal")?.close();
  }

  // Submit Handler (react-hook-form)
  const onSubmit = async (data) => {
    setGlobalError("");
    setLoading(true);

    try {
      // Generate Department ID if not provided
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const departmentId = data.departmentId?.trim() || `DEP-${Date.now()}-${randomSuffix}`;

      // Upload Icon
      let iconUrl = placeholderIcon;
      if (iconImage) {
        const uploadedUrl = await uploadImage(iconImage);
        if (uploadedUrl) iconUrl = uploadedUrl;
      }

      // Ensure manager.userId is always string
      const managerUserId = data.manager?.userId || "unassigned";

      // Map positions to objects that backend expects
      const positions = (data.items || [])
        .map(item => item.position_name?.trim())
        .filter(Boolean)
        .map(position_name => ({ position_name }));

      // Ensure at least one position
      if (positions.length === 0) {
        setError("items", { type: "manual", message: "At least one position is required" });
        setLoading(false);
        return;
      }

      // Prepare payload
      const payload = {
        departmentId,
        info: {
          name: data.info?.name || "",
          description: data.info?.description || "",
          status: data.info?.status || "active",
          icon: iconUrl,
          iconBgColor: selectedColor || "#e5e7eb",
        },
        manager: {
          userId: managerUserId,
        },
        stats: {
          employeeCount: parseInt(data.stats?.employeeCount || 0, 10),
          budget: Number(data.stats?.budget || 0),
        },
        items: positions,
      };

      // Send request
      const response = await axiosPublic.post("/department", payload);

      // Handle response
      if (response.status === 201) {
        success("Department created successfully!");
        handleClose?.();
        RefetchAll?.();
      }
    } catch (error) {

      // Log error
      console.error("[Axios Public] Error creating department:", error);

      // Handle error
      const serverError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        error?.error ||
        "Something went wrong. Please try again.";

      // Set error
      setGlobalError(serverError);

      // Set errors
      if (serverError.toLowerCase().includes("department")) setError("departmentId", { type: "server", message: serverError });
      if (serverError.toLowerCase().includes("name")) setError("info.name", { type: "server", message: serverError });
      if (serverError.toLowerCase().includes("description")) setError("info.description", { type: "server", message: serverError });
      if (serverError.toLowerCase().includes("manager")) setError("manager.userId", { type: "server", message: serverError });
      if (serverError.toLowerCase().includes("budget")) setError("stats.budget", { type: "server", message: serverError });
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Error
  if (imageError) error(imageError);

  return (
    <div
      id="Add_New_Department_Modal"
      className="modal-box w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="tracking-tight text-xl font-semibold text-gray-900">Add New Department</h3>
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
      <form onSubmit={handleSubmit(onSubmit)} className="pt-4 space-y-4">
        {/* Department Name */}
        <Shared_Input
          label="Department Name"
          name="info.name"
          register={register}
          errors={errors}
          placeholder="Enter the name of the department"
          rules={{ required: "Department name is required" }}
          control={control}
          error={errors.department_name}
        />

        {/* Description */}
        <Shared_Input
          label="Description"
          name="info.description"
          register={register}
          errors={errors}
          placeholder="Enter the description of the department"
          rules={{ required: "Description is required" }}
          control={control}
          error={errors.description}
        />

        {/* Manager */}
        <Controller
          name="manager.userId"
          control={control}
          rules={{ required: "Manager is required" }}
          render={({ field }) => (
            <Shared_Input
              {...field}
              label="Manager (Select or search for the manager)"
              type="searchable"
              placeholder="Select or search for the manager"
              options={managerOptions}
              disabled={managerLoading}
              errors={errors}
            />
          )}
        />

        {/* Budget */}
        <Controller
          name="stats.budget"
          control={control}
          rules={{ required: "Budget is required" }}
          render={({ field }) => (
            <Shared_Input
              label="Budget"
              type="currency"
              placeholder="Enter the budget"
              {...field}  // passes value (number) and onChange
            />
          )}
        />


        {/* Positions */}
        <Shared_Multi_Field_Input
          register={register}
          control={control}
          errors={errors}
          fieldName="items"
          title="Positions"
          comment="Add one or more positions. At least one is required."
          showIndex={true}
          fieldsConfig={[
            {
              type: "text",
              name: "position_name",
              label: "Position",
              placeholder: "Enter position",
              widthClass: "flex-1 min-w-[200px]",
              rules: { required: "Position is required" },
            },
          ]}
        />

        {/* Asset Department Icon Drawer */}
        <div className="mt-6">
          {/* Header / Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors cursor-pointer "
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
            className={`overflow-hidden transition-all duration-500 
              ${isOpen ? "max-h-96 mt-4" : "max-h-0"}`}
          >
            <div className="mx-auto flex flex-wrap items-center gap-6 justify-center">

              {/* Icon Upload */}
              <div
                className="relative flex items-center justify-center w-20 h-20
                   border border-gray-300 rounded-xl shadow-sm hover:shadow-md" style={{ backgroundColor: selectedColor }}
              >
                <Shared_Input_Image
                  file={iconImage}
                  setFile={setIconImage}
                  previewUrl={iconPreview}
                  setPreviewUrl={setIconPreview}
                  placeholderImage={placeholderIcon}
                  hideLabel
                  size="sm"
                  containerClass="w-20 h-20"
                />
              </div>

              {/* Background Color Picker */}
              <div className="flex flex-col items-center gap-3">
                <label
                  htmlFor="iconColor"
                  className="text-gray-700 font-medium text-sm"
                >
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
            Create New Department
          </Shared_Button>
        </div>
      </form >
    </div>
  );
};

export default Add_New_Department_Modal;