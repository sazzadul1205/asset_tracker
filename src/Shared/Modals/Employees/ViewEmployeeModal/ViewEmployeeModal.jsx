// React Components
import React from 'react';

// Next Components
import Image from 'next/image';

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
  FaCalendarCheck,
  FaSyncAlt,
  FaUserPlus,
} from "react-icons/fa";
import { MdEmail } from 'react-icons/md';

// Shared
import UserDepartmentView from '@/Shared/TableExtension/UserDepartmentView';

const ViewEmployeeModal = ({
  selectedEmployee,
  setSelectedEmployee,
}) => {

  // Handle Close
  const handleClose = () => {
    setSelectedEmployee(null);
    document.getElementById("View_Employee_Modal")?.close();
  };

  // Access Level Badge
  const accessLevelBadge = (level) => {
    const styles = {
      admin: "bg-red-100 text-red-700",
      manager: "bg-yellow-100 text-yellow-800",
      employee: "bg-blue-100 text-blue-700",
      intern: "bg-green-100 text-green-700",
      guest: "bg-gray-100 text-gray-700",
      supervisor: "bg-purple-100 text-purple-700",
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${styles[level] || "bg-gray-200 text-gray-800"}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  return (
    <div
      id="View_Employee_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon container */}
          <div
            className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-300 text-gray-800 font-bold text-lg"
            style={{ backgroundColor: selectedEmployee?.selectedColor || "#e2e8f0" }}
          >
            {selectedEmployee?.profile_image ? (
              <Image
                src={selectedEmployee?.profile_image}
                alt={selectedEmployee?.full_name}
                width={32}
                height={32}
                className="object-contain rounded-full"
              />
            ) : (
              <span>
                {selectedEmployee?.full_name
                  ?.trim()
                  ?.split(" ")
                  ?.map((w) => w[0])
                  ?.join("")
                  ?.substring(0, 2)
                  ?.toUpperCase() || "NA"}
              </span>
            )}
          </div>

          {/* Text content */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">
              {selectedEmployee?.full_name}
            </h3>
            <p className="text-gray-500 text-xs md:text-sm">
              {selectedEmployee?.email || "N/A"}
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
      <div className="grid grid-cols-2 gap-4 mt-4" >
        {/* Personal Information */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Personal Information
          </h3>

          {/* Content */}
          <div className="space-y-5">

            {/* Full Name */}
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Full Name</p>
                <p className='font-medium'>{selectedEmployee?.full_name || "N/A"}</p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-center gap-3">
              <MdEmail className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Email Address</p>
                <p className='font-medium'>{selectedEmployee?.email || "N/A"}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Phone Number</p>
                <p className='font-medium'>{selectedEmployee?.phone || "N/A"}</p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-center gap-3">
              <FaHashtag className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Employee ID</p>
                <p className='font-medium'>{selectedEmployee?.employee_id || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">
          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">
            Work Information
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Department */}
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">
                  <UserDepartmentView department={selectedEmployee?.department} />
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-center gap-3">
              <FaBriefcase className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{selectedEmployee?.position || "N/A"}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <FaUserShield className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Role:</p>
                <p>
                  {selectedEmployee?.access_level
                    ? accessLevelBadge(selectedEmployee.access_level)
                    : <span className="text-gray-500 text-sm">N/A</span>
                  }
                </p>
              </div>
            </div>

            {/* Hire Date */}
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Hire Date</p>
                <p className="font-medium">
                  {selectedEmployee?.hire_date
                    ? new Date(selectedEmployee.hire_date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">
          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">
            Account Status
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center gap-3">
              <FaUserCheck className="text-gray-500 w-5 h-5" /> {/* Icon matches status */}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {setSelectedEmployee?.department_status ? (
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${setSelectedEmployee.department_status === "Active"
                        ? "bg-green-100 text-green-800"
                        : setSelectedEmployee.department_status === "Inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {setSelectedEmployee.department_status}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-center gap-3">
              <FaIdBadge className="text-gray-500 w-5 h-5" /> {/* Icon matches employee ID */}
              <div>
                <p className='text-sm text-gray-500'>Employee ID</p>
                <p className='font-medium'>{selectedEmployee?.employee_id || "N/A"}</p>
              </div>
            </div>

            {/* Summary */}
            <div className='bg-gray-50 p-4 rounded-lg' >
              {/* Header */}
              <h4 className='text-sm font-medium text-gray-700 mb-2' >Account Summary </h4>

              {/* Content */}
              <div className='space-y-2 text-sm' >
                {/* Role */}
                <div className='flex justify-between items-center' >
                  <span className='text-gray-600 flex items-center gap-1'>
                    <FaBriefcase className="w-4 h-4" /> Role
                  </span>
                  <span className='font-medium' >
                    {selectedEmployee?.position || "N/A"}
                  </span>
                </div>

                {/* Status */}
                <div className='flex justify-between items-center' >
                  <span className='text-gray-600 flex items-center gap-1'>
                    <FaUserCheck className="w-4 h-4" /> Status
                  </span>
                  <span className='font-medium' >
                    {setSelectedEmployee?.department_status ? (
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${setSelectedEmployee?.department_status === "Active"
                          ? "bg-green-100 text-green-800"
                          : setSelectedEmployee?.department_status === "Inactive"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {setSelectedEmployee?.department_status}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </span>
                </div>

                {/* Department */}
                <div className='flex justify-between items-center' >
                  <span className='text-gray-600 flex items-center gap-1'>
                    <FaBuilding className="w-4 h-4" /> Department
                  </span>
                  <span className='font-medium' >
                    <UserDepartmentView department={selectedEmployee?.department} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border border-gray-300 rounded-2xl shadow-lg p-6">
          {/* Header */}
          <h3 className="font-semibold tracking-tight text-lg mb-4">
            Timeline
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Account Created */}
            <div className="flex items-center gap-3">
              <FaUserPlus className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className='font-medium'>
                  {selectedEmployee?.created_at
                    ? new Date(selectedEmployee.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-3">
              <FaSyncAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className='font-medium'>
                  {selectedEmployee?.updated_at
                    ? new Date(selectedEmployee.updated_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Hire Date */}
            <div className="flex items-center gap-3">
              <FaCalendarCheck className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Hire Date</p>
                <p className='font-medium'>
                  {selectedEmployee?.hire_date
                    ? new Date(selectedEmployee.hire_date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className='border border-gray-300 rounded-2xl shadow-lg p-6 w-full mt-4'>
        {/* Header */}
        <h3 className='font-semibold tracking-tight text-lg mb-4'>
          Additional Information
        </h3>

        {/* Content */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Contact Details */}
          <div>
            {/* Header */}
            <h3 className='text-sm font-medium text-gray-700 mb-2'>
              Contact Details
            </h3>

            {/* Content */}
            <div className='space-y-2 text-sm'>
              {/* Email */}
              <div className='flex items-center gap-2'>
                <MdEmail className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>{selectedEmployee?.email || "N/A"}</p>
              </div>

              {/* Phone */}
              <div className='flex items-center gap-2'>
                <FaPhoneAlt className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>{selectedEmployee?.phone || "N/A"}</p>
              </div>

              {/* Employee ID */}
              <div className='flex items-center gap-2'>
                <FaIdBadge className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>{selectedEmployee?.employee_id || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div>
            {/* Header */}
            <h3 className='text-sm font-medium text-gray-700 mb-2'>
              Work Details
            </h3>

            {/* Content */}
            <div className='space-y-2 text-sm'>
              {/* Department */}
              <div className='flex items-center gap-2'>
                <FaBuilding className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>
                  <UserDepartmentView department={selectedEmployee?.department} />
                </p>
              </div>

              {/* Position / Role */}
              <div className='flex items-center gap-2'>
                <FaBriefcase className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>{selectedEmployee?.position || "N/A"}</p>
              </div>

              {/* Access Level */}
              <div className='flex items-center gap-2'>
                <FaUserShield className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>
                  {selectedEmployee?.access_level
                    ? accessLevelBadge(selectedEmployee.access_level)
                    : <span className="text-gray-500 text-sm">N/A</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;