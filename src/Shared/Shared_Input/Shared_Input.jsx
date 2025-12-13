"use client";

import React, { useRef, useEffect } from "react";

/**
 * Shared_Input - Reusable React Hook Form Input Component
 *
 * Props:
 *  - label       → string (optional)
 *  - type        → string ("text" | "password" | "email" | "textarea" | "select" | "searchable")
 *  - placeholder → string
 *  - register    → react-hook-form register function
 *  - name        → field name (required for RHF)
 *  - errors      → react-hook-form formState.errors
 *  - className   → optional extra styling
 *  - autoComplete → string (optional)
 *  - options     → array of { label, value } for select/searchable inputs
 *  - rule        → function or boolean, condition to render input
 *  - rules       → react-hook-form validation rules
 */

const Shared_Input = ({
  label,
  type = "text",
  placeholder = "",
  register,
  name,
  errors,
  className = "",
  autoComplete,
  options = [],
  rule = true,
  rules = {},
}) => {
  const id = `input-${name}`;
  const textareaRef = useRef(null);

  // Always call hooks first
  useEffect(() => {
    if (type === "textarea" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [type, placeholder, register, name]);

  // Rule check
  if (typeof rule === "function" && !rule()) return null;
  if (rule === false) return null;

  const isRequired = rules?.required ? true : false;
  const isDisabledOrReadOnly = rules?.disabled || rules?.readOnly || false;

  // Base Tailwind classes for all input types
  const baseClasses = `w-full px-4 py-2 border rounded-md text-gray-800 placeholder-gray-400 transition-all outline-none
    ${errors?.[name] ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"}
    ${isDisabledOrReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" : "bg-white"}
  `;

  // Render label
  const renderLabel = () =>
    label && (
      <label
        htmlFor={id}
        className={`block font-semibold pb-2 ${errors?.[name] ? "text-red-500" : "text-gray-700"}`}
      >
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
    );

  // Textarea
  if (type === "textarea") {
    return (
      <div className={`form-control w-full ${className}`}>
        {renderLabel()}
        <textarea
          ref={textareaRef}
          id={id}
          placeholder={placeholder}
          {...register(name, rules)}
          className={`${baseClasses} resize-none`}
          rows={3}
        />
        {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
      </div>
    );
  }

  // Select input
  if (type === "select" || type === "searchable") {
    return (
      <div className={`form-control w-full ${className}`}>
        {renderLabel()}
        <select
          id={id}
          {...register(name, rules)}
          className={baseClasses + " cursor-pointer"}
        >
          <option value="" disabled>
            {placeholder || "Select an option"}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
      </div>
    );
  }

  // Default input types: text, email, password, number
  return (
    <div className={`form-control w-full ${className}`}>
      {renderLabel()}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete || (type === "password" ? "current-password" : type === "email" ? "email" : "off")}
        {...register(name, rules)}
        className={baseClasses}
      />
      {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
    </div>
  );
};

export default Shared_Input;
