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
  min,
  max,
  step,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  const isDisabledOrReadOnly = disabled || readOnly;

  const baseClasses = `w-full px-4 py-2 border rounded-md text-gray-800 placeholder-gray-400 focus:ring-4 outline-none transition-all
    ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}
    ${isDisabledOrReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" : "bg-white"}`;

  return (
    <div className="w-full">
      {label && (
        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-sm font-medium text-gray-700 mb-1">
          {label}
          {rules?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly || disabled}
          defaultValue={defaultValue}
          disabled={disabled}
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
          <Controller
            control={control}
            name={name}
            rules={rules}
            defaultValue={defaultValue || null}
            render={({ field }) => (
              <Select
                {...field}
                options={options}
                isDisabled={disabled || readOnly}
                isSearchable={true}
                placeholder={placeholder || "Select an option"}
                classNamePrefix="react-select"
              />
            )}
          />
        ) : (
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
        <Controller
          control={control}
          name={name}
          rules={rules}
          defaultValue={defaultValue || null}
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
                placeholderText={placeholder || "Select date"}
                selected={field.value || null}
                onChange={field.onChange}
                dateFormat="dd/MMM/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                disabled={disabled || readOnly}
                className={`pl-10 w-full ${baseClasses}`}
                popperPlacement={pickerPlacement}
              />

            </div>
          )}
        />
      ) : (
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
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
