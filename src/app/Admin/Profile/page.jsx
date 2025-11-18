// Admin/Profile/page.jsx
"use client";

// React Components
import React from 'react';

// Next Components
import { useSession } from 'next-auth/react';

// Icons
import {
  FaLock,
  FaRegUser,
  FaRegEdit,
  FaUserCheck,
} from 'react-icons/fa';
import {
  MdWork,
  MdLogin,
  MdPhone,
  MdBadge,
  MdEmail,
  MdApartment,
  MdAccessTime,
  MdCheckCircle,
  MdCalendarMonth,
  MdAdminPanelSettings,
} from 'react-icons/md';
import { CiUser } from "react-icons/ci";

// Tanstack
import { useQuery } from '@tanstack/react-query';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';

// Hooks
import useAxiosPublic from '@/Hooks/useAxiosPublic';
import UserDepartmentView from '@/Shared/TableExtension/UserDepartmentView';

const ProfilePage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();

  // Fetch User Data
  const {
    data: MyUserData,
    error: MyUserError,
    refetch: MyUserRefetch,
    isLoading: MyUserIsLoading,
  } = useQuery({
    queryKey: ["MyUserData", session?.user?.employee_id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/Users/${session?.user?.employee_id}`);
      return res.data ?? {}; // server returns raw user object
    },
    keepPreviousData: true,
    enabled: !!session?.user?.employee_id,
  });


  // Handle loading
  if (
    MyUserIsLoading ||
    status === "loading"
  ) {
    return <Loading />;
  }

  // Handle errors
  if (MyUserError) {
    return <Error errors={[MyUserError]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    MyUserRefetch();
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 flex items-center justify-between px-6 py-4 mx-2 mt-4 ">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Profile
          </h3>
        </div>

        {/* Right: Add Button */}
        <div className="flex items-center gap-3" >
          {/* Change Password Button */}
          <button
            className="gap-2 font-semibold text-black py-2 bg-white rounded-lg shadow-md 
            hover:bg-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
            active:translate-y-px active:shadow-md border border-gray-200" >
            <div className='flex items-center w-52 justify-between px-5' >
              <FaLock />
              Change Password
            </div>
          </button>

          {/* Edit Profile Button */}
          <button
            className="gap-2 font-semibold text-white  py-2 bg-blue-600 rounded-lg shadow-md 
            hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
            active:translate-y-px active:shadow-md" >
            {/*  */}
            <div className='flex items-center w-40 justify-between px-5' >
              <FaRegEdit />
              Edit Profile
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 bg-white gap-4 mx-2 p-6">

        {/* Personal Information */}
        <div className="border border-gray-300 rounded-2xl shadow-lg">
          {/* Header */}
          <div className="flex text-black items-center p-6 pb-3 gap-3">
            <FaRegUser className="text-xl" />
            <h3 className="font-semibold text-lg">Personal Information</h3>
          </div>

          {/* Content */}
          <div className="text-black p-6 pt-0 grid grid-cols-2 gap-3">

            {/* Full Name */}
            <div className="flex items-center space-x-3">
              <CiUser className="text-xl text-gray-500" />
              <div>
                <h3 className="text-sm font-medium">Full Name</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.full_name || "John Doe"}
                </p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-center space-x-3">
              <MdBadge className="text-xl text-gray-500" />
              <div>
                <h3 className="text-sm font-medium">Employee ID</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.employee_id || "123456789"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3">
              <MdEmail className="text-xl text-gray-500" />
              <div>
                <h3 className="text-sm font-medium">Email</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.email || "jdoe@ex.com"}
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center space-x-3">
              <MdPhone className="text-xl text-gray-500" />
              <div>
                <h3 className="text-sm font-medium">Phone Number</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.phone_number || "+8801917335945"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="border border-gray-300 rounded-2xl shadow-lg">
          {/* Header */}
          <div className="flex text-black items-center p-6 pb-3 gap-3">
            <MdApartment className="text-xl" />
            <h3 className="font-semibold text-lg">Work Information</h3>
          </div>

          {/* Content */}
          <div className="text-black p-6 pt-0 grid grid-cols-2 gap-3">

            {/* Department */}
            <div className="flex items-center space-x-3">
              <MdApartment className="text-xl text-gray-500 " />
              <div>
                <h3 className="text-sm font-medium">Department</h3>
                <p className="text-sm text-gray-600 truncate">
                  <UserDepartmentView
                    department={MyUserData?.department}
                  />
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-center space-x-3">
              <MdWork className="text-xl text-gray-500 " />
              <div>
                <h3 className="text-sm font-medium">Position</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.position || "-"}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center space-x-3">
              <MdAdminPanelSettings className="text-xl text-gray-500 " />
              <div>
                <h3 className="text-sm font-medium">Role</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.role || "-"}
                </p>
              </div>
            </div>

            {/* Hire Date */}
            <div className="flex items-center space-x-3">
              <MdCalendarMonth className="text-xl text-gray-500 " />
              <div>
                <h3 className="text-sm font-medium">Hire Date</h3>
                <p className="text-sm text-gray-600 truncate">
                  {formatDateTime(MyUserData?.hire_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="border border-gray-300 rounded-2xl shadow-lg">
          {/* Header */}
          <div className="flex text-black items-center p-6 pb-3 gap-3">
            <FaUserCheck className="text-xl" />
            <h3 className="font-semibold text-lg">Account Information</h3>
          </div>

          {/* Content */}
          <div className="text-black p-6 pt-0 grid grid-cols-1 gap-3">

            {/* Status */}
            <div className="flex items-center space-x-3">
              <MdCheckCircle className="text-xl text-gray-500 " />
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <p className="text-sm text-gray-600 truncate">
                  <span
                    className={`
                          inline-flex items-center justify-center w-24 py-1 rounded-xl text-sm font-semibold
                          ${MyUserData?.status === "active" ? "bg-green-100 text-green-700" : ""}
                          ${MyUserData?.status === "inactive" ? "bg-gray-200 text-gray-700" : ""}
                          ${MyUserData?.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${MyUserData?.status === "archived" ? "bg-red-100 text-red-700" : ""}
                          `}
                  >
                    {MyUserData?.status?.charAt(0).toUpperCase() + MyUserData?.status?.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-center space-x-3">
              <MdLogin className="text-xl text-gray-500 " />
              <div>
                <h3 className="text-sm font-medium">Last Login</h3>
                <p className="text-sm text-gray-600 truncate">
                  {formatDateTime(MyUserData?.last_login)}
                </p>
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-center space-x-3">
              <MdAccessTime className="text-xl text-gray-500 " />
              <div>
                <h3 className="text-sm font-medium">Account Created</h3>
                <p className="text-sm text-gray-600 truncate">
                  {formatDateTime(MyUserData?.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <dialog id="Change_Password_Modal" className="modal">
        <ChangePasswordModal MyUserData={MyUserData} />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default ProfilePage;

const formatDateTime = (isoString) => {
  if (!isoString) return "-";

  const date = new Date(isoString);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const amps = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // convert 0→12, 13→1 etc.

  return `${day} ${month} ${year} ${hours}:${minutes} ${amps}`;
};
