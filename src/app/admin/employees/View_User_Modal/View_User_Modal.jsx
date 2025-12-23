// Date Fns
import { formatDistanceToNow } from 'date-fns';

// Icons
import { ImCross } from 'react-icons/im';
import {
  FaIdBadge,
  FaBuilding,
  FaCalendarAlt,
  FaHashtag,
  FaPhoneAlt,
  FaUser,
  FaUserShield,
  FaBriefcase,
  FaUserCheck,
  FaSyncAlt,
  FaUserPlus,
} from "react-icons/fa";
import { MdEmail } from 'react-icons/md';

// Status Styles
const statusStyles = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-200 text-gray-700",
  on_leave: "bg-yellow-100 text-yellow-700",
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

  return (
    <div
      id="View_User_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon container */}
          <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-gray-800 font-bold text-lg">
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
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">
              {selectedUser?.personal?.name || "No Name"}
            </h3>
            <p className="text-gray-500 text-xs md:text-sm">
              {selectedUser?.credentials?.email || "N/A"}
            </p>
            <p className="text-gray-400 text-xs md:text-sm">
              Last Login:{" "}
              {selectedUser?.credentials?.lastLogin
                ? formatDistanceToNow(new Date(selectedUser?.credentials?.lastLogin), {
                  addSuffix: true,
                })
                : "Never"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4 mt-4">

        {/* Personal Information */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">
          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">Personal Information</h3>

          {/* Details */}
          <div className="space-y-5">
            {/* Full Name */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{selectedUser?.personal?.name || "N/A"}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <MdEmail className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedUser?.credentials?.email || "N/A"}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedUser?.personal?.phone || "N/A"}</p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-center gap-3">
              <FaHashtag className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">{selectedUser?.personal?.userId || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">

          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">Work Information</h3>

          {/* Details */}
          <div className="space-y-5">
            {/* Department */}
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">
                  {selectedUser?.employment?.departmentId}
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-center gap-3">
              <FaBriefcase className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{selectedUser?.employment?.position || "N/A"}</p>
              </div>
            </div>

            {/* Role / Access Level */}
            <div className="flex items-center gap-3">
              <FaUserShield className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">
                  {selectedUser?.employment?.role || "N/A"}
                </p>
              </div>
            </div>

            {/* Hire Date */}
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Hire Date</p>
                <p className="font-medium">
                  {selectedUser?.personal?.hireDate
                    ? new Date(selectedUser.personal.hireDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">

          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">Account Status</h3>

          {/* Details */}
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center gap-3">
              <FaUserCheck className="text-gray-500 w-5 h-5" />
              <div>
                {/* Label */}
                <p className="text-sm text-gray-500">Status</p>

                {/* Status */}
                {selectedUser?.personal?.status ? (
                  <span
                    className={`inline-flex items-center justify-center min-w-24 px-3 py-1 rounded-xl text-sm font-semibold ${statusStyles[selectedUser.personal.status] || "bg-gray-200 text-gray-700"}`}>
                    {formatStatus(selectedUser.personal.status)}
                  </span>
                ) : (
                  <p className="font-medium text-gray-400">N/A</p>
                )}
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-3">
              <FaIdBadge className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium">
                  {selectedUser?.personal?.userId || "N/A"}
                </p>
              </div>
            </div>

            {/* Account Summary */}
            <div className='bg-gray-50 p-4 rounded-lg' >

              {/* Header */}
              <h4 className='text-sm font-medium text-gray-700 mb-2' >Account Summary</h4>

              {/* Details */}
              <div className='space-y-2 text-sm' >
                {/* Role */}
                <div className='flex justify-between' >
                  <span className='text-gray-600' >Role :</span>
                  <span className='font-medium' >{selectedUser?.employment?.role || "N/A"}</span>
                </div>

                {/* Status */}
                <div className='flex justify-between' >
                  <span className='text-gray-600' >Status :</span>
                  <span className='font-medium' >{formatStatus(selectedUser?.personal?.status)}</span>
                </div>

                {/* Department */}
                <div className='flex justify-between' >
                  <span className='text-gray-600' >Department :</span>
                  <span className='font-medium' >{selectedUser?.employment?.departmentId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">

          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">Timeline</h3>

          {/* Details */}
          <div className="space-y-5">

            {/* Account Created */}
            <div className="flex items-center gap-3">
              <FaUserPlus className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-medium">
                  {selectedUser?.metadata?.createdAt
                    ? new Date(selectedUser.metadata.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Account Updated */}
            <div className="flex items-center gap-3">
              <FaSyncAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Account Updated</p>
                <p className="font-medium">
                  {selectedUser?.metadata?.updatedAt
                    ? new Date(selectedUser.metadata.updatedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : "N/A"}

                </p>
              </div>
            </div>

            {/* Hire Date */}
            <div className="flex items-center gap-3">
              <FaBriefcase className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Hire Date</p>
                <p className="font-medium">
                  {selectedUser?.personal?.hireDate
                    ? new Date(selectedUser.personal.hireDate).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )
                    : "N/A"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Additional Information */}
        <div className="col-span-2 border border-gray-300 rounded-2xl shadow-lg p-6 w-full mt-4">
          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">Additional Information</h3>

          {/* Content */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Contact Details */}
            <div>
              {/* Header */}
              <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Details</h3>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {/* Email */}
                <div className="flex items-center gap-2">
                  <MdEmail className="text-gray-500 w-4 h-4" />
                  <p className="text-gray-600">{selectedUser?.credentials?.email || "N/A"}</p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <FaPhoneAlt className="text-gray-500 w-4 h-4" />
                  <p className="text-gray-600">{selectedUser?.personal?.phone || "N/A"}</p>
                </div>

                {/* Employee ID */}
                <div className="flex items-center gap-2">
                  <FaIdBadge className="text-gray-500 w-4 h-4" />
                  <p className="text-gray-600">{selectedUser?.personal?.userId || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Work Details */}
            <div>
              {/* Header */}
              <h3 className="text-sm font-medium text-gray-700 mb-2">Work Details</h3>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {/* Department */}
                <div className="flex items-center gap-2">
                  <FaBuilding className="text-gray-500 w-4 h-4" />
                  <p className="text-gray-600">
                    {selectedUser?.employment?.departmentId || "-"}
                  </p>
                </div>

                {/* Position */}
                <div className="flex items-center gap-2">
                  <FaBriefcase className="text-gray-500 w-4 h-4" />
                  <p className="text-gray-600">{selectedUser?.employment?.position || "-"}</p>
                </div>

                {/* Access Level */}
                <div className="flex items-center gap-2">
                  <FaUserShield className="text-gray-500 w-4 h-4" />
                  <p className="text-gray-600">{selectedUser?.employment?.role || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default View_User_Modal;