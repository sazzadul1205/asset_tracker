// src/app/admin/assetsCategories/View_Category_Modal/View_Category_Modal.jsx

// React Components
import React from 'react';

// Next Components
import Image from 'next/image';

// Icons
import { FiX } from 'react-icons/fi';
import {
  FaIdBadge,
  FaTag,
  FaInfoCircle,
  FaSignal,
  FaCalendarAlt,
  FaPercentage,
  FaList,
  FaTools,
  FaChartLine,
  FaClock
} from "react-icons/fa";

const View_Category_Modal = ({
  selectedCategory,
  setSelectedCategory,
}) => {

  // Handle Close
  const handleClose = () => {
    setSelectedCategory(null);
    document.getElementById("View_Category_Modal")?.close();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!selectedCategory) {
    return null;
  }

  // Format date function
  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).replace(",", "").toUpperCase();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-yellow-100 text-yellow-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  // Calculate warranty text
  const getWarrantyText = () => {
    const m = parseInt(
      selectedCategory?.depreciation?.defaultWarrantyMonths?.$numberDecimal || "0",
      10
    );
    if (m === 0) return "No warranty";
    return m === 1 ? "1 Month" : `${m} Months`;
  };

  return (
    <div
      id='View_Category_Modal'
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full">
          {/* Icon container */}
          <div
            className="shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: selectedCategory?.info?.iconBgColor || "#e2e8f0" }}
          >
            <Image
              src={selectedCategory?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
              alt={selectedCategory?.info?.name || "Category Icon"}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-lg md:text-xl truncate">
              {selectedCategory?.info?.name || "Category Name"}
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              Category ID: {selectedCategory?.info?.categoryId || "N/A"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300 cursor-pointer"
          aria-label="Close modal"
        >
          <FiX className="text-xl text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Basic Information */}
        <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6'>
          {/* Header */}
          <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
            <span className="bg-blue-100 text-blue-600 w-2 h-5 rounded-full"></span>
            Basic Information
          </h3>

          {/* Content */}
          <div className="space-y-4">
            {/* Category Id */}
            <div className="flex items-start gap-3">
              <FaIdBadge className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Category ID</p>
                <p className='font-medium text-gray-800 truncate'>{selectedCategory?.info?.categoryId || "N/A"}</p>
              </div>
            </div>

            {/* Category Name */}
            <div className="flex items-start gap-3">
              <FaTag className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Category Name</p>
                <p className='font-medium text-gray-800'>{selectedCategory?.info?.name || "N/A"}</p>
              </div>
            </div>

            {/* Category Description */}
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Description</p>
                <p className='font-medium text-gray-800'>{selectedCategory?.info?.description || "No description provided"}</p>
              </div>
            </div>

            {/* Category Status */}
            <div className="flex items-start gap-3">
              <FaSignal className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getStatusColor(selectedCategory?.info?.status)}`}
                >
                  {selectedCategory?.info?.status?.toUpperCase() || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6'>
          {/* Header */}
          <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
            <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
            Financial Settings
          </h3>

          {/* Content */}
          <div className="space-y-6">
            {/* Depreciation Rate */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-green-50 rounded-full">
                <FaPercentage className="text-green-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Depreciation Rate</p>
                <p className='font-medium text-gray-800 text-xl md:text-2xl py-1'>
                  {`${Number(
                    selectedCategory?.depreciation?.averageRate?.$numberDecimal || 0
                  ).toFixed(2)}%`}
                </p>
                <p className='text-xs text-gray-400'>Annual depreciation rate</p>
              </div>
            </div>

            {/* Default Warranty */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                <FaCalendarAlt className="text-blue-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Default Warranty</p>
                <p className='font-medium text-gray-800 text-xl md:text-2xl py-1'>
                  {getWarrantyText()}
                </p>
                <p className='text-xs text-gray-400'>Standard warranty period</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6'>
          {/* Header */}
          <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
            <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
            Category Details
          </h3>

          {/* Content */}
          <div className="space-y-4">
            {/* Category Type */}
            <div className="flex items-start gap-3">
              <FaList className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Category Type</p>
                <p className='font-medium text-gray-800'>{selectedCategory?.info?.name || "N/A"}</p>
              </div>
            </div>

            {/* Created Date & Time */}
            <div className="flex items-start gap-3">
              <FaClock className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Created Date & Time</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {formatDateTime(selectedCategory?.metadata?.createdAt)}
                </p>
              </div>
            </div>

            {/* Category Icon */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className='text-sm font-medium text-gray-700 mb-3'>Category Icon</p>
              <div className="flex items-center gap-4">
                {/* Icon container */}
                <div
                  className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: selectedCategory?.info?.iconBgColor || "#e2e8f0" }}
                >
                  <Image
                    src={selectedCategory?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
                    alt={selectedCategory?.info?.name || "Category Icon"}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Visual Representation
                  </h3>
                  <p className="text-gray-500 text-xs">
                    Used in asset listings and forms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6'>
          {/* Header */}
          <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
            <span className="bg-amber-100 text-amber-600 w-2 h-5 rounded-full"></span>
            Usage Guidelines
          </h3>

          {/* Content */}
          <div className="space-y-4">
            {/* Depreciation Calculation */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm font-medium text-gray-800'>
                  Depreciation Calculation
                </p>
                <p className='text-xs text-gray-600 mt-1'>
                  Assets in this category will depreciate at {Number(
                    selectedCategory?.depreciation?.averageRate?.$numberDecimal || 0
                  ).toFixed(2)}% per year
                </p>
              </div>
            </div>

            {/* Warranty Period */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm font-medium text-gray-800'>
                  Warranty Period
                </p>
                <p className='text-xs text-gray-600 mt-1'>
                  New assets will default to {getWarrantyText().toLowerCase()} warranty
                </p>
              </div>
            </div>

            {/* Asset Classification */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm font-medium text-gray-800'>
                  Asset Classification
                </p>
                <p className='text-xs text-gray-600 mt-1'>
                  Use this category for {selectedCategory?.info?.name?.toLowerCase() || "similar"} equipment
                </p>
              </div>
            </div>

            {/* Status Guidance */}
            {selectedCategory?.info?.status === "inactive" && (
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className='text-sm font-medium text-gray-800'>
                    Inactive Category
                  </p>
                  <p className='text-xs text-gray-600 mt-1'>
                    This category is currently inactive and may not be available for new assets
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information - Full Width */}
      <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 w-full mt-4 md:mt-6'>
        {/* Header */}
        <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
          <span className="bg-indigo-100 text-indigo-600 w-2 h-5 rounded-full"></span>
          Additional Information
        </h3>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4">
          {/* Category Settings */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
              <FaTools className="text-gray-400 w-4 h-4" />
              Category Settings
            </h3>

            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Depreciation Rate</p>
                <p className='font-medium text-gray-800'>
                  {`${Number(
                    selectedCategory?.depreciation?.averageRate?.$numberDecimal || 0
                  ).toFixed(2)}%`}
                </p>
              </div>

              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Warranty Period</p>
                <p className='font-medium text-gray-800'>
                  {getWarrantyText()}
                </p>
              </div>

              <div className='flex justify-between items-center py-2'>
                <p className='text-sm text-gray-600'>Status</p>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCategory?.info?.status)}`}
                >
                  {selectedCategory?.info?.status?.toUpperCase() || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
              <FaChartLine className="text-gray-400 w-4 h-4" />
              Timeline
            </h3>

            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Established</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {formatDateTime(selectedCategory?.metadata?.createdAt)}
                </p>
              </div>

              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Last Updated</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {formatDateTime(selectedCategory?.metadata?.updatedAt)}
                </p>
              </div>

              <div className='flex justify-between items-center py-2'>
                <p className='text-sm text-gray-600'>Category ID</p>
                <p className='font-medium text-gray-800 text-sm font-mono'>
                  {selectedCategory?.info?.categoryId || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Mobile */}
      <div className="md:hidden mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>

  );
};

export default View_Category_Modal;