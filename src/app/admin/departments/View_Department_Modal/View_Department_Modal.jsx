// src/app/admin/departments/View_Department_Modal/View_Department_Modal.jsx

// React Components
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Next Components
import Image from 'next/image';

// Icons
import { ImCross } from 'react-icons/im';
import {
  FaUsers,
  FaSignal,
  FaUserTag,
  FaUserTie,
  FaIdBadge,
  FaBuilding,
  FaInfoCircle,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

// Hooks
import UserId_To_Name from '../UserId_To_Name/UserId_To_Name';

// Utils
import formatCurrency from '@/Utils/formatCurrency';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';
import Loading from '@/Shared/Loading/Loading';
import Error from '@/Shared/Error/Error';

const View_Department_Modal = ({
  selectedDepartment,
  setSelectedDepartment,
}) => {
  const axiosPublic = useAxiosPublic();

  // Fetch User Count
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["DepartmentEmployeeCount", selectedDepartment?.departmentId],
    queryFn: async () => {
      const res = await axiosPublic.get(
        `/users/CountEmployee/${selectedDepartment.departmentId}`
      );
      return res.data;
    },
    enabled: !!selectedDepartment?.departmentId,
  });

  // Update selectedDepartment.stats.employeeCount when data arrives
  useEffect(() => {
    if (data?.employeeCount && selectedDepartment?.stats?.employeeCount !== data.employeeCount) {
      setSelectedDepartment(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          employeeCount: data.employeeCount,
        },
      }));
    }
  }, [data?.employeeCount, selectedDepartment?.stats?.employeeCount, setSelectedDepartment]);


  // Close Modal
  const handleClose = () => {
    setSelectedDepartment(null);
    document.getElementById("View_Department_Modal")?.close();
  }

  // Handle Loading
  if (isLoading) return <Loading variant="modal" message="Loading..." subText="Please wait while we get your department data." />;

  // Handle Error
  if (isError) return <Error variant="modal" message={data?.message || "Failed to load department data."} />;

  // Handle no selected department
  if (!selectedDepartment) return null;

  return (
    <div
      id="View_Department_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon container */}
          <div
            className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: selectedDepartment?.info?.iconBgColor || "#e2e8f0" }}
          >
            <Image
              src={selectedDepartment?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
              alt={selectedDepartment?.info?.name || "Department Icon"}
              width={32} // 8 * 4 = 32px (matches w-8)
              height={32} // matches h-8
              className="object-contain"
            />
          </div>

          {/* Text content */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">
              {selectedDepartment?.info?.name || "Category Name"}
            </h3>
            <p className="text-gray-500 text-xs md:text-sm">
              Department ID: {selectedDepartment?.departmentId || "N/A"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300 cursor-pointer"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Basic Information */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Basic Information
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Department Id */}
            <div className="flex items-center gap-3">
              <FaIdBadge className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Department Id</p>
                <p className='font-medium'># {selectedDepartment?.departmentId || "N/A"}</p>
              </div>
            </div>

            {/* Department Name */}
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Department Name</p>
                <p className='font-medium'>{selectedDepartment?.info?.name || "N/A"}</p>
              </div>
            </div>

            {/* Department Description */}
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Department Description</p>
                <p className='font-medium'>{selectedDepartment?.info?.description || "N/A"}</p>
              </div>
            </div>

            {/* Department Status */}
            <div className="flex items-center gap-3">
              <FaSignal className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Department Status</p>
                {selectedDepartment?.department_status ? (
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${selectedDepartment.department_status === "Active"
                      ? "bg-green-100 text-green-800"
                      : selectedDepartment.department_status === "Inactive"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {selectedDepartment.department_status}
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Management */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Management
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Manager */}
            <div className="flex items-center gap-3">
              <FaUserTie className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Manager</p>
                <p className="font-medium">
                  <UserId_To_Name userId={selectedDepartment?.manager?.userId} />
                </p>
              </div>
            </div>

            {/* Employee Count */}
            <div className="flex items-center gap-3">
              <FaUsers className="text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Employee Count</p>
                <p className="font-medium">
                  {selectedDepartment?.stats?.employeeCount || "0"}
                </p>
                <p className="text-xs text-gray-400">Total employees in department</p>
              </div>
            </div>

            {/* Department Summary */}
            <div className='bg-gray-50 p-4 rounded-lg' >
              {/* Header */}
              <h2 className='text-sm font-medium text-gray-700 mb-2'>
                Department Summary
              </h2>

              {/* Content */}
              <div className='space-y-2 text-sm' >
                {/* Manager */}
                <div className='flex justify-between' >
                  <span className='text-gray-600' >
                    Manager
                  </span>
                  <span className='font-medium' >
                    <UserId_To_Name userId={selectedDepartment?.manager?.userId} />
                  </span>
                </div>

                {/* Employee */}
                <div className='flex justify-between' >
                  <span className='text-gray-600' >
                    Employee
                  </span>
                  <span className='font-medium' >
                    {selectedDepartment?.stats?.employeeCount || "0"}
                  </span>
                </div>

                {/* Status */}
                <div className='flex justify-between' >
                  <span className='text-gray-600' >
                    Status
                  </span>
                  {selectedDepartment?.department_status ? (
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${selectedDepartment.department_status === "Active"
                        ? "bg-green-100 text-green-800"
                        : selectedDepartment.department_status === "Inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {selectedDepartment.department_status}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Financial Details
          </h3>

          {/* Budget */}
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-gray-500 w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-medium">
                {formatCurrency(
                  selectedDepartment?.stats?.budget?.$numberDecimal,
                  { currency: "USD" }
                )}
              </p>
              <p className="text-xs text-gray-400">Annual department budget</p>
            </div>
          </div>

        </div>


        {/* Timeline */}
        <div className='border border-gray-300 rounded-2xl shadow-lg p-6'>
          {/* Header */}
          <h3 className='font-semibold tracking-tight text-lg mb-4'>
            Timeline
          </h3>

          {/* Content */}
          <div className="space-y-5">
            {/* Created Date & Time */}
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-500 w-5 h-5" />
              <div>
                <p className='text-sm text-gray-500'>Created Date & Time</p>
                <p className='font-medium'>
                  {selectedDepartment?.metadata?.createdAt
                    ? new Date(selectedDepartment?.metadata?.createdAt).toLocaleString("en-GB", {
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

          {/* Department History */}
          <div className='bg-gray-50 p-4 rounded-lg' >
            {/* Header */}
            <h2 className='text-sm font-medium text-gray-700 mb-2'>
              Department History
            </h2>

            {/* Content */}
            <div className='space-y-2 text-sm' >
              {/* Established */}
              <div className='flex justify-between' >
                <span className='text-gray-600' >
                  Established
                </span>
                <span className='text-xs font-medium' >
                  {selectedDepartment?.metadata?.createdAt
                    ? new Date(selectedDepartment?.metadata?.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </span>
              </div>

              {/* Updated */}
              <div className='flex justify-between' >
                <span className='text-gray-600' >
                  Updated
                </span>
                <span className='text-xs font-medium' >
                  {selectedDepartment?.metadata?.updatedAt
                    ? new Date(selectedDepartment?.metadata?.updatedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).replace(",", "").toUpperCase()
                    : "N/A"}
                </span>
              </div>

              {/* Department ID */}
              <div className='flex justify-between' >
                <span className='text-gray-600' >
                  Department ID
                </span>
                <span className='text-xs font-medium' >
                  {selectedDepartment?.departmentId || "N/A"}
                </span>
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
        <div className="grid grid-cols-2 gap-4 mt-4" >
          {/* Category Settings */}
          <div>
            {/* Header */}
            <h3 className='text-sm font-medium text-gray-700 mb-2' >
              Department Details
            </h3>

            {/* Content */}
            <div className='space-y-2 text-sm' >
              {/* Department Name */}
              <div className='flex items-center gap-2' >
                <FaBuilding className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>{selectedDepartment?.info?.name || "N/A"}</p>
              </div>

              {/* Description */}
              <div className="flex items-center gap-2 max-w-full">
                <FaInfoCircle className="text-gray-500 w-4 h-4 shrink-0" />
                <p className="text-gray-600 truncate">
                  {selectedDepartment?.info?.description || "N/A"}
                </p>
              </div>


              {/* Department ID */}
              <div className='flex items-center gap-2' >
                <FaIdBadge className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'># {selectedDepartment?.departmentId || "N/A"}</p>
              </div>

            </div>
          </div>

          {/* Management */}
          <div>
            {/* Header */}
            <h3 className='text-sm font-medium text-gray-700 mb-2' >
              Management & Resources
            </h3>

            {/* Content */}
            <div className='space-y-2 text-sm' >
              {/* Manager */}
              <div className='flex items-center gap-2' >
                <FaUserTie className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>
                  <UserId_To_Name userId={selectedDepartment?.manager?.userId} />
                </p>
              </div>

              {/* Employees */}
              <div className='flex items-center gap-2' >
                <FaUsers className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>
                  {selectedDepartment?.stats?.employeeCount || "0"}
                </p>
              </div>

              {/* Budget */}
              <div className='flex items-center gap-2' >
                <FaMoneyBillWave className="text-gray-500 w-4 h-4" />
                <p className='text-gray-600'>
                  {formatCurrency(
                    selectedDepartment?.stats?.budget?.$numberDecimal,
                    { currency: "USD" }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className='border border-gray-300 rounded-2xl shadow-lg p-6 w-full mt-4'>
        {/* Header */}
        <h3 className='font-semibold tracking-tight text-lg mb-4'>
          Department Statistics
        </h3>

        {/* Content */}
        <div className='grid grid-cols-3 gap-4'>

          {/* Total Employees */}
          <div className='text-center p-4 bg-blue-50 rounded-lg'>
            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2'>
              <FaUsers className="text-blue-500 w-5 h-5" />
            </div>
            <p className='text-2xl font-bold text-blue-800'>
              {selectedDepartment?.stats?.employeeCount || 0}
            </p>
            <p className='text-sm text-blue-600'>Total employees in department</p>
          </div>

          {/* Total Budget */}
          <div className='text-center p-4 bg-green-50 rounded-lg'>
            <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
              <FaMoneyBillWave className="text-green-500 w-5 h-5" />
            </div>
            <p className='text-2xl font-bold text-green-800'>
              {formatCurrency(
                selectedDepartment?.stats?.budget?.$numberDecimal,
                { currency: "USD" }
              )}
            </p>
            <p className='text-sm text-green-600'>Annual Budget</p>
          </div>

          {/* Budget Per Employee */}
          <div className='text-center p-4 bg-purple-50 rounded-lg'>
            <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2'>
              <FaUserTag className="text-purple-500 w-5 h-5" />
            </div>
            <p className='text-2xl font-bold text-purple-800'>
              {formatCurrency(
                selectedDepartment?.stats?.budget?.$numberDecimal &&
                  selectedDepartment?.stats?.employeeCount > 0
                  ? Number(selectedDepartment.stats.budget.$numberDecimal) /
                  Number(selectedDepartment.stats.employeeCount)
                  : 0,
                { currency: "USD" }
              )}
            </p>
            <p className='text-sm text-purple-600'>Budget per employee</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default View_Department_Modal;