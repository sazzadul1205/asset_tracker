// React Components
import React, { useRef, useState, useCallback } from "react";

// Next Components
import Image from "next/image";

const CompanyLogoInput = ({ companyLogo, setCompanyLogo, placeholderIcon }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (file) {
        setPreview(URL.createObjectURL(file)); // temporary preview
        setCompanyLogo(file); // pass file to parent state for submission
      }
    },
    [setCompanyLogo]
  );

  const handleClick = () => fileInputRef.current.click();

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="items-start">
      <label className="block mb-2 text-md font-semibold text-gray-700">
        Organization Logo
      </label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors 
          w-[250px] h-[250px] cursor-pointer flex items-center justify-center overflow-hidden relative group
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Image
          src={preview || companyLogo || placeholderIcon}
          alt="Company Logo"
          width={50}
          height={50}
          className="w-full h-full object-cover transition-transform duration-300 ease-out transform group-hover:scale-105"
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleChange}
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-50 text-white font-semibold transition-opacity pointer-events-none">
          Click or Drop to Upload
        </div>
      </div>

      <p className="mt-1 text-gray-600 text-sm">
        Click the image to upload / Drag and Drop
      </p>
    </div>
  );
};

export default CompanyLogoInput;
