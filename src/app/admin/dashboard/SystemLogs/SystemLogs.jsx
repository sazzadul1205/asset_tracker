// src/app/admin/dashboard/SystemLogs/SystemLogs.jsx

// ==============================================================
// REACT & EXTERNAL IMPORTS
// ==============================================================
import React, { useRef, useState, useEffect } from "react";

// ICONS
import {
  IoBuildOutline,
  IoCloseCircleOutline,
  IoCreateOutline,
  IoDocumentTextOutline,
  IoPersonAddOutline,
  IoRepeatOutline,
  IoReturnDownBackOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { TbActivityHeartbeat } from "react-icons/tb";
import { BsBoxSeam, BsChevronDown } from "react-icons/bs";

// COMPONENTS
import UserId_To_Name from "../../departments/UserId_To_Name/UserId_To_Name";

// ==============================================================
// COLOR MAPS & CONSTANTS
// ==============================================================

// Color definitions for consistent styling across the app
const COLOR_MAP = {
  blue: {
    text: 'text-blue-600',
    bgLight: 'bg-blue-100',
    bgDark: 'bg-blue-600',
    border: 'border-blue-200',
    textDark: 'text-blue-700',
  },
  green: {
    text: 'text-green-600',
    bgLight: 'bg-green-100',
    bgDark: 'bg-green-600',
    border: 'border-green-200',
    textDark: 'text-green-700',
  },
  yellow: {
    text: 'text-yellow-600',
    bgLight: 'bg-yellow-100',
    bgDark: 'bg-yellow-600',
    border: 'border-yellow-200',
    textDark: 'text-yellow-700',
  },
  orange: {
    text: 'text-orange-600',
    bgLight: 'bg-orange-100',
    bgDark: 'bg-orange-600',
    border: 'border-orange-200',
    textDark: 'text-orange-700',
  },
  red: {
    text: 'text-red-600',
    bgLight: 'bg-red-100',
    bgDark: 'bg-red-600',
    border: 'border-red-200',
    textDark: 'text-red-700',
  },
  purple: {
    text: 'text-purple-600',
    bgLight: 'bg-purple-100',
    bgDark: 'bg-purple-600',
    border: 'border-purple-200',
    textDark: 'text-purple-700',
  },
  teal: {
    text: 'text-teal-600',
    bgLight: 'bg-teal-100',
    bgDark: 'bg-teal-600',
    border: 'border-teal-200',
    textDark: 'text-teal-700',
  },
  gray: {
    text: 'text-gray-600',
    bgLight: 'bg-gray-100',
    bgDark: 'bg-gray-600',
    border: 'border-gray-200',
    textDark: 'text-gray-700',
  },
};

// Status-specific color maps
const STATUS_COLORS = {
  pending: COLOR_MAP.orange,
  accepted: COLOR_MAP.green,
  rejected: COLOR_MAP.red,
};

// Request type options with labels, values, colors, and icons
const REQUEST_TYPES = [
  { label: "Assign", value: "assign", color: "blue", icon: <IoPersonAddOutline /> },
  { label: "Request", value: "request", color: "green", icon: <IoDocumentTextOutline /> },
  { label: "Return", value: "return", color: "yellow", icon: <IoReturnDownBackOutline /> },
  { label: "Repair", value: "repair", color: "orange", icon: <IoBuildOutline /> },
  { label: "Retire", value: "retire", color: "red", icon: <IoCloseCircleOutline /> },
  { label: "Transfer", value: "transfer", color: "purple", icon: <IoRepeatOutline /> },
  { label: "Update", value: "update", color: "teal", icon: <IoCreateOutline /> },
  { label: "Dispose", value: "dispose", color: "gray", icon: <IoTrashOutline /> },
];

// Status options with labels, values, and colors
const STATUS_OPTIONS = [
  { label: "Pending", value: "pending", color: "orange" },
  { label: "Accepted", value: "accepted", color: "green" },
  { label: "Rejected", value: "rejected", color: "red" },
];

// Combine request types and status options with type identifiers
const COMBINED_OPTIONS = [
  ...REQUEST_TYPES.map((t) => ({ ...t, type: "requestType" })),
  ...STATUS_OPTIONS.map((s) => ({ ...s, type: "status", icon: null })),
];

// ==============================================================
// HELPER FUNCTIONS
// ==============================================================

/**
 * Get color classes for a given color name
 * @param {string} colorName - Name of the color (blue, green, etc.)
 * @param {string} variant - Which color variant to use (text, bgLight, bgDark, border, textDark)
 * @returns {string} Tailwind CSS class
 */
const getColorClass = (colorName, variant = 'bgDark') => {
  return COLOR_MAP[colorName]?.[variant] || COLOR_MAP.gray[variant];
};

/**
 * Get status color classes
 * @param {string} status - Status value (pending, accepted, rejected)
 * @param {string} variant - Which color variant to use
 * @returns {string} Tailwind CSS class
 */
const getStatusColor = (status, variant = 'bgDark') => {
  return STATUS_COLORS[status]?.[variant] || COLOR_MAP.gray[variant];
};

/**
 * Returns the appropriate icon for a given request type
 * @param {string} type - Request type (assign, request, return, etc.)
 * @returns {JSX.Element} React icon component
 */
const getRequestTypeIcon = (type) => {
  const iconMap = {
    assign: <IoPersonAddOutline className={getColorClass('blue', 'text')} />,
    request: <IoDocumentTextOutline className={getColorClass('green', 'text')} />,
    return: <IoReturnDownBackOutline className={getColorClass('yellow', 'text')} />,
    repair: <IoBuildOutline className={getColorClass('orange', 'text')} />,
    retire: <IoCloseCircleOutline className={getColorClass('red', 'text')} />,
    transfer: <IoRepeatOutline className={getColorClass('purple', 'text')} />,
    update: <IoCreateOutline className={getColorClass('teal', 'text')} />,
    dispose: <IoTrashOutline className={getColorClass('gray', 'text')} />,
  };
  return iconMap[type] || <BsBoxSeam className={getColorClass('gray', 'text')} />; // Fallback icon
};

// ==============================================================
// MAIN COMPONENT: SYSTEM LOGS
// ==============================================================
const SystemLogs = ({
  requestData,           // Array of log data
  hasNextPage,          // Boolean for infinite scroll
  fetchNextPage,        // Function to fetch next page
  onFilterChange,       // Callback when filters change
  selectedOptions,      // Currently selected filter options
  setSelectedOptions,   // Setter for selected options
  isFetchingNextPage,   // Boolean for loading state
  IsRequestLogsLoading, // Boolean for initial loading
}) => {
  // ==============================================================
  // STATE & REFS
  // ==============================================================
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const loadMoreRef = useRef();    // Ref for infinite scroll observer
  const dropdownRef = useRef();    // Ref for dropdown click-outside detection

  // Filter combined options by type for dropdown sections
  const typeOptions = COMBINED_OPTIONS.filter(o => o.type === "requestType");
  const statusOptions = COMBINED_OPTIONS.filter(o => o.type === "status");

  // ==============================================================
  // EFFECTS (LIFECYCLE & SIDE EFFECTS)
  // ==============================================================

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Set up Intersection Observer for infinite scrolling
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ==============================================================
  // FILTER HANDLING FUNCTIONS
  // ==============================================================

  /**
   * Toggle selection of a filter option
   * @param {Object} option - The option to toggle
   */
  const toggleOption = (option) => {
    const exists = selectedOptions.find(
      (o) => o.value === option.value && o.type === option.type
    );

    let newSelected;
    if (exists) {
      // Remove option if already selected
      newSelected = selectedOptions.filter(
        (o) => !(o.value === option.value && o.type === option.type)
      );
    } else {
      // Add option if not selected
      newSelected = [...selectedOptions, option];
    }

    setSelectedOptions(newSelected);
    onFilterChange?.({ selectedOptions: newSelected });
  };

  /**
   * Remove a selected filter option
   * @param {string} value - The value of the option to remove
   * @param {string} type - The type of the option (requestType or status)
   */
  const removeOption = (value, type) => {
    const newSelected = selectedOptions.filter(
      (o) => !(o.value === value && o.type === type)
    );
    setSelectedOptions(newSelected);
    onFilterChange?.({ selectedOptions: newSelected });
  };

  // ==============================================================
  // RENDER
  // ==============================================================
  return (
    <div className="rounded-lg bg-white shadow-sm hover:shadow-lg transition-shadow duration-200 p-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">

        {/* TITLE */}
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
          <TbActivityHeartbeat className="text-blue-500 text-2xl" />
          Recent System Activity
        </h2>

        {/* FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">

          {/* SELECTED FILTER PILLS */}
          <div className="flex flex-wrap gap-2 max-w-full">
            {selectedOptions.map((opt) => (
              <div
                key={opt.value + opt.type}
                onClick={() => removeOption(opt.value, opt.type)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white cursor-pointer
                      transition hover:opacity-80 whitespace-nowrap
                      ${getColorClass(opt.color, 'bgDark')}`}
                title="Click to remove"
              >
                {opt.icon && <span>{opt.icon}</span>}
                <span className="font-medium">{opt.label}</span>
                <span className="text-xs opacity-80">×</span>
              </div>
            ))}
          </div>

          {/* FILTER DROPDOWN */}
          <div className="relative mt-2 sm:mt-0 self-start sm:self-auto" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white
                   text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
              aria-label="Add filter"
            >
              Add Filter
              <BsChevronDown className="text-gray-500 text-sm" />
            </button>

            {/* DROPDOWN MENU */}
            {dropdownOpen && (
              <div className="absolute right-0 z-20 mt-2 w-full sm:w-80 max-h-80 overflow-y-auto
                        bg-white border border-gray-300 rounded-lg shadow-xl">
                {/* REQUEST TYPE */}
                <div className="px-4 pt-3 pb-2">
                  <h1 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Request Type
                  </h1>
                </div>

                {typeOptions.map((option) => {
                  const isSelected = selectedOptions.some(
                    (o) => o.value === option.value && o.type === option.type
                  );
                  return (
                    <div
                      key={option.value + option.type}
                      onClick={() => toggleOption(option)}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100
                            ${isSelected ? "bg-gray-100" : ""}`}
                    >
                      {option.icon && <span className="text-lg">{option.icon}</span>}
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  );
                })}

                <div className="my-2 border-t border-gray-200" />

                {/* STATUS */}
                <div className="px-4 pt-2 pb-2">
                  <h1 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </h1>
                </div>

                {statusOptions.map((option) => {
                  const isSelected = selectedOptions.some(
                    (o) => o.value === option.value && o.type === option.type
                  );
                  return (
                    <div
                      key={option.value + option.type}
                      onClick={() => toggleOption(option)}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100
                            ${isSelected ? "bg-gray-100" : ""}`}
                    >
                      {option.icon && <span className="text-lg">{option.icon}</span>}
                      <span className="text-sm font-medium">{option.label}</span>
                      <span
                        className={`ml-auto h-2.5 w-2.5 rounded-full ${getColorClass(option.color, 'bgDark')}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>


      {/* LOGS CONTENT */}
      <div className="p-4 pt-0 space-y-5">
        {/* INITIAL LOADING SKELETON */}
        {IsRequestLogsLoading && <LogsSkeleton count={5} />}

        {/* LOG ENTRIES */}
        {!IsRequestLogsLoading && requestData.map((log) => {
          const date = new Date(log.timestamp);

          return (
            <div
              key={log._id}
              className="relative pl-6 pb-5 border-l-2 border-gray-50 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-lg p-5"
            >
              {/* STATUS INDICATOR DOT */}
              <span
                className={`absolute -left-1.75 top-2 h-5 w-5 rounded-full ${getStatusColor(log.state, 'bgDark')}`}
              />

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                {/* LEFT SIDE: LOG DETAILS */}
                <div className="space-y-1">
                  {/* ACTION & USER */}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold capitalize text-gray-900">{log.action}</span>
                    <span className="text-gray-500">by</span>
                    <span className="font-medium text-gray-800">
                      <UserId_To_Name userId={log.performedBy} />
                    </span>
                  </div>

                  {/* NOTES (IF ANY) */}
                  {log.details?.notes && (
                    <p className="text-sm italic text-gray-500">&quot;{log.details.notes}&quot;</p>
                  )}

                  {/* ADDITIONAL DETAILS */}
                  <div className="text-sm text-gray-600 space-y-0.5">
                    {log.details?.departmentId && (
                      <div>Department: {log.details.departmentId}</div>
                    )}

                    {log.details?.additionalData?.assetId && (
                      <div>
                        Asset Ref:{" "}
                        <span className="font-medium">
                          {log.details.additionalData.assetId}
                        </span>
                      </div>
                    )}

                    {log.details?.type && (
                      <div className="flex items-center gap-1">
                        {getRequestTypeIcon(log.details.type)}
                        <span className="capitalize">{log.details.type}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE: METADATA */}
                <div className="text-sm text-gray-600 md:text-right space-y-1 shrink-0">
                  {/* STATUS BADGE */}
                  <div
                    className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium capitalize ${getStatusColor(log.state, 'bgLight')} ${getStatusColor(log.state, 'textDark')}`}
                  >
                    {log.state}
                  </div>

                  {/* PRIORITY */}
                  {log.details?.priority && (
                    <div>
                      Priority:{" "}
                      <span className="font-medium capitalize">
                        {log.details.priority}
                      </span>
                    </div>
                  )}

                  {/* EXPECTED COMPLETION */}
                  {log.details?.expectedCompletion && (
                    <div>
                      Expected:{" "}
                      <span className="font-medium">
                        {new Date(log.details.expectedCompletion).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {/* TIMESTAMP */}
                  <div className="text-gray-500">
                    {date.toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* INFINITE SCROLL LOAD MORE TRIGGER */}
        <div ref={loadMoreRef} className="text-center py-4">
          {isFetchingNextPage && (
            <p className="text-gray-500">Loading more logs...</p>
          )}
          {!hasNextPage && !IsRequestLogsLoading && (
            <p className="text-gray-500">No more logs</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;

// ==============================================================
// SKELETON LOADER COMPONENT
// ==============================================================
/**
 * Skeleton loader for log entries
 * @param {Object} props
 * @param {number} props.count - Number of skeleton items to render
 */
const LogsSkeleton = ({ count = 5 }) => {
  return Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className="animate-pulse relative pl-6 pb-5 border-l-2 border-gray-100 bg-gray-50 rounded-lg p-5"
    >
      <span className="absolute -left-1.75 top-2 h-5 w-5 rounded-full bg-gray-300" />

      <div className="flex justify-between gap-4">
        {/* LEFT SIDE SKELETON */}
        <div className="space-y-2 w-full">
          <div className="h-4 bg-gray-300 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>

        {/* RIGHT SIDE SKELETON */}
        <div className="space-y-2 w-32">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  ));
};