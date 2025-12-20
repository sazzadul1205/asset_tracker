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
  size = "md", // "sm" | "md"

  // Extra container classes for layout control
  containerClass = "",
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
    sm: "w-20 h-20",
    md: "w-64 h-64",
  };

  /**
   * Handles a newly selected file
   * - Updates file state (if provided)
   * - Generates a blob preview URL
   */
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Optional chaining keeps this backward-compatible
    setFile?.(selectedFile);
    setPreviewUrl?.(URL.createObjectURL(selectedFile));
  };

  // File input change handler
  const handleFileChange = (e) => handleFile(e.target.files[0]);

  // Drag handlers (purely for UX)
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

  /**
   * Cleanup blob URLs on unmount or preview change
   * Prevents memory leaks
   */
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Detect blob URL vs normal URL
  const isBlob = previewUrl?.startsWith("blob:");

  return (
    <div className={`w-full ${containerClass}`}>
      {/* Optional label */}
      {!hideLabel && (
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
          transition-colors flex items-center justify-center
          overflow-hidden relative
          ${SIZE_MAP[size]}
          ${isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-400 bg-gray-50"
          }
        `}
        onClick={() => inputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Image preview */}
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            sizes="128px"
            className="object-contain p-2"
          />
        ) : placeholderImage ? (
          <Image
            src={placeholderImage}
            alt="Placeholder"
            width={48}
            height={48}
            className="object-contain opacity-60"
          />
        ) : (
          <span className="text-gray-400 text-xs text-center">
            Click or drop
          </span>
        )}

        {/* Hidden native file input */}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

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
