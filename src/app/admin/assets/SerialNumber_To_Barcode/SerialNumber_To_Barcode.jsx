// src/app/admin/assets/SerialNumber_To_Barcode/SerialNumber_To_Barcode.jsx

import React from "react";
import Barcode from "react-barcode";

const SerialNumber_To_Barcode = ({ serialNumber }) => {
  if (!serialNumber) return null;

  return (
    <div className="inline-block">
      <Barcode
        value={serialNumber}
        format="CODE128"
        height={40}
        width={1.4}
        displayValue={false}
        background="transparent"
      />
    </div>
  );
};

export default SerialNumber_To_Barcode;
