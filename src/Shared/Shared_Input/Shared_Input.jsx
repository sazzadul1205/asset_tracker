"use client";

// React Components
import React, { useRef, useEffect, useState } from "react";

// Icons
import { FiSearch } from "react-icons/fi";

// Headless UI Combobox for searchable select
import { Combobox } from "@headlessui/react";

// React Hook Form
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from "react-hook-form";

/**
 * Shared_Input - Reusable React Hook Form Input Component
 *
 * Supports types:
 *  - text, password, email
 *  - textarea
 *  - select (normal dropdown)
 *  - searchable (dropdown + search)
 *  - search (standalone search input)
 *  - date
 *  - currency
 *
 * Works with React Hook Form via register or Controller (for searchable).
 *
 * Props:
 * @param {string}   label        - Input label text (optional)
 * @param {string}   type         - "text" | "password" | "email" | "textarea" | "select" | "searchable" | "date" | "currency"
 * @param {string}   placeholder  - Placeholder text
 * @param {Function} register     - react-hook-form register function
 * @param {string}   name         - Field name used by react-hook-form
 * @param {Object}   errors       - react-hook-form formState.errors object
 * @param {string}   className    - Additional wrapper CSS classes
 * @param {string}   autoComplete - Browser autocomplete value
 * @param {Array}    options      - [{ label, value }] for select/searchable inputs
 * @param {boolean|Function} rule - Conditional render control
 * @param {Object}   rules        - react-hook-form validation rules
 * @param {string|number} defaultValue - Initial value for edit forms
 * @param {boolean}       disabled - Disables the input
 * @param {boolean}       readOnly - Makes the input read-only
 * @param {Function}      onChange - Custom onChange handler (for searchable or custom)
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

  // --------------------------
  // Hooks (declared unconditionally)
  // --------------------------
  const [query, setQuery] = useState(""); // For searchable inputs
  const textareaRef = useRef(null);       // For textarea auto-resize
  const inputRef = useRef(null);          // For currency input
  const [internalValue, setInternalValue] = useState(
    value !== undefined
      ? Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00"
  );

  // Add this useEffect right after:
  useEffect(() => {
    if (type === "currency") {
      setInternalValue(
        value !== undefined && value !== null
          ? Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : "0.00"
      );
    }
  }, [value, type]);

  // --------------------------
  // Helper functions
  // --------------------------
  const formatValue = (val) => {
    if (!val) return "0.00";
    const num = parseFloat(val.replace(/[^\d.]/g, ""));
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // --------------------------
  // Effects
  // --------------------------
  // Auto-resize textarea
  useEffect(() => {
    if (type === "textarea" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [type, defaultValue]);


  // --------------------------
  // Conditional render check
  // --------------------------
  if (typeof rule === "function" && !rule()) return null;
  if (rule === false) return null;

  const isRequired = !!rules?.required;
  const isDisabledOrReadOnly = disabled || readOnly;

  // Base Tailwind classes for all inputs
  const baseClasses = `w-full px-4 py-2 border rounded-md text-gray-800 placeholder-gray-400 transition-all outline-none
    ${errors?.[name] ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"}
    ${isDisabledOrReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" : "bg-white"}
  `;

  // Render label
  const renderLabel = () =>
    label && (
      <label
        htmlFor={idPrefix ? `${idPrefix}-${name}` : `input-${name}`}
        className={`block font-semibold pb-2 ${errors?.[name] ? "text-red-500" : "text-gray-700"}`}
      >
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
    );

  // --------------------------
  // Handlers
  // --------------------------
  const handleCurrencyChange = (e) => {
    const el = inputRef.current;
    if (!el) return;

    const raw = e.target.value;

    // Get cursor position before formatting
    const selectionStart = el.selectionStart;

    // Remove all non-digit except decimal
    const numericString = raw.replace(/[^\d.]/g, "");

    // Convert to number
    const numValue = parseFloat(numericString);

    // Format number for display
    const formatted = isNaN(numValue)
      ? "0.00"
      : numValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Count digits before cursor in the raw input
    let digitsBeforeCursor = 0;
    for (let i = 0; i < selectionStart; i++) {
      if (/\d/.test(raw[i])) digitsBeforeCursor++;
    }

    // Find cursor position in formatted string
    let cursorPos = 0;
    let digitsSeen = 0;
    while (digitsSeen < digitsBeforeCursor && cursorPos < formatted.length) {
      if (/\d/.test(formatted[cursorPos])) digitsSeen++;
      cursorPos++;
    }

    // Update internal value for display
    setInternalValue(formatted);

    // Send numeric value to RHF
    onChange?.(isNaN(numValue) ? 0 : numValue);

    // Restore cursor position
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = cursorPos;
    }, 0);
  };


  // --------------------------
  // Render logic
  // --------------------------
  switch (type) {
    case "textarea":
      return (
        <div className={`form-control w-full ${className}`}>
          {renderLabel()}
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            defaultValue={defaultValue}
            disabled={disabled}
            readOnly={readOnly}
            {...register(name, rules)}
            className={`${baseClasses} resize-none`}
            rows={3}
          />
          {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
        </div>
      );

    case "select":
      return (
        <div className={`form-control w-full ${className}`}>
          {renderLabel()}
          <select
            defaultValue={defaultValue}
            disabled={disabled}
            readOnly={readOnly}
            {...register(name, rules)}
            className={`${baseClasses} cursor-pointer`}
          >
            <option value="" disabled>{placeholder || "Select an option"}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
        </div>
      );

    case "searchable":
      const filteredOptions = query === "" ? options : options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));
      return (
        <div className={`form-control w-full ${className}`}>
          {renderLabel()}
          <Combobox value={value} onChange={onChange} disabled={disabled || readOnly}>
            <div className="relative">
              <Combobox.Input
                className={`${baseClasses} w-full`}
                displayValue={(val) => {
                  const selected = options.find((opt) => opt.value === val);
                  return selected?.label || "";
                }}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder || "Search..."}
              />
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredOptions.length === 0 ? (
                  <div className="cursor-default select-none px-4 py-2 text-gray-500">No results found</div>
                ) : (
                  filteredOptions.map((opt) => (
                    <Combobox.Option
                      key={opt.value}
                      value={opt.value}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-4 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"}`
                      }
                    >
                      {opt.label}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Combobox>
          {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
        </div>
      );

    case "search":
      return (
        <div className={`form-control w-full ${className}`}>
          <div className="relative">
            <input
              type="search"
              placeholder={placeholder || "Search..."}
              value={value ?? ""}
              disabled={disabled}
              readOnly={readOnly}
              onChange={(e) => onChange?.(e.target.value)}
              className={`${baseClasses} pr-10`}
            />
            <FiSearch
              size={18}
              className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDisabledOrReadOnly ? "text-gray-300" : "text-gray-400"}`}
            />
          </div>
        </div>
      );

    case "date":
      return (
        <div className={`form-control w-full ${className}`}>
          {renderLabel()}
          <DatePicker
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
            autoComplete="bday"
          />
          {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
        </div>
      );

    case "currency":
      return (
        <div className={`form-control w-full ${className}`}>
          {renderLabel()}
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder || "0.00"}
            value={internalValue}
            disabled={disabled}
            readOnly={readOnly}
            className={baseClasses}
            onChange={handleCurrencyChange}
          />
          {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
        </div>
      );

    default:
      // Default text/password/email input
      return (
        <div className={`form-control w-full ${className}`}>
          {renderLabel()}
          <input
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
          {errors?.[name] && <p className="mt-1 text-sm text-red-500 font-medium">{errors[name].message}</p>}
        </div>
      );
  }
};

export default Shared_Input;
