// Map action_type to colors
export const actionTypeColors = {
  assign: { bg: "bg-blue-100", text: "text-blue-700" },
  request: { bg: "bg-green-100", text: "text-green-700" },
  return: { bg: "bg-yellow-100", text: "text-yellow-700" },
  repair: { bg: "bg-orange-100", text: "text-orange-700" },
  retire: { bg: "bg-red-100", text: "text-red-700" },
  transfer: { bg: "bg-purple-100", text: "text-purple-700" },
  update: { bg: "bg-teal-100", text: "text-teal-700" },
  dispose: { bg: "bg-gray-100", text: "text-gray-700" },
};

// Status colors mapping
export const statusColors = {
  accepted: { bg: "bg-green-100", text: "text-green-700" },
  rejected: { bg: "bg-red-100", text: "text-red-700" },
  expired: { bg: "bg-yellow-100", text: "text-yellow-700" },
  pending: { bg: "bg-gray-100", text: "text-gray-700" },
};

// Safe date formatter with invalid date handling
export const formatDate = (dateStr) => {
  if (!dateStr) return "Invalid Date";

  const date = new Date(dateStr);

  // Check for invalid date
  if (isNaN(date.getTime())) return "Invalid Date";

  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  try {
    return date.toLocaleString("en-US", options);
  } catch {
    return "Invalid Date";
  }
};

// Convert action_type to readable title
export const getTitle = (action_type, request_id) => {
  if (!action_type) return `Request #${request_id}`;
  const actionMap = {
    assign: "Assign Assets Request",
    request: "Request Assets Request",
    return: "Return Assets Request",
    repair: "Repair Assets Request",
    retire: "Retire Assets Request",
    transfer: "Transfer Assets Request",
    update: "Asset Update Request",
    dispose: "Dispose Assets Request",
  };
  return `${actionMap[action_type] || "Request"} # ${request_id}`;
};
