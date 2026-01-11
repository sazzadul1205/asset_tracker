import React from "react";

// Icons
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiUserCheck,
  FiX,
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

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
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
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full">
          {/* Category Icon */}
          <div className="shrink-0">
            <CategoryId_To_CategoryBlock
              categoryId={selectedAsset?.identification?.categoryId}
              size="lg"
            />
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-lg md:text-xl truncate">
              {selectedAsset?.identification?.name || "Asset Name"}
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              Asset ID: {selectedAsset?.identification?.tag || "N/A"}
            </p>
          </div>

          {/* Barcode - Desktop */}
          <div className="hidden md:block shrink-0">
            <SerialNumber_To_Barcode
              serialNumber={selectedAsset?.details?.serialNumber}
            />
          </div>
        </div>

        {/* Close Button and Barcode - Mobile */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Barcode - Mobile */}
          <div className="md:hidden">
            <SerialNumber_To_Barcode
              serialNumber={selectedAsset?.details?.serialNumber}
              size="sm"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="text-xl text-gray-600" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
              className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${getStatusColor(
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
              showAvatar={true}
              avatarSize="sm"
            />
          </Row>
          <Row
            icon={FiCalendar}
            label="Assigned At"
            value={
              selectedAsset?.assigned?.assignedAt
                ? formatDate(selectedAsset.assigned.assignedAt)
                : "Not assigned"
            }
          />
          {selectedAsset?.assigned?.assignedTo && (
            <Row
              icon={FiMapPin}
              label="Assigned By"
              value={selectedAsset?.assigned?.assignedBy || "N/A"}
            />
          )}
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
            icon={FaCalendarAlt}
            label="Purchased At"
            value={formatDate(selectedAsset?.purchase?.purchasedAt)}
          />
          <Row
            icon={FiClock}
            label="Warranty Expiry"
            value={formatDate(selectedAsset?.purchase?.warrantyExpiry)}
          />
          <Row
            icon={FaUserPlus}
            label="Supplier"
            value={selectedAsset?.purchase?.supplier}
          />
        </Section>

        {/* DETAILS */}
        <Section title="Asset Details">
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
            icon={FaCalendarCheck}
            label="Condition"
            value={selectedAsset?.details?.condition}
          />
        </Section>

        {/* LOCATION & DATES */}
        <Section title="Location & Metadata">
          <Row
            icon={FiMapPin}
            label="Location"
            value={selectedAsset?.purchase?.location}
          />
          <Row
            icon={FaInfo}
            label="Description"
            value={selectedAsset?.details?.description}
            multiline={true}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="space-y-4">
              <Row
                icon={FaCalendarAlt}
                label="Created"
                value={formatDate(selectedAsset?.metadata?.createdAt)}
                small={true}
              />
            </div>
            <div className="space-y-4">
              <Row
                icon={FaSyncAlt}
                label="Updated"
                value={formatDate(selectedAsset?.metadata?.updatedAt)}
                small={true}
              />
            </div>
          </div>
        </Section>

        {/* NOTES & ADDITIONAL INFO */}
        {(selectedAsset?.details?.notes || selectedAsset?.details?.specifications) && (
          <Section title="Additional Information" colSpan="full">
            <div className="space-y-4">
              {selectedAsset?.details?.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AiOutlineInfoCircle className="text-gray-500 w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-700">Notes</span>
                  </div>
                  <p className="text-gray-600 text-sm pl-7">
                    {selectedAsset.details.notes}
                  </p>
                </div>
              )}
              {selectedAsset?.details?.specifications && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <FaBriefcase className="text-gray-500 w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-700">Specifications</span>
                  </div>
                  <pre className="text-gray-600 text-sm pl-7 whitespace-pre-wrap font-sans">
                    {JSON.stringify(selectedAsset.details.specifications, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* ACTION BUTTONS - Mobile */}
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

/* ---------- Helpers ---------- */
const Section = ({ title, children, colSpan = 1 }) => (
  <div
    className={`border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 ${colSpan === "full"
      ? "md:col-span-2"
      : colSpan === 2
        ? "md:col-span-2"
        : ""
      }`}
  >
    <h3 className="font-semibold text-gray-800 text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
      <span className="bg-blue-100 text-blue-600 w-2 h-5 rounded-full"></span>
      {title}
    </h3>
    <div className="space-y-3 md:space-y-4">{children}</div>
  </div>
);

const Row = ({ icon: Icon, label, value, children, multiline = false, small = false }) => (
  <div className={`flex items-start gap-3 ${multiline ? 'items-start' : 'items-center'}`}>
    <Icon className={`text-gray-400 shrink-0 ${small ? 'w-4 h-4' : 'w-5 h-5'}`} />
    <div className="flex-1 min-w-0">
      <p className={`text-gray-500 ${small ? 'text-xs' : 'text-sm'}`}>{label}</p>
      <div className={`font-medium text-gray-800 ${small ? 'text-sm' : 'text-base'} ${multiline ? 'mt-1 whitespace-pre-wrap' : 'truncate'}`}>
        {children || value || <span className="text-gray-400 italic">Not specified</span>}
      </div>
    </div>
  </div>
);

export default View_Asset_Modal;