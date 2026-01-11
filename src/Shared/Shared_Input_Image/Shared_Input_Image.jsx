"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

/**
 * Shared_Input_Image
 *
 * Reusable image upload component with:
 * - Click to upload
 * - Drag & drop support
 * - Preview (supports blob URLs + existing URLs)
 * - Optional label
 * - Size variants (sm / md)
 *
 * This component is intentionally UI-focused and form-library agnostic.
 */
const Shared_Input_Image = ({
  // File state (optional but recommended)
  file,
  setFile,

  // Preview URL state (can be blob or remote URL)
  previewUrl,
  setPreviewUrl,

  // Optional placeholder image (shown before upload)
  placeholderImage,

  // Label text
  label = "Upload Image",

  // Error handling (react-hook-form compatible)
  errors,
  name,

  /* ---------- Optional / backward-safe props ---------- */

  // Hide label entirely (useful inside compact UIs)
  hideLabel = false,

  // Size preset for the drop area
  size = "md", // "sm" | "md" | "lg"

  // Extra container classes for layout control
  containerClass = "",

  // Accept prop for file input
  accept = "image/*",
}) => {
  // Reference to hidden file input
  const inputRef = useRef(null);

  // Track drag state for visual feedback
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Maps size prop to Tailwind dimensions
   * Keeps layout consistent and predictable
   */
  const SIZE_MAP = {
    xs: "w-16 h-16",
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-64 h-64",
  };

  // State for local preview URL
  const [localPreviewUrl, setLocalPreviewUrl] = useState(previewUrl || placeholderImage);

  /**
   * Handles a newly selected file
   * - Updates file state (if provided)
   * - Generates a blob preview URL
   */
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Create blob URL for preview
    const blobUrl = URL.createObjectURL(selectedFile);

    // Update preview URL state
    setLocalPreviewUrl(blobUrl);
    setPreviewUrl?.(blobUrl);

    // Update file state (if provided)
    setFile?.(selectedFile);
  };

  // File input change handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  // Drag handlers (purely for UX)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFile(droppedFile);
    }
  };

  /**
   * Cleanup blob URLs on unmount or preview change
   * Prevents memory leaks
   */
  useEffect(() => {
    // Update local preview when prop changes
    if (previewUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPreviewUrl(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      // Cleanup blob URLs
      if (localPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  // Get size class
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`w-full ${containerClass}`}>
      {/* Optional label */}
      {!hideLabel && label && (
        <label
          className={`block font-semibold pb-2 ${errors?.[name] ? "text-red-500" : "text-gray-700"
            }`}
        >
          {label}
        </label>
      )}

      {/* Upload / Drop zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200 flex items-center justify-center
          overflow-hidden relative group
          ${sizeClass}
          ${isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-400 bg-gray-50"
          }
        `}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Image preview */}
        {localPreviewUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={localPreviewUrl}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-2"
              unoptimized={localPreviewUrl?.startsWith("blob:")}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full transition-opacity duration-200">
                Change
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4">
            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-500 text-xs text-center">
              Click or drop image
            </span>
          </div>
        )}

        {/* Hidden native file input */}
        <input
          type="file"
          accept={accept}
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File info */}
      {file && (
        <div className="mt-2 text-xs text-gray-600">
          <p className="truncate">
            <span className="font-medium">Selected:</span> {file.name}
          </p>
          <p>
            <span className="font-medium">Size:</span> {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}

      {/* Validation error message */}
      {errors?.[name] && (
        <p className="mt-1 text-sm text-red-500 font-medium">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export default Shared_Input_Image;