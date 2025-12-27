// src/app/admin/assets/View_Asset_Modal/View_Asset_Modal.jsx

import React from "react";

// Icons
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiUserCheck,
} from "react-icons/fi";
import {
  FaBuilding,
  FaCalendarAlt,
  FaHashtag,
  FaBriefcase,
  FaCalendarCheck,
  FaSyncAlt,
  FaUserPlus,
  FaInfo,
} from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MdQrCode2, MdCategory } from "react-icons/md";

// Components
import AssignedTo_To_Name from "../AssignedTo_To_Name/AssignedTo_To_Name";
import SerialNumber_To_Barcode from "../SerialNumber_To_Barcode/SerialNumber_To_Barcode";
import CategoryId_To_CategoryBlock from "../CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock";

// Utils
import formatCurrency from "@/Utils/formatCurrency";
import { formatStatusText, getStatusColor } from "@/Utils/formatStatus";

const View_Asset_Modal = ({ selectedAsset, setSelectedAsset }) => {

  // Check if asset is selected
  if (!selectedAsset) return null;

  // Handle Close
  const handleClose = () => {
    setSelectedAsset(null);
    document.getElementById("View_Asset_Modal")?.close();
  };

  // Format date
  const formatDate = (date) =>
    date && !isNaN(new Date(date))
      ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "N/A";

  return (
    <div
      id="View_Asset_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Category Icon */}
          <CategoryId_To_CategoryBlock
            categoryId={selectedAsset?.identification?.categoryId}
          />

          {/* Title */}
          <div>
            <h3 className="font-semibold text-gray-800 text-base">
              {selectedAsset?.identification?.name || "Asset Name"}
            </h3>
            <p className="text-gray-500 text-sm">
              Asset ID: {selectedAsset?.identification?.tag || "N/A"}
            </p>
          </div>

          {/* Barcode (kept beside title) */}
          <SerialNumber_To_Barcode
            serialNumber={selectedAsset?.details?.serialNumber}
          />
        </div>

        <button
          onClick={handleClose}
          className="hover:text-red-500 transition cursor-pointer"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-2 gap-4 mt-5">
        {/* BASIC INFO */}
        <Section title="Basic Information">
          <Row
            icon={MdQrCode2}
            label="Asset Tag"
            value={selectedAsset?.identification?.tag}
          />
          <Row
            icon={HiOutlineDocumentText}
            label="Asset Name"
            value={selectedAsset?.identification?.name}
          />
          <Row
            icon={MdCategory}
            label="Category">
            <CategoryId_To_CategoryBlock
              categoryId={selectedAsset?.identification?.categoryId}
              view="name"
            />
          </Row>
          <Row icon={AiOutlineInfoCircle} label="Status">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                selectedAsset?.details?.status
              )}`}
            >
              {formatStatusText(selectedAsset?.details?.status)}
            </span>
          </Row>
        </Section>

        {/* ASSIGNMENT */}
        <Section title="Assignment">
          <Row icon={FiUserCheck} label="Assigned To">
            <AssignedTo_To_Name
              assignedTo={selectedAsset?.assigned?.assignedTo}
              showAvatar={false}
            />
          </Row>
          <Row
            icon={FiCalendar}
            label="Assigned At"
            value={
              selectedAsset?.assigned?.assignedAt
                ? formatDate(selectedAsset.assigned.assignedAt)
                : "Yet to be assigned"
            }
          />
        </Section>

        {/* FINANCIAL */}
        <Section title="Financial Details">
          <Row
            icon={FiDollarSign}
            label="Purchase Cost"
            value={formatCurrency(
              selectedAsset?.purchase?.cost?.$numberDecimal ||
              selectedAsset?.purchase?.cost
            )}
          />
          <Row
            icon={FiCalendar}
            label="Purchased At"
            value={formatDate(selectedAsset?.purchase?.purchasedAt)}
          />
          <Row
            icon={FiClock}
            label="Warranty Expiry"
            value={formatDate(selectedAsset?.purchase?.warrantyExpiry)}
          />
        </Section>

        {/* DETAILS */}
        <Section title="Additional Details">
          <Row
            icon={FaHashtag}
            label="Serial Number"
            value={selectedAsset?.details?.serialNumber}
          />
          <Row
            icon={FaBriefcase}
            label="Model"
            value={selectedAsset?.details?.model}
          />
          <Row
            icon={FaBuilding}
            label="Brand"
            value={selectedAsset?.details?.brand}
          />
          <Row
            icon={AiOutlineInfoCircle}
            label="Notes"
            value={selectedAsset?.details?.notes}
          />
        </Section>

        {/* ADMIN */}
        <Section title="Administrative Details" colSpan={2} >
          <div className="grid grid-cols-2" >
            <div className="space-y-4" >
              <Row
                icon={FaUserPlus}
                label="Supplier"
                value={selectedAsset?.purchase?.supplier}
              />
              <Row
                icon={FiMapPin}
                label="Location"
                value={selectedAsset?.purchase?.location}
              />
              <Row
                icon={FaCalendarCheck}
                label="Condition"
                value={selectedAsset?.details?.condition}
              />

            </div>
            <div className="space-y-4" >
              <Row
                icon={FaCalendarAlt}
                label="Created At"
                value={formatDate(selectedAsset?.metadata?.createdAt)}
              />
              <Row
                icon={FaSyncAlt}
                label="Updated At"
                value={formatDate(selectedAsset?.metadata?.updatedAt)}
              />
              <Row
                icon={FaInfo}
                label="Description"
                value={selectedAsset?.details?.description}
              />

            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */
const Section = ({ title, children, colSpan = 1 }) => (
  <div
    className={`border border-gray-300 rounded-2xl shadow-lg p-6 ${colSpan === 2 ? "col-span-2" : ""
      }`}
  >
    <h3 className="font-semibold text-lg mb-4">{title}</h3>
    <div className="space-y-5">{children}</div>
  </div>
);

const Row = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-center gap-3">
    <Icon className="text-gray-500 w-5 h-5" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{children || value || "N/A"}</p>
    </div>
  </div>
);

export default View_Asset_Modal;
