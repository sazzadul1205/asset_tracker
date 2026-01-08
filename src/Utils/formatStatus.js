// src/Utils/formatStatus.js

// Format enum to readable text
export const formatStatusText = (status) => {
  if (!status) return "";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Map status to badge colors
export const getStatusColor = (status) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800";
    case "assigned":
      return "bg-blue-100 text-blue-800";
    case "under_maintenance":
      return "bg-yellow-100 text-yellow-800";
    case "lost":
      return "bg-red-100 text-red-800";
    case "retired":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
