// src/app/admin/assetsCategories/View_Category_Modal/View_Category_Modal.jsx

// React Components
import React from 'react';

// Next Components
import Image from 'next/image';

// Icons
import { ImCross } from 'react-icons/im';
import { FaIdBadge, FaTag, FaInfoCircle, FaSignal, FaCalendarAlt, FaPercentage, FaList } from "react-icons/fa";

const View_Category_Modal = ({
  selectedCategory,
  setSelectedCategory,
}) => {

  // Handle Close
  const handleClose = () => {
    setSelectedCategory(null);
    document.getElementById("View_Category_Modal")?.close();
  };

  if (!selectedCategory) {
    return null;
  }

  return (
    <div
      id="View_Category_Modal"
      className="modal-box w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon container */}
          <div
            className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: selectedCategory?.info?.iconBgColor || "#e2e8f0" }}
          >
            <Image
              src={selectedCategory?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
              alt={selectedCategory?.info?.name || "Category Icon"}
              width={32} // 8 * 4 = 32px (matches w-8)
              height={32} // matches h-8
              className="object-contain"
            />
          </div>

          {/* Text content */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">
              {selectedCategory?.info?.name || "Category Name"}
            </h3>
            <p className="text-gray-500 text-xs md:text-sm">
              Asset Category ID: {selectedCategory?.info?.categoryId || "N/A"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300 cursor-pointer"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4 mt-4" >
        {/* Basic Information */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Basic Information
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Category Id */}
            <div className="flex items-center gap-3">
              <FaIdBadge className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Category Id</p>
                <p className='font-medium'>{selectedCategory?.info?.categoryId || "N/A"}</p>
              </div>
            </div>

            {/* Category Name */}
            <div className="flex items-center gap-3">
              <FaTag className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Category Name</p>
                <p className='font-medium'>{selectedCategory?.info?.name || "N/A"}</p>
              </div>
            </div>

            {/* Category Description */}
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Category Description</p>
                <p className='font-medium'>{selectedCategory?.info?.description || "N/A"}</p>
              </div>
            </div>

            {/* Category Status */}
            <div className="flex items-center gap-3">
              <FaSignal className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Category Status</p>
                {selectedCategory?.info?.status ? (
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${selectedCategory?.info?.status === "active"
                      ? "bg-green-100 text-green-800"
                      : selectedCategory?.info?.status === "inactive"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {selectedCategory?.info?.status}
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Financial Settings
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Depreciation Rate */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <FaPercentage className="text-gray-600 w-4 h-4" />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Depreciation Rate</p>
                <p className='font-medium text-lg py-1'>
                  {`${Number(
                    selectedCategory?.depreciation?.averageRate?.$numberDecimal || 0
                  ).toFixed(2)}%`}
                </p>
                <p className='text-xs text-gray-400'>Annual depreciation rate</p>
              </div>
            </div>

            {/* Default Warranty */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <FaCalendarAlt className="text-gray-600 w-4 h-4" />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Default Warranty Period</p>
                <p className='font-medium text-lg py-1'>
                  {(() => {
                    const m = parseInt(
                      selectedCategory?.depreciation?.defaultWarrantyMonths?.$numberDecimal || "0",
                      10
                    );
                    return m === 1 ? "1 Month" : `${m} Months`;
                  })()}
                </p>
                <p className='text-xs text-gray-400'>Standard warranty for this category</p>
              </div>
            </div>
          </div>

        </div>

        {/* Category Details */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Category Details
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Category Type */}
            <div className="flex items-center gap-3">
              <FaList className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Category Type</p>
                <p className='font-medium'>{selectedCategory?.info?.name || "N/A"}</p>
              </div>
            </div>

            {/* Created Date & Time */}
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Created Date & Time</p>
                <p className='font-medium'>
                  {selectedCategory?.metadata?.createdAt
                    ? new Date(selectedCategory?.metadata?.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Category Icon / Visual Representation */}
            <div className="items-center gap-3 p-4 bg-[#F9FAFB]">
              <p className='text-sm font-medium text-gray-700 mb-2'>Category Icon</p>
              <div className="flex items-center gap-4">
                {/* Icon container */}
                <div
                  className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: selectedCategory?.info?.iconBgColor || "#e2e8f0" }}
                >
                  <Image
                    src={selectedCategory?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                    alt={selectedCategory?.info?.name || "Category Icon"}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>

                {/* Text content */}
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                    Visual Representation
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm">
                    Used in asset listings and forms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Usage Guidelines
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Depreciation Calculation */}
            <div className="flex items-center gap-3">
              <div >
                <p className='w-4 h-4 bg-blue-500 rounded-full mt-2 ' />
              </div>
              <div>
                <p className='text-sm font-medium'>
                  Depreciation Calculation
                </p>
                <p className='text-xs text-gray-600'>
                  Assets in this category will depreciate at 25.00% per year
                </p>
              </div>
            </div>

            {/* Warranty Period */}
            <div className="flex items-center gap-3">
              <div >
                <p className='w-4 h-4 bg-green-500 rounded-full mt-2 ' />
              </div>
              <div>
                <p className='text-sm font-medium'>
                  Warranty Period
                </p>
                <p className='text-xs text-gray-600'>
                  New assets will default to 3 year s warranty
                </p>
              </div>
            </div>

            {/* Asset Classification */}
            <div className="flex items-center gap-3">
              <div >
                <p className='w-4 h-4 bg-purple-500 rounded-full mt-2 ' />
              </div>
              <div>
                <p className='text-sm font-medium'>
                  Asset Classification
                </p>
                <p className='text-xs text-gray-600'>
                  Use this category for laptops and similar equipment
                </p>
              </div>
            </div>

            {/* Inactive Category */}
            <div className="flex items-center gap-3">
              <div >
                <p className='w-4 h-4 bg-red-500 rounded-full mt-2 ' />
              </div>
              <div>
                <p className='text-sm font-medium'>
                  Inactive Category
                </p>
                <p className='text-xs text-gray-600'>
                  This category is currently inactive and may not be available for new assets                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className='border border-gray-300 rounded-2xl shadow-lg p-6 w-full mt-4'>
        {/* Header */}
        <h3 className='font-semibold tracking-tight text-lg mb-4'>
          Additional Information
        </h3>

        {/* Content */}
        <div className="grid grid-cols-2 gap-4 mt-4" >
          {/* Category Settings */}
          <div>
            {/* Header */}
            <h3 className='text-sm font-medium text-gray-700 mb-2' >
              Category Settings
            </h3>

            {/* Content */}
            <div className='space-y-2 text-sm'>
              {/* Depreciation Rate */}
              <div className='flex justify-between' >
                <p className='text-gray-600' >Depreciation Rate :</p>
                <p className='font-medium' >
                  {`${Number(
                    selectedCategory?.depreciation?.averageRate?.$numberDecimal || 0
                  ).toFixed(2)}%`}
                </p>
              </div>

              {/* Warranty Period */}
              <div className='flex justify-between' >
                <p className='text-gray-600' >Warranty Period :</p>
                <p className='font-medium' >
                  {(() => {
                    const m = parseInt(
                      selectedCategory?.depreciation?.defaultWarrantyMonths?.$numberDecimal || "0",
                      10
                    );
                    return m === 1 ? "1 Month" : `${m} Months`;
                  })()}
                </p>
              </div>

              {/* Status */}
              <div className='flex justify-between' >
                <p className='text-gray-600' >Status :</p>
                <p className='font-medium' >
                  {selectedCategory?.info?.status ? (
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${selectedCategory?.info?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : selectedCategory?.info?.status === "inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {selectedCategory?.info?.status}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            {/* Header */}
            <h3 className='text-sm font-medium text-gray-700 mb-2' >
              Timeline
            </h3>

            {/* Content */}
            <div className='space-y-2 text-sm'>
              {/* Established */}
              <div className='flex justify-between' >
                <p className='text-gray-600' >Established :</p>
                <p className='font-medium' >
                  {selectedCategory?.metadata?.createdAt
                    ? new Date(selectedCategory?.metadata?.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </p>
              </div>

              {/* Updated  */}
              <div className='flex justify-between' >
                <p className='text-gray-600' >Updated :</p>
                <p className='font-medium' >
                  {selectedCategory?.metadata?.updatedAt
                    ? new Date(selectedCategory?.metadata?.updatedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </p>
              </div>

              {/* Status */}
              <div className='flex justify-between' >
                <p className='text-gray-600' >Category ID :</p>
                <p className='font-medium' >
                  # {selectedCategory?.info?.categoryId || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default View_Category_Modal;