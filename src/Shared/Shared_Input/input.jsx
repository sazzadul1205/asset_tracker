"use client";

import React from "react";

/**
 * Shared_Input - Reusable React Hook Form Input Component
 *
 * Props:
 *  - label       → string (optional)
 *  - type        → string (default: "text")
 *  - placeholder → string
 *  - register    → react-hook-form register function
 *  - name        → field name (required for RHF)
 *  - errors      → react-hook-form formState.errors
 *  - className   → optional extra styling
 *  - autoComplete → string (optional, recommended for email/password fields)
 */

const Shared_Input = ({
  label,
  type = "text",
  placeholder = "",
  register,
  name,
  errors,
  className = "",
  autoComplete, // new prop
}) => {
  const id = `input-${name}`;

  // Set a reasonable default autocomplete based on type
  const autoCompleteValue =
    autoComplete ||
    (type === "password"
      ? "current-password"
      : type === "email"
        ? "email"
        : "off");

  return (
    <div className={`form-control w-full ${className}`}>

      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={`label font-semibold pb-2 ${errors?.[name] ? "text-red-500" : "text-gray-700"
            }`}
        >
          {label}
        </label>
      )}

      {/* Input field */}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoCompleteValue} // added autocomplete
        className={`input input-bordered input-info w-full ${errors?.[name] ? "border-red-500" : ""
          }`}
        {...register(name)}
      />

      {/* Error message */}
      {errors?.[name] && (
        <p className="mt-1 text-sm text-red-500 font-medium">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export default Shared_Input;
