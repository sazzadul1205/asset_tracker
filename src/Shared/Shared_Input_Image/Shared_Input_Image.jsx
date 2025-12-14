"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

/**
 * Shared_Input_Image - Reusable Image Upload Component with Drag & Drop
 *
 * Props:
 *  - file        → state holding the selected File object
 *  - setFile     → function to update the file state
 *  - previewUrl  → optional preview URL (for existing image)
 *  - setPreviewUrl → function to update preview URL
 *  - placeholderImage → optional placeholder image URL
 *  - label       → string label (default: "Upload Image")
 *  - errors      → react-hook-form errors object
 *  - name        → field name for errors
 */

const Shared_Input_Image = ({
  file,
  setFile,
  previewUrl,
  setPreviewUrl,
  placeholderImage,
  label = "Upload Image",
  errors,
  name,
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isBlob = previewUrl?.startsWith("blob:");

  return (
    <div className="w-full">
      <label
        className={`block font-semibold pb-2 ${errors?.[name] ? "text-red-500" : "text-gray-700"
          }`}
      >
        {label}
      </label>

      <div
        className={`border-2 border-dashed w-64 h-64 rounded-xl cursor-pointer transition-colors flex items-center justify-center overflow-hidden relative ${isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-400 bg-gray-50"
          }`}
        onClick={() => inputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          isBlob ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Preview"
              className="object-contain w-full h-full p-4"
            />
          ) : (
            <Image
              src={previewUrl}
              alt="Uploaded"
              fill
              sizes="256px"
              priority
              className="object-contain rounded-xl p-4"
            />

          )
        ) : placeholderImage ? (
          <Image
            src={placeholderImage}
            alt="Placeholder"
            width={96}
            height={96}
            className="object-contain opacity-50 p-4"
          />
        ) : (
          <span className="text-gray-400">Click or drag & drop</span>
        )}

        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {errors?.[name] && (
        <p className="mt-1 text-sm text-red-500 font-medium">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export default Shared_Input_Image;
