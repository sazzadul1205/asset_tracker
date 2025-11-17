// React Components
import React from 'react';

// Next Components
import Image from 'next/image';

// Icons
import { ImCross } from 'react-icons/im';
import {
  FaIdBadge,
  FaBuilding,
  FaCalendarAlt,
  FaHashtag,
  FaPhoneAlt,
  FaUser,
  FaUserShield,
  FaBriefcase,
  FaUserCheck,
  FaCalendarCheck,
  FaSyncAlt,
  FaUserPlus,
} from "react-icons/fa";
import { MdEmail } from 'react-icons/md';

// Shared
import UserDepartmentView from '@/Shared/TableExtension/UserDepartmentView';
import BarcodeGenerator from '@/app/Admin/Assets/Barcode/Barcode';
import CategoryToIcon from '@/app/Admin/Assets/CategoryToIcon/CategoryToIcon';

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


    </div>
  );
};

export default ViewAssetModal;