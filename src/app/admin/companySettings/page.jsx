"use client";

import useAxiosPublic from "@/hooks/useAxiosPublic";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/useToast";
import Error from "@/Shared/Error/Error";
import Loading from "@/Shared/Loading/Loading";
import Shared_Input from "@/Shared/Shared_Input/Shared_Input";
import Shared_Input_Image from "@/Shared/Shared_Input_Image/Shared_Input_Image";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const CompanySettingsPage = () => {
  const axiosPublic = useAxiosPublic();

  // Hooks
  const { uploadImage, loading: uploadingImage, error: uploadingImageError } = useImageUpload();
  const { success, error } = useToast();

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // Company Data
  const [companyFile, setCompanyFile] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyPreview, setCompanyPreview] = useState(null);

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();


  // Fetch Company
  const {
    data: CompanyData,
    isLoading: CompanyIsLoading,
    error: CompanyError,
  } = useQuery({
    queryKey: ["CompanyData"],
    queryFn: async () => {
      const res = await axiosPublic.get("/company");
      return res.data; // return the company data directly
    },
    retry: false, // optional: avoid retrying on error
  });


  // Load existing company data on mount
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (CompanyData) {
          setValue("organization_name", CompanyData.name);
          setValue("admin_email", CompanyData.contact.email);
          setValue("phone_number", CompanyData.contact.phone);
          setValue("address", CompanyData.contact.address);
          setValue("currency_code", CompanyData.settings.currency.code);
          setValue("currency_locale", CompanyData.settings.currency.location);
          setValue("fraction_digits", CompanyData.settings.currency.fractionalDigits);
          setValue("date_format", CompanyData.settings.dateFormat);
          if (CompanyData.contact.logo) setCompanyLogo(CompanyData.contact.logo);
        }
      } catch (err) {
        console.error("Failed to load company data:", err);
      }
    };

    fetchCompany();
  }, [CompanyData, setValue]);

  // Handle form submission
  const onSubmit = async (formData) => {
    setIsLoading(true);

    try {
      let uploadedImageUrl = companyLogo;

      // 1. Upload image ONLY if a new file was selected
      if (companyFile instanceof File) {
        const url = await uploadImage(companyFile);

        if (!url) {
          throw new Error(uploadingImageError || "Logo upload failed");
        }

        uploadedImageUrl = url;
      }

      // 2. Prepare payload
      const payload = {
        name: formData.organization_name,
        contact: {
          email: formData.admin_email,
          phone: formData.phone_number,
          address: formData.address,
          logo: uploadedImageUrl,
        },
        settings: {
          currency: {
            code: formData.currency_code,
            location: formData.currency_locale,
            fractionalDigits: Number(formData.fraction_digits) || 2,
          },
          dateFormat: formData.date_format,
        },
        metadata: {
          updatedAt: new Date(),
        },
      };

      // 3. Update company (Axios throws if it fails)
      await axiosPublic.put("/company", payload);

      // 4. SUCCESS — only reached if EVERYTHING worked
      success("Company updated successfully");
      setCompanyFile(null);
    } catch (err) {
      console.error(err);
      error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };


  // Loading
  if (CompanyIsLoading) {
    return <Loading message="Loading Company Data ..." subText="Please wait while we fetch your data." />;
  }

  // Error
  if (CompanyError) {
    return <Error error={CompanyError.message} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 flex items-center justify-between px-6 py-4 mx-2 mt-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Company Settings
        </h3>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-gray-200 px-6 py-4 mx-2 space-y-6"
      >
        <div className="grid grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-4">
            <Shared_Input
              label="Organization Name"
              name="organization_name"
              register={register}
              placeholder="Enter Organization Name"
              rule={true}
              rules={{
                required: "Organization Name is required",
                minLength: { value: 3, message: "Minimum 3 characters" },
                maxLength: { value: 50, message: "Maximum 50 characters" },
              }}
              errors={errors}
            />

            <Shared_Input
              label="Phone Number"
              name="phone_number"
              register={register}
              placeholder="Enter Phone Number"
              rule={true}
              rules={{
                required: "Phone Number is required",
                pattern: {
                  value: /^[0-9]{10,15}$/,
                  message: "Invalid phone number",
                },
              }}
              errors={errors}
            />

            {/* Currency */}
            <div className="grid grid-cols-2 gap-4">
              <Shared_Input
                label="Currency Code"
                name="currency_code"
                type="select"
                register={register}
                placeholder="Select Currency Code"
                options={[
                  { label: "USD", value: "USD" },
                  { label: "EUR", value: "EUR" },
                  { label: "GBP", value: "GBP" },
                  { label: "BDT", value: "BDT" },
                  { label: "INR", value: "INR" },
                ]}
                rule={true}
                rules={{ required: "Currency Code is required" }}
                errors={errors}
              />
              <Shared_Input
                label="Currency Locale"
                name="currency_locale"
                type="select"
                register={register}
                placeholder="Select Currency Locale"
                options={[
                  { label: "en-US", value: "en-US" },
                  { label: "en-GB", value: "en-GB" },
                  { label: "fr-FR", value: "fr-FR" },
                  { label: "bn-BD", value: "bn-BD" },
                  { label: "hi-IN", value: "hi-IN" },
                ]}
                rule={true}
                rules={{ required: "Currency Locale is required" }}
                errors={errors}
              />
            </div>

            <Shared_Input
              label="Fraction Digits"
              name="fraction_digits"
              type="number"
              register={register}
              placeholder="Enter Fraction Digits"
              rule={true}
              rules={{ required: "Fraction Digits is required" }}
              errors={errors}
            />

            <Shared_Input
              label="Date Format"
              name="date_format"
              type="select"
              register={register}
              placeholder="Select Date Format"
              options={[
                { label: "DD-MM-YYYY", value: "DD-MM-YYYY" },
                { label: "MM-DD-YYYY", value: "MM-DD-YYYY" },
                { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
              ]}
              rule={true}
              rules={{ required: "Date Format is required" }}
              errors={errors}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Admin Email */}
            <Shared_Input
              label="Admin Email"
              name="admin_email"
              register={register}
              placeholder="Enter Admin Email"
              rule={true}
              rules={{
                required: "Admin Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              }}
              errors={errors}
            />

            {/* Company Logo */}
            <Shared_Input_Image
              file={companyFile}
              setFile={setCompanyFile}
              previewUrl={companyPreview || CompanyData?.contact?.logo}
              setPreviewUrl={setCompanyPreview}
              label="Company Logo"
              name="company_logo"
              errors={errors}
            />
          </div>
        </div>

        <Shared_Input
          label="Address"
          name="address"
          type="textarea"
          register={register}
          placeholder="Enter Address"
          rule={true}
          errors={errors}
        />

        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className={`px-6 h-11 font-semibold text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center ${isLoading || uploadingImage
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
          >
            {isLoading || uploadingImage ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettingsPage;
