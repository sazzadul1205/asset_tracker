"use client";

// React Components
import React, { useEffect, useState } from "react";

// Next Components
import { useSession } from "next-auth/react";

// Packages
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

// Shared
import Error from "@/Shared/Error/Error";
import Loading from "@/Shared/Loading/Loading";
import SharedInput from "@/Shared/SharedInput/SharedInput";
import CompanyLogoInput from "./CompanyLogoInput/CompanyLogoInput ";

// Hooks
import { useToast } from "@/Hooks/Toasts";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { useImageUpload } from "@/Hooks/useImageUpload";

const CompanySettingsPage = () => {
  const axiosPublic = useAxiosPublic();
  const { success, error } = useToast();
  const { uploadImage } = useImageUpload();
  const { data: session } = useSession();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);

  const {
    reset,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const placeholderIcon = "https://i.ibb.co/9996NVtk/info-removebg-preview.png";

  // Fetch Company
  const {
    data: CompanyData,
    error: CompanyError,
    refetch: CompanyRefetch,
    isLoading: CompanyIsLoading,
  } = useQuery({
    queryKey: ["CompanyData", session?.user?.email],
    queryFn: () =>
      axiosPublic.get(`/Company/${session?.user?.email}`).then((res) => res.data.data),
    keepPreviousData: true,
    enabled: !!session?.user?.email,
  });

  // Populate form when CompanyData loads
  useEffect(() => {
    if (CompanyData && CompanyData.length > 0) {
      const company = CompanyData[0]; // Assuming first item
      setValue("organization_name", company.organization_name);
      setValue("phone_number", company.phone_number);
      setValue("currency_code", company.currency_code);
      setValue("currency_locale", company.currency_locale);
      setValue("fraction_digits", company.fraction_digits);
      setValue("date_format", company.date_format);
      setValue("admin_email", company.admin_email);
      setValue("address", company.address);
      setCompanyLogo(company.company_logo);
    }
  }, [CompanyData, setValue]);


  const dateFormatOptions = [
    { label: `DD/MM/YYYY (31/12/2025)`, value: "DD/MM/YYYY" },
    { label: `MM/DD/YYYY (12/31/2025)`, value: "MM/DD/YYYY" },
    { label: `YYYY/MM/DD (2025/12/31)`, value: "YYYY/MM/DD" },
    { label: `DD-MMM-YYYY (31-Dec-2025)`, value: "DD-MMM-YYYY" },
    { label: `MMM-DD-YYYY (Dec-31-2025)`, value: "MMM-DD-YYYY" },
    { label: `YYYY-MM-DD (2025-12-31)`, value: "YYYY-MM-DD" },
    { label: `DD.MM.YYYY (31.12.2025)`, value: "DD.MM.YYYY" },
    { label: `MM.DD.YYYY (12.31.2025)`, value: "MM.DD.YYYY" },
    { label: `DD/MMM/YY (31/Dec/25)`, value: "DD/MMM/YY" },
    { label: `YYYY/MM/DD HH:mm (2025/12/31 14:30)`, value: "YYYY/MM/DD HH:mm" },
    { label: `DD-MM-YYYY HH:mm:ss (31-12-2025 14:30:45)`, value: "DD-MM-YYYY HH:mm:ss" },
  ];

  // Handle loading
  if (CompanyIsLoading) {
    return <Loading />;
  }

  // Handle errors
  if (CompanyError) {
    return <Error errors={[CompanyError]} />;
  }

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        error("User email not found. Please log in.");
        return;
      }

      let uploadedImageUrl = companyLogo || placeholderIcon;

      // Upload new logo if changed
      if (companyLogo && companyLogo !== CompanyData[0].company_logo) {
        const url = await uploadImage(companyLogo);
        if (!url) {
          error("Failed to upload logo.");
          return;
        }
        uploadedImageUrl = url;
      }

      const payload = {
        ...data,
        created_by: userEmail,
        company_logo: uploadedImageUrl,
      };

      await axiosPublic.put(`/Company/${encodeURIComponent(userEmail)}`, payload);

      CompanyRefetch();
      success("Company settings updated successfully");
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to submit form");
    } finally {
      setIsLoading(false);
    }
  };

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
        className="bg-white border border-gray-200 px-6 py-4 mx-2 space-y-4"
      >
        <div className="grid grid-cols-2 gap-10">
          {/* Left */}
          <div className="space-y-4">
            <SharedInput
              label="Organization Name"
              name="organization_name"
              register={register}
              placeholder="Enter Organization Name"
              rules={{ required: "Organization Name is required" }}
              error={errors.organization_name}
            />

            <SharedInput
              label="Phone Number"
              name="phone_number"
              register={register}
              placeholder="Enter Phone Number"
              rules={{ required: "Phone Number is required" }}
              error={errors.phone_number}
            />

            <div className="grid grid-cols-2 gap-4 items-center">
              <SharedInput
                label="Currency Code"
                name="currency_code"
                register={register}
                placeholder="Enter Currency Code"
                rules={{ required: "Currency Code is required" }}
                error={errors.currency_code}
              />

              <SharedInput
                label="Currency Locale"
                name="currency_locale"
                register={register}
                placeholder="Enter Currency Locale"
                rules={{ required: "Currency Locale is required" }}
                error={errors.currency_locale}
              />
            </div>

            <SharedInput
              label="Fraction Digits"
              name="fraction_digits"
              type="number"
              register={register}
              placeholder="Enter Fraction Digits"
              rules={{ required: "Fraction Digits is required" }}
              error={errors.fraction_digits}
            />

            <SharedInput
              label="Date Format"
              name="date_format"
              type="select"
              register={register}
              placeholder="Select Date Format"
              rules={{ required: "Date Format is required" }}
              error={errors.date_format}
              options={dateFormatOptions}
            />
          </div>

          {/* Right */}
          <div className="space-y-4">
            <SharedInput
              label="Admin Email"
              name="admin_email"
              register={register}
              placeholder="Enter Admin Email"
              rules={{ required: "Admin Email is required" }}
              error={errors.admin_email}
            />

            {/* Company Logo */}
            <CompanyLogoInput
              companyLogo={companyLogo}
              setCompanyLogo={setCompanyLogo}
              placeholderIcon={placeholderIcon}
            />
          </div>
        </div>

        <SharedInput
          label="Address"
          name="address"
          type="textarea"
          register={register}
          placeholder="Enter Address"
          error={errors.address}
        />

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 h-11 font-semibold text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center ${isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              } `}
          >
            {isLoading ? (
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
