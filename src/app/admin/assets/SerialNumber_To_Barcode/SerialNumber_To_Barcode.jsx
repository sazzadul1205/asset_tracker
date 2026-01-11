// src/app/admin/assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode.jsx

import React from "react";
import Barcode from "react-barcode";

const SerialNumber_To_Barcode = ({ serialNumber, size = "md" }) => {
  if (!serialNumber) return null;

  // Size configurations for different use cases
  const sizeConfigs = {
    xs: {
      height: 20,
      width: 1,
      fontSize: 8,
      containerClass: "w-16 h-8",
      showText: false,
    },
    sm: {
      height: 30,
      width: 1.2,
      fontSize: 10,
      containerClass: "w-24 h-12",
      showText: false,
    },
    md: {
      height: 40,
      width: 1.4,
      fontSize: 12,
      containerClass: "w-32 h-16 md:w-36 md:h-18",
      showText: true,
    },
    lg: {
      height: 50,
      width: 1.6,
      fontSize: 14,
      containerClass: "w-40 h-20 md:w-48 md:h-24",
      showText: true,
    },
    xl: {
      height: 60,
      width: 1.8,
      fontSize: 16,
      containerClass: "w-48 h-24 md:w-56 md:h-28",
      showText: true,
    },
  };

  const config = sizeConfigs[size] || sizeConfigs.md;

  // Truncate long serial numbers for display
  const displayText = serialNumber.length > 20
    ? `${serialNumber.substring(0, 15)}...`
    : serialNumber;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${config.containerClass}`}>
      {/* Barcode Container */}
      <div className="relative bg-white p-2 rounded border border-gray-200 shadow-sm">
        <Barcode
          value={serialNumber}
          format="CODE128"
          height={config.height}
          width={config.width}
          displayValue={false}
          background="transparent"
          lineColor="#1f2937" // gray-800
          margin={4}
          className="max-w-full h-auto"
        />
      </div>

      {/* Serial Number Text (optional based on size) */}
      {config.showText && (
        <div className="mt-1 text-center">
          <p
            className="text-gray-600 font-mono truncate max-w-full"
            style={{ fontSize: `${config.fontSize}px` }}
            title={serialNumber}
          >
            {displayText}
          </p>
        </div>
      )}

      {/* Hover Tooltip for full serial number */}
      <div className="relative group">
        <div className="absolute hidden group-hover:block -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {serialNumber}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Mobile Tap to View (touch devices) */}
      <div className="md:hidden">
        <div className="relative">
          <div className="absolute hidden peer-active:block -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {serialNumber}
              <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SerialNumber_To_Barcode;