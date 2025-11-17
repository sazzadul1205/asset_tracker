// React Components
import React from 'react';

// Icons
import { ImCross } from 'react-icons/im';
import {
  FaBuilding,
  FaCalendarAlt,
  FaHashtag,
  FaUserShield,
  FaBriefcase,
  FaCalendarCheck,
  FaSyncAlt,
  FaUserPlus,
} from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MdQrCode2, MdCategory } from "react-icons/md";
import { FiCalendar, FiClock, FiDollarSign, FiMapPin, FiUser, FiUserCheck } from 'react-icons/fi';

// Shared
import BarcodeGenerator from '@/app/Admin/Assets/Barcode/Barcode';
import CategoryToIcon from '@/app/Admin/Assets/CategoryToIcon/CategoryToIcon';
import LocationToDepartment from '@/app/Admin/Assets/LocationToDepartment/LocationToDepartment';

const ViewAssetModal = ({
  selectedAsset,
  setSelectedAsset,
}) => {


  // Handle Close
  const handleClose = () => {
    setSelectedAsset(null);
    document.getElementById("View_Asset_Modal")?.close();
  };

  return (
    <div
      id="View_Asset_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Left Content */}
        <div className="flex items-center gap-4">
          {/* Icon container */}
          <CategoryToIcon
            category={selectedAsset?.asset_category}
            enableTooltip={false}
          />

          {/* Text content */}
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {selectedAsset?.asset_name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {selectedAsset?.asset_tag}
            </p>
          </div>

          {/* Barcode */}
          <BarcodeGenerator
            padding={0}
            barWidth={1}
            barHeight={30}
            numberText='xs'
            numberBellow={0}
            number={selectedAsset?.asset_id}
          />
        </div>


        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300"
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

            {/* Asset Tag */}
            <div className="flex items-center gap-3">
              <MdQrCode2 className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Asset Tag</p>
                <p className="font-medium">{selectedAsset?.asset_tag || "N/A"}</p>
              </div>
            </div>

            {/* Asset Name */}
            <div className="flex items-center gap-3">
              <HiOutlineDocumentText className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Asset Name</p>
                <p className="font-medium">{selectedAsset?.asset_name || "N/A"}</p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center gap-3">
              <MdCategory className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <CategoryToIcon
                  category={selectedAsset?.asset_category}
                  showOnlyName={true}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <AiOutlineInfoCircle className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex justify-center">
                  <StatusBadge status={selectedAsset?.status} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Assignment */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Assignment
          </h3>

          {/* Content */}
          <div className="space-y-5">

            {/* Created By */}
            <div className="flex items-center gap-3">
              <FiUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">{selectedAsset?.created_by || "N/A"}</p>
              </div>
            </div>

            {/* Assigned To */}
            <div className="flex items-center gap-3">
              <FiUserCheck className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-medium">{selectedAsset?.assigned_to || "N/A"}</p>
              </div>
            </div>

            {/* Assigned To Location */}
            <div className="flex items-center gap-3">
              <FiMapPin className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Assigned To Location</p>
                <LocationToDepartment location={selectedAsset?.location} />
              </div>
            </div>

          </div>
        </div>

        {/* Financial Details */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Financial Details
          </h3>

          {/* Content */}
          <div className="space-y-5">

            {/* Purchase Cost */}
            <div className="flex items-center gap-3">
              <FiDollarSign className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Purchase Cost</p>
                <p className="font-medium">
                  {selectedAsset?.purchase_cost
                    ? `${Number(selectedAsset.purchase_cost).toFixed(2)} BDT`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Purchase Date */}
            <div className="flex items-center gap-3">
              <FiCalendar className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Purchase Date</p>
                <p className="font-medium">
                  {selectedAsset?.purchase_date
                    ? new Date(selectedAsset.purchase_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Warranty Expiry */}
            <div className="flex items-center gap-3">
              <FiClock className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Warranty Expiry</p>
                <p className="font-medium">
                  {selectedAsset?.warranty_expiry
                    ? new Date(selectedAsset.warranty_expiry).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Additional Details
          </h3>

          {/* Content */}
          <div className="space-y-5">

            {/* Serial Number */}
            <div className="flex items-center gap-3">
              <FaHashtag className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium">
                  {selectedAsset?.serial_number || "N/A"}
                </p>
              </div>
            </div>

            {/* Model */}
            <div className="flex items-center gap-3">
              <FaBriefcase className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="font-medium">
                  {selectedAsset?.asset_model || "N/A"}
                </p>
              </div>
            </div>

            {/* Brand */}
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">
                  {selectedAsset?.asset_brand || "N/A"}
                </p>
              </div>
            </div>

            {/* Asset Notes */}
            <div className="flex items-center gap-3">
              <AiOutlineInfoCircle className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Asset Notes</p>
                <p className="font-medium">
                  {selectedAsset?.asset_notes || "N/A"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Administrative Details */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Administrative Details
          </h3>

          <div className="space-y-5">
            {/* Supplier */}
            <div className="flex items-center gap-3">
              <FaUserPlus className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{selectedAsset?.supplier || "N/A"}</p>
              </div>
            </div>

            {/* Condition Rating */}
            <div className="flex items-center gap-3">
              <FaCalendarCheck className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Condition Rating</p>
                <p className="font-medium capitalize">{selectedAsset?.condition_rating || "N/A"}</p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {selectedAsset?.created_at
                    ? new Date(selectedAsset.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-center gap-3">
              <FaSyncAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-medium">
                  {selectedAsset?.updated_at
                    ? new Date(selectedAsset.updated_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Administrative Details - 6th Field */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Administrative Details - Additional
          </h3>

          <div className="space-y-5">
            {/* Updated By */}
            <div className="flex items-center gap-3">
              <FaUserShield className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Updated By</p>
                <p className="font-medium">{selectedAsset?.updated_by || "N/A"}</p>
              </div>
            </div>


            {/* Asset Description */}
            <div className="flex items-center gap-3">
              <HiOutlineDocumentText className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Asset Description</p>
                <p className="font-medium">{selectedAsset?.asset_description || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAssetModal;


// Status Badge
const StatusBadge = ({ status }) => {
  // Map status to Tailwind color classes
  const statusColors = {
    active: "bg-green-100 text-green-800",
    assigned: "bg-blue-100 text-blue-800",
    in_stock: "bg-gray-100 text-gray-800",
    in_repair: "bg-yellow-100 text-yellow-800",
    damaged: "bg-red-100 text-red-800",
    lost: "bg-red-200 text-red-900",
    retired: "bg-purple-100 text-purple-800",
    default: "bg-gray-100 text-gray-800",
  };

  const colorClass = statusColors[status] || statusColors.default;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass} uppercase text-center inline-block w-24`}
    >
      {status?.replace("_", " ") || "Unassigned"}
    </span>
  );
};
