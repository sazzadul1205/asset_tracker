"use client";

// React
import { useState } from "react";

// React Hook Form
import { Controller } from "react-hook-form";

// Icons
import { FaEye, FaEyeSlash, FaCalendarAlt } from "react-icons/fa";

// Datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * SharedInput
 * Reusable input supporting:
 * - text, password, email, number
 * - textarea
 * - select
 * - datepicker
 * - error display
 */
const SharedInput = ({
  min,
  max,
  step,
  name,
  label,
  error,
  control,
  register,
  rows = 3,
  rules = {},
  options = [],
  type = "text",
  className = "",
  placeholder = "",
  readOnly = false,
  disabled = false,
  defaultValue = "",
  dateLimit = "past",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  const baseClasses = `w-full px-4 py-2.5 border rounded-lg text-gray-800 placeholder-gray-400 focus:ring-4 outline-none transition-all
    ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-400 focus:border-blue-500 focus:ring-blue-100"}
    ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" : "bg-white"}
  `;

  // Render logic
  return (
    <div className={`w-full ${className}`}>
      {/* Label & Error */}
      {label && (
        <label className="block mb-2 text-md font-semibold text-gray-700">
          {label}
          {rules?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      {type === "textarea" ? (
        <textarea
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly || disabled}
          defaultValue={defaultValue}
          disabled={disabled}
          {...(register ? register(name, rules) : {})}
          className={`${baseClasses} resize-none min-h-20 max-h-[300px] overflow-y-auto`}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />
      ) : type === "select" ? (
        <select
          {...(register ? register(name, rules) : {})}
          className={`${baseClasses} cursor-pointer`}
          defaultValue={defaultValue || ""}
          disabled={disabled || readOnly}
        >
          <option
            value=""
            disabled
          >
            {placeholder || "Select an option"}
          </option>

          {options.map((opt) => (
            <option
              key={opt.value ?? opt}
              value={opt.value ?? opt}
            >
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ) : type === "date" && control ? (
        <Controller
          control={control}
          name={name}
          rules={rules}
          defaultValue={defaultValue || null}
          render={({ field }) => {
            let dateProps = {};
            if (dateLimit === "past") dateProps.maxDate = new Date();
            else if (dateLimit === "future") dateProps.minDate = new Date();

            return (
              <div className="relative w-full text-black">
                {/* Calendar Icon */}
                <FaCalendarAlt
                  className={`absolute z-50 left-3 top-1/2 -translate-y-1/2 ${disabled || readOnly ? "text-gray-400" : "text-blue-500"
                    }`}
                  size={18}
                />

                {/* DatePicker Field */}
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
                  className={`pl-10 w-full ${baseClasses}`}
                  wrapperClassName="w-full"
                  {...dateProps}
                />
              </div>
            );
          }}
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
            {...(register ? register(name, rules) : {})}
            className={baseClasses + (type === "password" ? " pr-11" : "")}
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

      {/* Error */}
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default SharedInput;
