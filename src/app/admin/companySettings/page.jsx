// src/app/admin/companySettings/page.jsx
"use client";

// React Components
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";

// Hooks
import { useToast } from "@/hooks/useToast";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { useImageUpload } from "@/hooks/useImageUpload";

// Shared
import Error from "@/Shared/Error/Error";
import Loading from "@/Shared/Loading/Loading";
import Shared_Input from "@/Shared/Shared_Input/Shared_Input";
import Shared_Button from "@/Shared/Shared_Button/Shared_Button";
import Shared_Input_Image from "@/Shared/Shared_Input_Image/Shared_Input_Image";

// Icons - Using available icons from react-icons/fi
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiCalendar,
  FiDollarSign,
  FiSave,
  FiRefreshCw,
  FiHome,
  FiImage
} from "react-icons/fi";

// Import from other icon sets for missing icons
import { FaBuilding, FaRegBuilding } from "react-icons/fa";

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

  // Check if logo has changed
  const hasLogoChanged = companyFile instanceof File;

  // Form
  const {
    reset,
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm();

  // Fetch Company
  const {
    data: CompanyData,
    isLoading: CompanyIsLoading,
    error: CompanyError,
    refetch,
  } = useQuery({
    queryKey: ["CompanyData"],
    queryFn: async () => {
      const res = await axiosPublic.get("/company");
      return res.data;
    },
    retry: false,
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
      success("Company settings updated successfully!");

      // reset form dirty state
      reset({
        organization_name: formData.organization_name,
        admin_email: formData.admin_email,
        phone_number: formData.phone_number,
        address: formData.address,
        currency_code: formData.currency_code,
        currency_locale: formData.currency_locale,
        fraction_digits: formData.fraction_digits,
        date_format: formData.date_format,
      });

      // reset logo state
      setCompanyFile(null);
      setCompanyPreview(null);

      // refetch company data
      refetch();
    } catch (err) {
      console.error(err);
      error(err.message || "Something went wrong while updating company settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading
  if (CompanyIsLoading) {
    return (
      <Loading
        message="Loading Company Settings"
        subText="Please wait while we fetch your company data."
      />
    );
  }

  // Error
  if (CompanyError) {
    return <Error error={CompanyError.message} />;
  }

  return (
    <div className="p-2 md:p-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-t-lg flex items-center justify-between p-4 md:px-6 md:py-4 md:mx-0 mt-2 md:mt-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Company Settings
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Manage your company profile and preferences
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-gray-200 rounded-b-lg md:rounded-b-xl p-4 md:p-6 space-y-6 md:space-y-8"
      >
        {/* Company Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Organization Information Card */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
              <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-2 h-5 rounded-full"></span>
                Organization Information
              </h4>
              <div className="space-y-4">
                {/* Organization Name */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaRegBuilding className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Organization Name *</label>
                  </div>
                  <Shared_Input
                    name="organization_name"
                    register={register}
                    placeholder="Enter your company name"
                    rules={{
                      required: "Organization Name is required",
                      minLength: { value: 3, message: "Minimum 3 characters" },
                      maxLength: { value: 50, message: "Maximum 50 characters" },
                    }}
                    errors={errors}
                    fullWidth
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiPhone className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                  </div>
                  <Shared_Input
                    name="phone_number"
                    register={register}
                    placeholder="e.g., +1 (555) 123-4567"
                    rules={{
                      required: "Phone Number is required",
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: "Invalid phone number format",
                      },
                    }}
                    errors={errors}
                    fullWidth
                  />
                </div>
              </div>
            </div>

            {/* Currency Settings Card */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
              <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
                Currency Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Currency Code */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiDollarSign className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Currency Code *</label>
                  </div>
                  <Shared_Input
                    name="currency_code"
                    type="select"
                    register={register}
                    placeholder="Select currency"
                    options={[
                      { label: "USD - US Dollar", value: "USD" },
                      { label: "EUR - Euro", value: "EUR" },
                      { label: "GBP - British Pound", value: "GBP" },
                      { label: "BDT - Bangladeshi Taka", value: "BDT" },
                      { label: "INR - Indian Rupee", value: "INR" },
                      { label: "JPY - Japanese Yen", value: "JPY" },
                      { label: "CAD - Canadian Dollar", value: "CAD" },
                      { label: "AUD - Australian Dollar", value: "AUD" },
                    ]}
                    rules={{ required: "Currency Code is required" }}
                    errors={errors}
                    fullWidth
                  />
                </div>

                {/* Currency Locale */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiGlobe className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Locale *</label>
                  </div>
                  <Shared_Input
                    name="currency_locale"
                    type="select"
                    register={register}
                    placeholder="Select locale"
                    options={[
                      { label: "en-US - United States", value: "en-US" },
                      { label: "en-GB - United Kingdom", value: "en-GB" },
                      { label: "fr-FR - France", value: "fr-FR" },
                      { label: "de-DE - Germany", value: "de-DE" },
                      { label: "bn-BD - Bangladesh", value: "bn-BD" },
                      { label: "hi-IN - India", value: "hi-IN" },
                      { label: "ja-JP - Japan", value: "ja-JP" },
                      { label: "es-ES - Spain", value: "es-ES" },
                    ]}
                    rules={{ required: "Currency Locale is required" }}
                    errors={errors}
                    fullWidth
                  />
                </div>

                {/* Fraction Digits */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400">#</span>
                    <label className="text-sm font-medium text-gray-700">Fraction Digits *</label>
                  </div>
                  <Shared_Input
                    name="fraction_digits"
                    type="number"
                    register={register}
                    placeholder="e.g., 2 (for cents)"
                    rules={{
                      required: "Fraction Digits is required",
                      min: { value: 0, message: "Minimum 0" },
                      max: { value: 10, message: "Maximum 10" }
                    }}
                    errors={errors}
                    fullWidth
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of decimal places for currency display (usually 2 for cents)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
              <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
                Contact Information
              </h4>
              <div className="space-y-4">
                {/* Admin Email */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiMail className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Contact Email *</label>
                  </div>
                  <Shared_Input
                    name="admin_email"
                    register={register}
                    placeholder="admin@company.com"
                    rules={{
                      required: "Admin Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    }}
                    errors={errors}
                    fullWidth
                  />
                </div>

                {/* Company Logo */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiImage className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Company Logo</label>
                  </div>
                  <Shared_Input_Image
                    file={companyFile}
                    setFile={setCompanyFile}
                    previewUrl={companyPreview || CompanyData?.contact?.logo}
                    setPreviewUrl={setCompanyPreview}
                    label="Upload company logo"
                    name="company_logo"
                    errors={errors}
                    size="lg"
                    accept="image/*"
                    aspectRatio="square"
                    maxSizeMB={5}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 500×500px PNG or JPG. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Date Format Card */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
              <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-amber-100 text-amber-600 w-2 h-5 rounded-full"></span>
                Date & Format Settings
              </h4>
              <div className="space-y-4">
                {/* Date Format */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="text-gray-400 w-4 h-4" />
                    <label className="text-sm font-medium text-gray-700">Date Format *</label>
                  </div>
                  <Shared_Input
                    name="date_format"
                    type="select"
                    register={register}
                    placeholder="Select date format"
                    options={[
                      { label: "DD-MM-YYYY (European)", value: "DD-MM-YYYY" },
                      { label: "MM-DD-YYYY (American)", value: "MM-DD-YYYY" },
                      { label: "YYYY-MM-DD (ISO)", value: "YYYY-MM-DD" },
                      { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
                      { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
                      { label: "YYYY/MM/DD", value: "YYYY/MM/DD" },
                    ]}
                    rules={{ required: "Date Format is required" }}
                    errors={errors}
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 w-2 h-5 rounded-full"></span>
            Company Address
          </h4>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiMapPin className="text-gray-400 w-4 h-4" />
              <label className="text-sm font-medium text-gray-700">Full Address</label>
            </div>
            <Shared_Input
              name="address"
              type="textarea"
              register={register}
              placeholder="Enter your company's full address including city, state, and zip code"
              rows={4}
              errors={errors}
              fullWidth
            />
            <p className="text-xs text-gray-500 mt-2">
              This address will be used for official communications and invoices
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-4 md:-mx-6 px-4 md:px-6 pb-2 md:pb-0">
          <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
            {/* Reset Button */}
            <Shared_Button
              type="button"
              onClick={() => {
                reset({
                  organization_name: CompanyData?.name || "",
                  admin_email: CompanyData?.contact?.email || "",
                  phone_number: CompanyData?.contact?.phone || "",
                  address: CompanyData?.contact?.address || "",
                  currency_code: CompanyData?.settings?.currency?.code || "USD",
                  currency_locale: CompanyData?.settings?.currency?.location || "en-US",
                  fraction_digits: CompanyData?.settings?.currency?.fractionalDigits || 2,
                  date_format: CompanyData?.settings?.dateFormat || "DD-MM-YYYY",
                });
                setCompanyFile(null);
                setCompanyPreview(CompanyData?.contact?.logo || null);
              }}
              variant="ghost"
              className="w-full md:w-auto"
              disabled={!isDirty && !hasLogoChanged}
            >
              <FiRefreshCw className="mr-2" />
              Reset Changes
            </Shared_Button>

            {/* Save Button */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {(!isDirty && !hasLogoChanged) && (
                <span className="text-sm text-gray-500 text-center md:text-left">
                  No changes to save
                </span>
              )}
              <Shared_Button
                type="submit"
                variant="primary"
                loading={isLoading || uploadingImage}
                disabled={!isDirty && !hasLogoChanged}
                className="w-full md:w-auto"
              >
                <FiSave className="mr-2" />
                Save Changes
              </Shared_Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanySettingsPage;