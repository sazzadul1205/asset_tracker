// React
import { useState } from "react";

// React Hook Form
import { Controller } from "react-hook-form";

// React Select
import Select from "react-select";

// Datepicker component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Icons
import { FaEye, FaEyeSlash, FaCalendarAlt } from "react-icons/fa";

// Utils
const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
};

/**
 * SharedInput Component
 *
 * Props:
 * @param {string} name - Field name for react-hook-form
 * @param {string} label - Label text shown above the input
 * @param {string} type - Input type (text, password, textarea, select, date, number)
 * @param {function} register - react-hook-form register function (for basic inputs)
 * @param {object} control - react-hook-form control object (required for Controller)
 * @param {array} options - Array of select options [{ label, value }]
 * @param {object} rules - Validation rules
 * @param {string} placeholder - Placeholder text
 * @param {number} rows - Textarea rows
 * @param {object} error - Error object from react-hook-form
 * @param {string|number} defaultValue - Default value for the input
 * @param {boolean} readOnly - Makes field read-only
 * @param {boolean} disabled - Disables input
 * @param {boolean} searchable - Enables react-select searchable dropdown
 * @param {number} min - Min value (for number)
 * @param {number} max - Max value (for number)
 * @param {number|string} step - Step size (for number)
 * @param {string} pickerPlacement - Placement of the datepicker (auto, top, bottom)
 * @param {string} dateLimit - Date limit for the datepicker (YYYY-MM-DD)
 */
const SharedInput = ({
  name,
  label,
  type = "text",
  register,
  control,
  options = [],
  rules = {},
  placeholder = "",
  rows = 3,
  error,
  defaultValue = "",
  readOnly = false,
  disabled = false,
  searchable = false,
  pickerPlacement = "auto",
  dateLimit = "",
  min,
  max,
  step,
}) => {
  // Password toggle
  const [showPassword, setShowPassword] = useState(false);

  // Input type 
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  // Disabled or read-only Check
  const isDisabledOrReadOnly = disabled || readOnly;

  // Base classes
  const baseClasses = `w-full px-4 py-2 border rounded-md text-gray-800 placeholder-gray-400 focus:ring-4 outline-none transition-all
    ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}
    ${isDisabledOrReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" : "bg-white"}`;

  // For DatePicker: calculate min/max based on dateLimit
  const today = new Date();
  let minDate = undefined;
  let maxDate = undefined;
  if (dateLimit === "future") {
    minDate = today; // only future dates
  } else if (dateLimit === "past") {
    maxDate = today; // only past dates
  }

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-sm font-medium text-gray-700 mb-1">
          {label}
          {rules?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Inputs */}
      {type === "textarea" ? (
        // Textarea
        <textarea
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          defaultValue={defaultValue}
          readOnly={readOnly || disabled}
          {...(register ? register(name, rules) : {})}
          className={`textarea w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-100 rounded-md text-gray-800 placeholder-gray-400 focus:ring-4 outline-none transition-all bg-white
            ${error ? "textarea-error" : ""}
            ${disabled || readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" : ""}`}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
      ) : type === "select" ? (
        searchable && control ? (
          // Select with react-select
          <Controller
            name={name}
            rules={rules}
            control={control}
            defaultValue={defaultValue || null}
            render={({ field }) => (
              <Select
                {...field}
                options={options}
                isSearchable={true}
                classNamePrefix="react-select"
                isDisabled={disabled || readOnly}
                placeholder={placeholder || "Select an option"}
              />
            )}
          />
        ) : (
          // Select
          <select
            disabled={disabled || readOnly}
            {...(register ? register(name, rules) : {})}
            className={`${baseClasses} cursor-pointer`}
            defaultValue={defaultValue ? String(defaultValue) : ""}
          >
            {/* Placeholder */}
            <option value="" disabled>
              {placeholder || "Select an option"}
            </option>

            {/* Options */}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      ) : type === "date" && control ? (
        // Datepicker with react-hook-form
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue || {}}
          rules={rules && rules.required ? rules : {}}
          render={({ field }) => (
            <div className="relative w-full text-black">

              {/* Force datepicker to use full width */}
              <style>
                {`
                  .react-datepicker-wrapper,
                  .react-datepicker__input-container,
                  .react-datepicker__input-container input {
                    width: 100% !important;
                  }
                `}
              </style>

              {/* Icon */}
              <FaCalendarAlt
                className={`absolute z-50 left-3 top-1/2 -translate-y-1/2 ${disabled || readOnly ? "text-gray-400" : "text-blue-500"}`}
                size={18}
              />

              {/* Datepicker */}
              <DatePicker
                showMonthDropdown
                showYearDropdown
                minDate={minDate}
                maxDate={maxDate}
                dropdownMode="select"
                dateFormat="dd/MMM/yyyy"
                onChange={field.onChange}
                disabled={disabled || readOnly}
                selected={parseDate(field.value)}
                popperPlacement={pickerPlacement}
                className={`pl-10 w-full ${baseClasses}`}
                placeholderText={placeholder || "Select date"}
              />
            </div>
          )}
        />
      ) : (
        // Input 
        <div className="relative">
          <input
            type={inputType}
            disabled={disabled}
            placeholder={placeholder}
            defaultValue={defaultValue}
            readOnly={readOnly || disabled}
            min={type === "number" ? min : undefined}
            max={type === "number" ? max : undefined}
            step={type === "number" ? step || "any" : undefined}
            autoComplete={
              type === "password"
                ? "current-password"
                : type === "email"
                  ? "username"
                  : undefined
            }
            {...(register ? register(name, rules) : {})}
            className={`${baseClasses}${type === "password" ? " pr-11" : ""}`}
          />
          {type === "password" && (
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          )}
        </div>
      )}

      {/* At the bottom of your component */}
      {error && typeof error === "object" && error.message && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}

    </div>
  );
};

export default SharedInput;
