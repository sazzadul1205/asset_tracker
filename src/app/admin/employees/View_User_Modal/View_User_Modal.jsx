// Date Fns
import { formatDistanceToNow } from 'date-fns';

// Icons
import { FiX, FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiUsers, FiUserCheck, FiClock, FiHome, FiActivity, FiShield } from 'react-icons/fi';
import {
  FaIdBadge,
  FaBuilding,
  FaCalendarAlt,
  FaPhoneAlt,
  FaUserShield,
  FaSyncAlt,
  FaUserPlus,
  FaInfoCircle
} from "react-icons/fa";

// Status Styles
const statusStyles = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-200 text-gray-700",
  on_leave: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-700",
  terminated: "bg-red-200 text-red-800",
};

const View_User_Modal = ({ selectedUser, setSelectedUser }) => {

  // Status Formatter
  const formatStatus = (status = "") =>
    status
      .replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Close Modal
  const handleClose = () => {
    setSelectedUser(null);
    document.getElementById("View_User_Modal")?.close();
  }

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Format date function
  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).replace(",", "").toUpperCase();
  };

  // Format date only
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get role color
  const getRoleColor = (role) => {
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case "admin": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "employee": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      id="View_User_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full">
          {/* Avatar */}
          <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-blue-200 text-blue-700 font-bold text-lg md:text-xl">
            <span>
              {selectedUser?.personal?.name
                ?.trim()
                ?.split(" ")
                ?.map((w) => w[0])
                ?.join("")
                ?.substring(0, 2)
                ?.toUpperCase() || "NA"}
            </span>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
              <h3 className="font-bold text-gray-800 text-lg md:text-xl truncate">
                {selectedUser?.personal?.name || "No Name"}
              </h3>
              {selectedUser?.employment?.role && (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(selectedUser.employment.role)}`}>
                  {selectedUser.employment.role}
                </span>
              )}
            </div>

            <p className="text-gray-500 text-sm md:text-base">
              {selectedUser?.credentials?.email || "N/A"}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-400 text-xs md:text-sm">
                <span className="font-medium">Employee ID:</span> {selectedUser?.personal?.userId || "N/A"}
              </p>
              {selectedUser?.personal?.status && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[selectedUser.personal.status] || "bg-gray-100 text-gray-700"}`}>
                  {formatStatus(selectedUser.personal.status)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300 cursor-pointer self-start sm:self-center"
          aria-label="Close modal"
        >
          <FiX className="text-xl text-gray-600" />
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Last Login</p>
              <p className="font-medium text-sm">
                {selectedUser?.credentials?.lastLogin
                  ? formatDistanceToNow(new Date(selectedUser?.credentials?.lastLogin), {
                    addSuffix: true,
                  })
                  : "Never"}
              </p>
            </div>
            <FiActivity className="text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Hire Date</p>
              <p className="font-medium text-sm">
                {selectedUser?.personal?.hireDate
                  ? formatDate(selectedUser.personal.hireDate)
                  : "N/A"}
              </p>
            </div>
            <FiCalendar className="text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Account Created</p>
              <p className="font-medium text-sm">
                {selectedUser?.metadata?.createdAt
                  ? formatDate(selectedUser.metadata.createdAt)
                  : "N/A"}
              </p>
            </div>
            <FiClock className="text-purple-500" />
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="font-medium text-sm">
                {selectedUser?.metadata?.updatedAt
                  ? formatDate(selectedUser.metadata.updatedAt)
                  : "N/A"}
              </p>
            </div>
            <FiClock className="text-amber-500" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Personal Information */}
        <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-2 h-5 rounded-full"></span>
            Personal Information
          </h3>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="flex items-start gap-3">
              <FiUser className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Full Name</p>
                <p className='font-medium text-gray-800'>{selectedUser?.personal?.name || "N/A"}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <FiMail className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Email</p>
                <p className='font-medium text-gray-800 truncate'>{selectedUser?.credentials?.email || "N/A"}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <FiPhone className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Phone</p>
                <p className='font-medium text-gray-800'>{selectedUser?.personal?.phone || "N/A"}</p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-start gap-3">
              <FaIdBadge className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Employee ID</p>
                <p className='font-medium text-gray-800 font-mono'>{selectedUser?.personal?.userId || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
            Work Information
          </h3>

          <div className="space-y-4">
            {/* Department */}
            <div className="flex items-start gap-3">
              <FaBuilding className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Department</p>
                <p className='font-medium text-gray-800'>
                  {selectedUser?.employment?.departmentId || "Unassigned"}
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-start gap-3">
              <FiBriefcase className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Position</p>
                <p className='font-medium text-gray-800'>{selectedUser?.employment?.position || "N/A"}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3">
              <FiShield className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Role</p>
                <div className="flex items-center gap-2">
                  <p className='font-medium text-gray-800'>{selectedUser?.employment?.role || "N/A"}</p>
                  {selectedUser?.employment?.role && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(selectedUser.employment.role)}`}>
                      {selectedUser.employment.role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Hire Date */}
            <div className="flex items-start gap-3">
              <FiCalendar className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Hire Date</p>
                <p className='font-medium text-gray-800'>
                  {selectedUser?.personal?.hireDate
                    ? formatDate(selectedUser.personal.hireDate)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
            Account Status
          </h3>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-start gap-3">
              <FiUserCheck className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Status</p>
                {selectedUser?.personal?.status ? (
                  <span
                    className={`inline-flex items-center justify-center min-w-24 px-3 py-1.5 rounded-xl text-sm font-semibold mt-1 ${statusStyles[selectedUser.personal.status] || "bg-gray-200 text-gray-700"}`}>
                    {formatStatus(selectedUser.personal.status)}
                  </span>
                ) : (
                  <p className="font-medium text-gray-400">N/A</p>
                )}
              </div>
            </div>

            {/* Account Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
                <FaInfoCircle className="text-gray-400 w-4 h-4" />
                Account Summary
              </h4>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                  <span className='text-gray-600'>Role</span>
                  <span className='font-medium'>{selectedUser?.employment?.role || "N/A"}</span>
                </div>

                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                  <span className='text-gray-600'>Status</span>
                  <span className='font-medium'>{formatStatus(selectedUser?.personal?.status)}</span>
                </div>

                <div className='flex justify-between items-center py-2'>
                  <span className='text-gray-600'>Department</span>
                  <span className='font-medium'>{selectedUser?.employment?.departmentId || "Unassigned"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 w-2 h-5 rounded-full"></span>
            Timeline
          </h3>

          <div className="space-y-4">
            {/* Account Created */}
            <div className="flex items-start gap-3">
              <FaUserPlus className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Account Created</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {formatDateTime(selectedUser?.metadata?.createdAt)}
                </p>
              </div>
            </div>

            {/* Account Updated */}
            <div className="flex items-start gap-3">
              <FaSyncAlt className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Account Updated</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {formatDateTime(selectedUser?.metadata?.updatedAt)}
                </p>
              </div>
            </div>

            {/* Hire Date */}
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Hire Date</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {selectedUser?.personal?.hireDate
                    ? formatDate(selectedUser.personal.hireDate)
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-start gap-3">
              <FiActivity className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Last Login</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {selectedUser?.credentials?.lastLogin
                    ? formatDateTime(selectedUser.credentials.lastLogin)
                    : "Never logged in"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information - Full Width */}
      <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 w-full mt-4 md:mt-6'>
        <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
          <span className="bg-indigo-100 text-indigo-600 w-2 h-5 rounded-full"></span>
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4">
          {/* Contact Details */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
              <FiUser className="text-gray-400 w-4 h-4" />
              Contact Details
            </h3>

            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Email</p>
                <p className='font-medium text-gray-800 text-sm truncate max-w-50'>
                  {selectedUser?.credentials?.email || "N/A"}
                </p>
              </div>

              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Phone</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {selectedUser?.personal?.phone || "N/A"}
                </p>
              </div>

              <div className='flex justify-between items-center py-2'>
                <p className='text-sm text-gray-600'>Employee ID</p>
                <p className='font-medium text-gray-800 text-sm font-mono'>
                  {selectedUser?.personal?.userId || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
              <FiBriefcase className="text-gray-400 w-4 h-4" />
              Work Details
            </h3>

            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Department</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {selectedUser?.employment?.departmentId || "Unassigned"}
                </p>
              </div>

              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Position</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {selectedUser?.employment?.position || "-"}
                </p>
              </div>

              <div className='flex justify-between items-center py-2'>
                <p className='text-sm text-gray-600'>Role</p>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser?.employment?.role)}`}>
                  {selectedUser?.employment?.role || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Mobile */}
      <div className="md:hidden mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default View_User_Modal;