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

/**
 * SharedInput
 *
 * A reusable input component supporting:
 * - text, password, email, number
 * - textarea
 * - select (basic and searchable)
 * - datepicker
 * - error display
 *
 * Props:
 * @param {string} label - The input label
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disables the input
 * @param {boolean} readOnly - Makes input read-only
 * @param {number} rows - Number of rows (for textarea)
 * @param {string} defaultValue - Default value of input
 * @param {number} min - Minimum value (for number input)
 * @param {number} max - Maximum value (for number input)
 * @param {object} error - Error object from react-hook-form
 * @param {number|string} step - Step value (for number input)
 * @param {object} rules - Validation rules for react-hook-form
 * @param {string} name - The input's name (required for form registration)
 * @param {boolean} searchable - Enables searchable select (requires control)
 * @param {string} type - Input type: text, password, textarea, select, date, number
 * @param {array} options - Array of options for select inputs [{ label, value, ... }]
 * @param {object} register - react-hook-form register function (required for basic select/input)
 * @param {object} control - react-hook-form control object (required for Controller, e.g., searchable select or date)
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
  min,
  max,
  step,
}) => {
  // States
  const [showPassword, setShowPassword] = useState(false);

  // Input type
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  // Classes for input
  const isDisabledOrReadOnly = disabled || readOnly;

  // Classes for input
  const baseClasses = `w-full px-4 py-2 border rounded-md text-gray-800 placeholder-gray-400 focus:ring-4 outline-none transition-all
  ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}
  ${isDisabledOrReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" : "bg-white"}`;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-sm font-medium text-gray-700 mb-1">
          {label}
          {rules?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      {type === "textarea" ? (
        // Textarea
        <textarea
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly || disabled}
          defaultValue={defaultValue}
          disabled={disabled}
          {...(register ? register(name, rules) : {})}
          className={`textarea w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-100 rounded-md text-gray-800 placeholder-gray-400 focus:ring-4 outline-none transition-all  bg-white
          ${error ? "textarea-error" : ""}  
          ${disabled || readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" : ""}
          `}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />

      ) : type === "select" ? (
        searchable && control ? (
          <Controller
            control={control}
            name={name}
            rules={rules}
            defaultValue={defaultValue || null}
            render={({ field }) => (
              <div className="relative w-full text-black">
                <FaCalendarAlt
                  className={`absolute z-50 left-3 top-1/2 -translate-y-1/2 ${disabled || readOnly ? "text-gray-400" : "text-blue-500"
                    }`}
                  size={18}
                />

                <DatePicker
                  placeholderText={placeholder || "Select date"}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="dd/MMM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  disabled={disabled || readOnly}
                  wrapperClassName="w-full"
                  className={`pl-10 w-full ${baseClasses}`}
                />
              </div>
            )}
          />
        ) : (
          // Basic select
          <select
            {...(register ? register(name, rules) : {})}
            defaultValue={defaultValue || ""}
            disabled={disabled || readOnly}
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
        )
      ) : type === "date" && control ? (
        // Datepicker
        <Controller
          control={control}
          name={name}
          rules={rules}
          defaultValue={defaultValue || null}
          render={({ field }) => (
            <div className="relative w-full text-black">
              <FaCalendarAlt
                className={`absolute z-50 left-3 top-1/2 -translate-y-1/2 ${disabled || readOnly ? "text-gray-400" : "text-blue-500"
                  }`}
                size={18}
              />
              <DatePicker
                placeholderText={placeholder || "Select date"}
                selected={field.value || defaultValue}
                onChange={field.onChange}
                dateFormat="dd/MMM/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                disabled={disabled || readOnly}
                wrapperClassName="w-full"
                className={`pl-10 w-full ${baseClasses}`}
              />
            </div>
          )}
        />
      ) : (
        // Basic input
        <div className="relative">
          <input
            type={inputType}
            placeholder={placeholder}
            readOnly={readOnly || disabled}
            disabled={disabled}
            defaultValue={defaultValue}
            min={type === "number" ? min : undefined}
            max={type === "number" ? max : undefined}
            step={type === "number" ? step || "any" : undefined}
            {...(register ? register(name, rules) : {})}
            className={`${baseClasses + (type === "password" ? " pr-11" : "")} `}
          />
          {type === "password" && (
            // Show/hide password
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default SharedInput;
