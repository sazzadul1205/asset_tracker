// src/app/admin/profile/page.jsx
"use client";

// React Components
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Next Components
import { useSession } from 'next-auth/react';

// Date Fns
import { format, parseISO } from "date-fns";

// Icons
import {
  FaEdit,
  FaRegUser,
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
import { IoLockClosedOutline } from "react-icons/io5";


// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Modals
import Change_Password_Modal from './Change_Password_Modal/Change_Password_Modal';
import Edit_My_Profile_Modal from './Edit_My_Profile_Modal/Edit_My_Profile_Modal';

const ProfilePage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // Fetch current user data
  const {
    data: MyUserData,
    error: MyUserError,
    refetch: MyUserRefetch,
    isLoading: MyUserIsLoading,
  } = useQuery({
    queryKey: ["MyUserData", session?.user?.userId],
    queryFn: async () => {
      try {
        const res = await axiosPublic.get(`/users/${session?.user?.userId} `);
        return res.data.data;
      } catch (err) {
        console.error(
          "[Axios Public] Error fetching user:",
          err.response?.status,
          err.response?.data
        );
        throw err;
      }
    },
    enabled: !!session?.user?.userId,
  });

  // Handle loading
  if (status === "loading" || MyUserIsLoading) return <Loading />;

  // Handle errors
  if (MyUserError) return <Error errors={[MyUserError]} />;

  return (
    <div>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-t flex items-center justify-between px-6 py-4 mx-2 mt-4">

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800">
          Profile
        </h3>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {/* Change Password */}
          <Shared_Button
            variant="ghost"
            onClick={() => document.getElementById("Change_Password_Modal")?.showModal()}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <IoLockClosedOutline className="inline-block mr-2" />
            Change Password
          </Shared_Button>

          {/* Edit Profile */}
          <Shared_Button
            variant="primary"
            onClick={() => document.getElementById("Edit_My_Profile_Modal")?.showModal()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <FaEdit className="inline-block mr-2" />
            Edit Profile
          </Shared_Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 bg-white border border-gray-200 rounded-b gap-4 mx-2 p-6">

        {/* Personal Information */}
        <div className="border border-gray-300 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex text-black items-center p-6 pb-3 gap-3">
            <FaRegUser className="text-xl" />
            <h3 className="font-semibold text-lg">Personal Information</h3>
          </div>

          {/* Content */}
          <div className="text-black p-6 pt-0 grid grid-cols-2 gap-3 space-y-2">

            {/* Full Name */}
            <div className="flex items-center space-x-3">
              <CiUser className="text-xl text-gray-500" />
              <div className='min-w-0'  >
                <h3 className="text-sm font-medium text-gray-900">Full Name</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.personal?.name ?? "John Doe"}
                </p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-center space-x-3">
              <MdBadge className="text-xl text-gray-500" />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Employee ID</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.personal?.userId ?? "12345"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3">
              <MdEmail className="text-xl text-gray-500" />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Email Address</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.credentials?.email ?? "johndoe@co.com"}
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center space-x-3">
              <MdPhone className="text-xl text-gray-500" />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Phone Number</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.personal?.phone ?? "+880123456789"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="border border-gray-300 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex text-black items-center p-6 pb-3 gap-3">
            <MdApartment className="text-xl" />
            <h3 className="font-semibold text-lg">Work Information</h3>
          </div>

          {/* Content */}
          <div className="text-black p-6 pt-0 grid grid-cols-2 gap-3 space-y-2">

            {/* Department */}
            <div className="flex items-center space-x-3">
              <MdApartment className="text-xl text-gray-500 " />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Department</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.employment?.departmentId ?? "-"}
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-center space-x-3">
              <MdWork className="text-xl text-gray-500 " />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Position</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.employment?.position ?? "-"}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center space-x-3">
              <MdAdminPanelSettings className="text-xl text-gray-500 " />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Role</h3>
                <div className="flex gap-2 mt-1">
                  {(() => {
                    const role = MyUserData?.employment?.role ?? "-";
                    let badgeColor = "";

                    switch (role) {
                      case "Employee":
                        badgeColor = "bg-blue-100 text-blue-800";
                        break;
                      case "Manager":
                        badgeColor = "bg-yellow-100 text-yellow-800";
                        break;
                      case "Admin":
                        badgeColor = "bg-red-100 text-red-800";
                        break;
                      default:
                        badgeColor = "bg-gray-100 text-gray-800";
                    }

                    return (
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}
                      >
                        {role}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Hire Date */}
            <div className="flex items-center space-x-3">
              <MdCalendarMonth className="text-xl text-gray-500 " />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Hire Date</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.personal?.hireDate
                    ? format(parseISO(MyUserData.personal.hireDate), "dd MMM yyyy")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="border border-gray-300 rounded-lg shadow-lg">
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
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Status</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(() => {
                    const status = MyUserData?.personal?.status ?? "-";
                    let badgeColor = "bg-gray-100 text-gray-800";

                    switch (status.toLowerCase()) {
                      case "active":
                        badgeColor = "bg-green-100 text-green-700";
                        break;
                      case "inactive":
                        badgeColor = "bg-gray-200 text-gray-700";
                        break;
                      case "pending":
                        badgeColor = "bg-yellow-100 text-yellow-700";
                        break;
                      case "archived":
                        badgeColor = "bg-red-100 text-red-700";
                        break;
                    }

                    return (
                      <div className={`inline-flex items-center justify-center w-24 py-1 rounded-xl text-sm font-semibold ${badgeColor}`}>
                        {status}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-center space-x-3">
              <MdLogin className="text-xl text-gray-500 " />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Last Login</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.credentials?.lastLogin
                    ? format(parseISO(MyUserData.credentials.lastLogin), "dd MMM yyyy hh:mm a")
                    : "-"}
                </p>
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-center space-x-3">
              <MdAccessTime className="text-xl text-gray-500 " />
              <div className='min-w-0' >
                <h3 className="text-sm font-medium text-gray-900">Account Created</h3>
                <p className="text-sm text-gray-600 truncate">
                  {MyUserData?.metadata?.createdAt
                    ? format(parseISO(MyUserData.metadata?.createdAt), "dd MMM yyyy hh:mm a")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <dialog id="Change_Password_Modal" className="modal">
        <Change_Password_Modal session={session} />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit My Profile Modal */}
      <dialog id="Edit_My_Profile_Modal" className="modal">
        <Edit_My_Profile_Modal
          session={session}
          MyUserData={MyUserData}
          MyUserRefetch={MyUserRefetch}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default ProfilePage;