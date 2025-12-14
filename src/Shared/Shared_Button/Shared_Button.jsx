"use client";

// Components
import clsx from "clsx";

/**
 * Shared_Button Component
 *
 * A reusable button component with built-in loading, disabled, and variant styling.
 * Uses TailwindCSS for styling and clsx for conditional class names.
 *
 * @param {React.ReactNode} children - The content inside the button (text, icon, etc.)
 * @param {string} type - HTML button type ("button", "submit", "reset"). Default: "button"
 * @param {boolean} loading - Whether the button is in a loading state. Shows spinner when true. Default: false
 * @param {boolean} disabled - Whether the button is disabled. Default: false
 * @param {string} variant - Button style variant. Options: "primary", "danger", "ghost". Default: "primary"
 * @param {boolean} fullWidth - If true, button takes full width of its container. Default: false
 * @param {string} minWidth - Minimum width of the button. Useful to prevent width change when loading spinner appears. Default: "110px"
 * @param {string} className - Additional custom classes to apply. Default: ""
 *
 * @returns {JSX.Element} - Styled button component
 */
const Shared_Button = ({
  children,
  className = "",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  minWidth = "110px",
  variant = "primary",
}) => {
  // Combine external `disabled` prop with internal `loading` state
  const isDisabled = disabled || loading;

  // Base styles applied to all buttons
  const baseStyles =
    "h-11 px-6 rounded-lg font-semibold shadow-md transition-all duration-200 transform flex items-center justify-center";

  // Variant-specific styles
  const variants = {
    primary: isDisabled
      ? "bg-blue-400 text-white cursor-not-allowed" // Disabled primary
      : "bg-blue-600 text-white cursor-pointer hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]", // Active primary

    danger: isDisabled
      ? "bg-red-400 text-white cursor-not-allowed" // Disabled danger
      : "bg-red-600 text-white cursor-pointer hover:bg-red-700 hover:-translate-y-1 active:scale-[0.98]", // Active danger

    ghost: isDisabled
      ? "text-gray-400 cursor-not-allowed" // Disabled ghost
      : "text-blue-600 cursor-pointer hover:bg-blue-50", // Active ghost
  };

  return (
    <button
      type={type}                // Button type: "button", "submit", "reset"
      disabled={isDisabled}      // HTML disabled attribute
      className={clsx(
        baseStyles,             // Base styles applied to all buttons
        variants[variant],      // Variant-specific styles
        fullWidth && "w-full",  // Full width if true
        className               // Any additional custom classes
      )}
    >
      {/* Span ensures button width remains consistent during loading */}
      <span
        className="inline-flex items-center justify-center"
        style={{ minWidth }} // Prevents width jump when spinner appears
      >
        {loading ? (
          // Loading spinner (Tailwind + daisyUI style)
          <span className="loading loading-spinner loading-sm" />
        ) : (
          children // Button content
        )}
      </span>
    </button>
  );
};

export default Shared_Button;
