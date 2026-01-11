// src/app/admin/departments/View_Department_Modal/View_Department_Modal.jsx

// React Components
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Next Components
import Image from 'next/image';

// Icons
import { FiX, FiUsers, FiDollarSign, FiCalendar, FiInfo, FiBriefcase, FiUser, FiHome, FiTrendingUp } from 'react-icons/fi';
import {
  FaSignal,
  FaUserTag,
  FaUserTie,
  FaIdBadge,
  FaBuilding,
  FaMoneyBillWave,
  FaChartBar
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

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-yellow-100 text-yellow-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  // Calculate budget per employee
  const calculateBudgetPerEmployee = () => {
    const budget = Number(selectedDepartment?.stats?.budget?.$numberDecimal || 0);
    const employees = Number(selectedDepartment?.stats?.employeeCount || 0);

    if (employees === 0) return 0;
    return budget / employees;
  };

  return (
    <div
      id="View_Department_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 text-gray-900"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full">
          {/* Icon container */}
          <div
            className="shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: selectedDepartment?.info?.iconBgColor || "#e2e8f0" }}
          >
            <Image
              src={selectedDepartment?.info?.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
              alt={selectedDepartment?.info?.name || "Department Icon"}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
              <h3 className="font-bold text-gray-800 text-lg md:text-xl truncate">
                {selectedDepartment?.info?.name || "Department Name"}
              </h3>
              {selectedDepartment?.department_status && (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedDepartment.department_status)}`}>
                  {selectedDepartment.department_status.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm md:text-base">
              Department ID: {selectedDepartment?.departmentId || "N/A"}
            </p>
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

      {/* Department Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Employees</p>
              <p className="font-semibold text-lg">
                {selectedDepartment?.stats?.employeeCount || 0}
              </p>
            </div>
            <FiUsers className="text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Annual Budget</p>
              <p className="font-semibold text-lg">
                {formatCurrency(
                  selectedDepartment?.stats?.budget?.$numberDecimal,
                  { currency: "USD", compact: true }
                )}
              </p>
            </div>
            <FiDollarSign className="text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Budget per Employee</p>
              <p className="font-semibold text-lg">
                {formatCurrency(
                  calculateBudgetPerEmployee(),
                  { currency: "USD", compact: true }
                )}
              </p>
            </div>
            <FiUser className="text-purple-500" />
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Established</p>
              <p className="font-semibold text-sm">
                {selectedDepartment?.metadata?.createdAt
                  ? new Date(selectedDepartment.metadata.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "N/A"}
              </p>
            </div>
            <FiCalendar className="text-amber-500" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Basic Information */}
        <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6'>
          <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
            <span className="bg-blue-100 text-blue-600 w-2 h-5 rounded-full"></span>
            Basic Information
          </h3>

          <div className="space-y-4">
            {/* Department Id */}
            <div className="flex items-start gap-3">
              <FaIdBadge className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Department ID</p>
                <p className='font-medium text-gray-800 font-mono'>{selectedDepartment?.departmentId || "N/A"}</p>
              </div>
            </div>

            {/* Department Name */}
            <div className="flex items-start gap-3">
              <FaBuilding className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Department Name</p>
                <p className='font-medium text-gray-800'>{selectedDepartment?.info?.name || "N/A"}</p>
              </div>
            </div>

            {/* Department Description */}
            <div className="flex items-start gap-3">
              <FiInfo className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Description</p>
                <p className='font-medium text-gray-800'>{selectedDepartment?.info?.description || "No description provided"}</p>
              </div>
            </div>

            {/* Department Status */}
            <div className="flex items-start gap-3">
              <FaSignal className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getStatusColor(selectedDepartment?.department_status)}`}
                >
                  {selectedDepartment?.department_status?.toUpperCase() || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Management */}
        <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6'>
          <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
            <span className="bg-green-100 text-green-600 w-2 h-5 rounded-full"></span>
            Management
          </h3>

          <div className="space-y-6">
            {/* Manager */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                <FaUserTie className="text-blue-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Manager</p>
                <p className='font-medium text-gray-800 py-1'>
                  <UserId_To_Name userId={selectedDepartment?.manager?.userId} />
                </p>
                <p className='text-xs text-gray-400'>Department head responsible</p>
              </div>
            </div>

            {/* Employee Count */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-green-50 rounded-full">
                <FiUsers className="text-green-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Employee Count</p>
                <p className='font-medium text-gray-800 text-xl md:text-2xl py-1'>
                  {selectedDepartment?.stats?.employeeCount || 0}
                </p>
                <p className='text-xs text-gray-400'>Total team members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6'>
          <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
            <span className="bg-purple-100 text-purple-600 w-2 h-5 rounded-full"></span>
            Financial Details
          </h3>

          <div className="space-y-6">
            {/* Budget */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-purple-50 rounded-full">
                <FaMoneyBillWave className="text-purple-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Annual Budget</p>
                <p className='font-medium text-gray-800 text-xl md:text-2xl py-1'>
                  {formatCurrency(
                    selectedDepartment?.stats?.budget?.$numberDecimal,
                    { currency: "USD" }
                  )}
                </p>
                <p className='text-xs text-gray-400'>Allocated funds for the year</p>
              </div>
            </div>

            {/* Budget per Employee */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-amber-50 rounded-full">
                <FaUserTag className="text-amber-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Budget per Employee</p>
                <p className='font-medium text-gray-800 text-xl md:text-2xl py-1'>
                  {formatCurrency(
                    calculateBudgetPerEmployee(),
                    { currency: "USD" }
                  )}
                </p>
                <p className='text-xs text-gray-400'>Average allocation per team member</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6'>
          <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
            <span className="bg-amber-100 text-amber-600 w-2 h-5 rounded-full"></span>
            Timeline
          </h3>

          <div className="space-y-4">
            {/* Created Date & Time */}
            <div className="flex items-start gap-3">
              <FiCalendar className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Created Date & Time</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {formatDateTime(selectedDepartment?.metadata?.createdAt)}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-start gap-3">
              <FiCalendar className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className='text-sm text-gray-500'>Last Updated</p>
                <p className='font-medium text-gray-800 text-sm'>
                  {formatDateTime(selectedDepartment?.metadata?.updatedAt)}
                </p>
              </div>
            </div>

            {/* Department History */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
                <FaChartBar className="text-gray-400 w-4 h-4" />
                Department History
              </h4>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                  <span className='text-gray-600'>Established</span>
                  <span className='font-medium text-sm'>{formatDateTime(selectedDepartment?.metadata?.createdAt)}</span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                  <span className='text-gray-600'>Last Updated</span>
                  <span className='font-medium text-sm'>{formatDateTime(selectedDepartment?.metadata?.updatedAt)}</span>
                </div>
                <div className='flex justify-between items-center py-2'>
                  <span className='text-gray-600'>Department ID</span>
                  <span className='font-medium text-sm font-mono'>{selectedDepartment?.departmentId || "N/A"}</span>
                </div>
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
          {/* Department Details */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
              <FiHome className="text-gray-400 w-4 h-4" />
              Department Details
            </h3>

            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Department Name</p>
                <p className='font-medium text-gray-800'>{selectedDepartment?.info?.name || "N/A"}</p>
              </div>

              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Department ID</p>
                <p className='font-medium text-gray-800 text-sm font-mono'>
                  {selectedDepartment?.departmentId || "N/A"}
                </p>
              </div>

              <div className='flex justify-between items-center py-2'>
                <p className='text-sm text-gray-600'>Status</p>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDepartment?.department_status)}`}
                >
                  {selectedDepartment?.department_status?.toUpperCase() || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>

          {/* Management & Resources */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
              <FiBriefcase className="text-gray-400 w-4 h-4" />
              Management & Resources
            </h3>

            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Manager</p>
                <div className='text-right'>
                  <p className='font-medium text-gray-800 text-sm'>
                    <UserId_To_Name userId={selectedDepartment?.manager?.userId} />
                  </p>
                </div>
              </div>

              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <p className='text-sm text-gray-600'>Total Employees</p>
                <p className='font-medium text-gray-800'>{selectedDepartment?.stats?.employeeCount || 0}</p>
              </div>

              <div className='flex justify-between items-center py-2'>
                <p className='text-sm text-gray-600'>Annual Budget</p>
                <p className='font-medium text-gray-800'>
                  {formatCurrency(
                    selectedDepartment?.stats?.budget?.$numberDecimal,
                    { currency: "USD", compact: true }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Statistics - Full Width */}
      <div className='border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 w-full mt-4 md:mt-6'>
        <h3 className='font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2'>
          <span className="bg-teal-100 text-teal-600 w-2 h-5 rounded-full"></span>
          Department Statistics
        </h3>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
          {/* Total Employees */}
          <div className='p-4 bg-blue-50 rounded-lg border border-blue-100'>
            <div className='flex items-center justify-between mb-2'>
              <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                <FiUsers className="text-blue-500 w-4 h-4" />
              </div>
              <span className='text-2xl font-bold text-blue-800'>
                {selectedDepartment?.stats?.employeeCount || 0}
              </span>
            </div>
            <p className='text-sm text-blue-600 text-center'>Total Employees</p>
          </div>

          {/* Total Budget */}
          <div className='p-4 bg-green-50 rounded-lg border border-green-100'>
            <div className='flex items-center justify-between mb-2'>
              <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                <FiDollarSign className="text-green-500 w-4 h-4" />
              </div>
              <span className='text-lg font-bold text-green-800'>
                {formatCurrency(
                  selectedDepartment?.stats?.budget?.$numberDecimal,
                  { currency: "USD", compact: true }
                )}
              </span>
            </div>
            <p className='text-sm text-green-600 text-center'>Annual Budget</p>
          </div>

          {/* Budget Per Employee */}
          <div className='p-4 bg-purple-50 rounded-lg border border-purple-100 md:col-span-1 col-span-2'>
            <div className='flex items-center justify-between mb-2'>
              <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                <FaUserTag className="text-purple-500 w-4 h-4" />
              </div>
              <span className='text-lg font-bold text-purple-800'>
                {formatCurrency(
                  calculateBudgetPerEmployee(),
                  { currency: "USD", compact: true }
                )}
              </span>
            </div>
            <p className='text-sm text-purple-600 text-center'>Budget per Employee</p>
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

export default View_Department_Modal;