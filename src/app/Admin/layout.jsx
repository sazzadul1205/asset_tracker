// Admin/Layout
"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MdOutlineDashboard,
  MdLogout,
  MdPersonOutline,
} from "react-icons/md";
import Logo from "../../../public/Logo/Website_Logo.png";
import MyAssetsIcon from "../../../public/Icons/Admin/MyAssetsIcon";
import MyRequestsIcon from "../../../public/Icons/Admin/MyRequestsIcon";

const AdminLayout = ({ children }) => {
  const pathname = usePathname();

  // Main navigation items
  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdOutlineDashboard className="text-2xl" />,
      href: "/Admin/Dashboard",
    },
    {
      name: "My Assets",
      icon: <MyAssetsIcon className="w-5 h-5" />,
      href: "/Admin/MyAssets",
    },
    {
      name: "My Requests",
      icon: <MyRequestsIcon className="w-5 h-5" />,
      href: "/Admin/MyRequests",
    },
  ];

  // Bottom (profile/logout) items
  const bottomItems = [
    {
      name: "Profile",
      icon: <MdPersonOutline className="text-2xl" />,
      href: "/Admin/profile",
    },
    {
      name: "Logout",
      icon: <MdLogout className="text-2xl text-red-600" />,
      href: "/logout",
    },
  ];

  return (
    <div className="flex min-h-screen bg-linear-to-tr from-gray-100 via-white to-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-2xl border-r border-gray-100 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="mx-auto p-6 pb-4 border-b border-gray-100">
            <Image src={Logo} alt="SAT Logo" className="w-full h-auto" priority />
          </div>

          {/* Navigation */}
          <ul className="px-3 mt-4 space-y-1">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`flex items-center gap-4 px-4 py-2 text-gray-700 font-medium text-md rounded-xl cursor-pointer transition-colors
                  ${pathname === item.href
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-blue-50 hover:text-blue-600"
                  }`}
              >
                {item.icon}
                <p>{item.name}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <ul className="px-3 mb-4 space-y-1 border-t border-gray-100 pt-4">
          {bottomItems.map((item) => (
            <li
              key={item.name}
              className={`flex items-center gap-4 px-4 py-2 text-gray-700 font-medium text-lg rounded-xl cursor-pointer transition-colors
                ${item.name === "Logout"
                  ? "hover:bg-red-50 hover:text-red-600"
                  : "hover:bg-blue-50 hover:text-blue-600"
                }`}
            >
              {item.icon}
              <p>{item.name}</p>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
