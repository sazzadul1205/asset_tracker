"use client";

// React Components
import React, { useRef, useEffect, useState } from "react";

// Icons
import { FiSearch } from "react-icons/fi";

// React Hook Form
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Shared_Input - Reusable React Hook Form Input Component
 *
 * @param {string}   label        - Input label text (optional)
 * @param {string}   type         - "text" | "password" | "email" | "textarea" | "select" | "searchable"
 * @param {string}   placeholder  - Placeholder text
 * @param {Function} register     - react-hook-form register function (required)
 * @param {string}   name         - Field name used by react-hook-form (required)
 * @param {Object}   errors       - react-hook-form formState.errors object
 * @param {string}   className    - Additional wrapper CSS classes
 * @param {string}   autoComplete - Browser autocomplete value
 * @param {Array}    options      - [{ label, value }] for select/searchable inputs
 * @param {boolean|Function} rule - Conditional render control
 * @param {Object}   rules        - react-hook-form validation rules
 *
 * @param {string|number} defaultValue - Initial value for edit forms
 * @param {boolean}       disabled     - Disables the input
 * @param {boolean}       readOnly      - Makes the input read-only
 *
 * @returns {JSX.Element|null}
 */

const Shared_Input = ({
  name,
  label,
  errors,
  onChange,
  register,
  value = "",
  rules = {},
  rule = true,
  autoComplete,
  options = [],
  idPrefix = "",
  type = "text",
  className = "",
  placeholder = "",
  readOnly = false,
  disabled = false,
  defaultValue = "",
}) => {
  const id = idPrefix
    ? `${idPrefix}-${name}`
    : `input-${name}`;

  // Ref
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (type === "textarea" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [type, defaultValue]);


  // Rule check
  if (typeof rule === "function" && !rule()) return null;
  if (rule === false) return null;

  const isRequired = !!rules?.required;
  const isDisabledOrReadOnly = disabled || readOnly;

  // Base Tailwind styles
  const baseClasses = `w-full px-4 py-2 border rounded-md text-gray-800 placeholder-gray-400 transition-all outline-none
    ${errors?.[name]
      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
    }
    ${isDisabledOrReadOnly
      ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
      : "bg-white"
    }
  `;

  // Render label
  const renderLabel = () =>
    label && (
      <label
        htmlFor={id}
        className={`block font-semibold pb-2 ${errors?.[name] ? "text-red-500" : "text-gray-700"
          }`}
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
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          {...register(name, rules)}
          className={`${baseClasses} resize-none`}
          rows={3}
        />
        {errors?.[name] && (
          <p className="mt-1 text-sm text-red-500 font-medium">
            {errors[name].message}
          </p>
        )}
      </div>
    );
  }

  // Select / Searchable
  if (type === "select" || type === "searchable") {
    return (
      <div className={`form-control w-full ${className}`}>
        {renderLabel()}
        <select
          id={id}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          {...register(name, rules)}
          className={`${baseClasses} cursor-pointer`}
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
        {errors?.[name] && (
          <p className="mt-1 text-sm text-red-500 font-medium">
            {errors[name].message}
          </p>
        )}
      </div>
    );
  }

  // Search input (NOT part of form, icon is visual only)
  if (type === "search") {
    return (
      <div className={`form-control w-full ${className}`}>
        <div className="relative">
          <input
            id={id}
            type="search"
            placeholder={placeholder || "Search..."}
            value={value ?? ""}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => onChange?.(e.target.value)}
            className={`${baseClasses} pr-10`}
          />

          {/* Search Icon (visual only) */}
          <FiSearch
            size={18}
            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
            ${isDisabledOrReadOnly ? "text-gray-300" : "text-gray-400"}
          `}
          />
        </div>
      </div>
    );
  }

  // Date input
  if (type === "date") {
    return (
      <div className={`form-control w-full ${className}`}>
        {renderLabel()}
        <DatePicker
          id={id}
          selected={value ? new Date(value) : null}
          onChange={(date) => onChange?.(date)}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          placeholderText={placeholder || "Select date"}
          className={`${baseClasses} w-full`}
          wrapperClassName="w-full"
          disabled={disabled}
          readOnly={readOnly}
          dateFormat="dd MMM yyyy"
        />
        {errors?.[name] && (
          <p className="mt-1 text-sm text-red-500 font-medium">
            {errors[name].message}
          </p>
        )}
      </div>
    );
  }


  // Default input
  return (
    <div className={`form-control w-full ${className}`}>
      {renderLabel()}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={
          autoComplete ||
          (type === "password"
            ? "current-password"
            : type === "email"
              ? "email"
              : "off")
        }
        {...register(name, rules)}
        className={baseClasses}
      />
      {errors?.[name] && (
        <p className="mt-1 text-sm text-red-500 font-medium">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export default Shared_Input;
