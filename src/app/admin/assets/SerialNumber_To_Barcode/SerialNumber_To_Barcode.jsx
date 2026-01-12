import React from "react";
import Barcode from "react-barcode";

const SerialNumber_To_Barcode = ({
  serialNumber,
  size = "md",
  showText = undefined  // Optional prop to control text display
}) => {
  if (!serialNumber) return null;

  // Size configurations for different use cases
  const sizeConfigs = {
    xs: {
      height: 20,
      width: 1,
      fontSize: 8,
      containerClass: "w-16 h-8",
      showTextDefault: false,
    },
    sm: {
      height: 30,
      width: 1.2,
      fontSize: 10,
      containerClass: "w-24 h-12",
      showTextDefault: false,
    },
    md: {
      height: 40,
      width: 1.4,
      fontSize: 12,
      containerClass: "w-32 h-16 md:w-36 md:h-18",
      showTextDefault: true,
    },
    lg: {
      height: 50,
      width: 1.6,
      fontSize: 14,
      containerClass: "w-40 h-20 md:w-48 md:h-24",
      showTextDefault: true,
    },
    xl: {
      height: 60,
      width: 1.8,
      fontSize: 16,
      containerClass: "w-48 h-24 md:w-56 md:h-28",
      showTextDefault: true,
    },
  };

  const config = sizeConfigs[size] || sizeConfigs.md;

  // Use prop value if provided, otherwise use size default
  const shouldShowText = showText !== undefined ? showText : config.showTextDefault;

  // Truncate long serial numbers for display
  const displayText = serialNumber.length > 20
    ? `${serialNumber.substring(0, 15)}...`
    : serialNumber;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${config.containerClass}`}>
      {/* Barcode Container with Tooltip */}
      <div className="relative group">
        {/* Barcode */}
        <div className="bg-white p-2 rounded border border-gray-200 shadow-sm">
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

        {/* Tooltip for full serial number - Desktop hover / Mobile tap */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {serialNumber}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Serial Number Text (controlled by showText prop or size default) */}
      {shouldShowText && (
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
    </div>
  );
};

export default SerialNumber_To_Barcode;