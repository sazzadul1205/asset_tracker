// Admin/Layout
"use client";

// React Components
import React from "react";

// Next Components
import Image from "next/image";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  MdOutlineDashboard,
  MdLogout,
  MdPersonOutline,
} from "react-icons/md";

// Icons
import { FaBox, FaInbox } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";

// Assets - Logo
import Logo from "../../../public/Logo/Website_Logo.png";

// Assets - Icons
import MyAssetsIcon from "../../../public/Icons/Admin/MyAssetsIcon";
import EmployeesIcon from "../../../public/Icons/Admin/EmployeesIcon";
import DepartmentIcon from "../../../public/Icons/Admin/DepartmentIcon";
import MyRequestsIcon from "../../../public/Icons/Admin/MyRequestsIcon";
import CompanySettingsIcon from "../../../public/Icons/Admin/CompanySettingsIcon";

// Shared Components
import Navbar from "@/Shared/Navbar/Navbar";

// Hooks
import { useAuth } from "@/Hooks/useAuth";

const AdminLayout = ({ children }) => {
  // Hooks
  const { logout } = useAuth();
  const pathname = usePathname();


  // Menu Items -- Top Menu
  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdOutlineDashboard className="text-xl" />,
      href: "/Admin/Dashboard"
    },
    {
      name: "My Assets",
      icon: <MyAssetsIcon className="w-5 h-5" />,
      href: "/Admin/MyAssets"
    },
    {
      name: "My Requests",
      icon: <MyRequestsIcon className="w-5 h-5" />,
      href: "/Admin/MyRequests"
    },
    {
      name: "Assets",
      icon: <FaBox className="text-xl" />,
      href: "/Admin/Assets"
    },
    {
      name: "Asset Category",
      icon: <FaInbox className="text-xl" />,
      href: "/Admin/AssetsCategory"
    },
    {
      name: "Transactions",
      icon: <GrTransaction className="text-xl" />,
      href: "/Admin/Transactions"
    },
    {
      name: "Employees",
      icon: <EmployeesIcon className="w-5 h-5" />,
      href: "/Admin/Employees"
    },
    {
      name: "Departments",
      icon: <DepartmentIcon className="w-5 h-5" />,
      href: "/Admin/Departments"
    },
    {
      name: "Company Settings",
      icon: <CompanySettingsIcon className="w-5 h-5" />,
      href: "/Admin/CompanySettings"
    },
  ];

  // Menu Items -- Bottom Menu
  const bottomItems = [
    {
      name: "Profile",
      icon: <MdPersonOutline className="text-xl" />,
      href: "/Admin/Profile"
    },
    {
      name: "Logout",
      icon: <MdLogout className="text-xl text-red-600" />,
      action: logout,
    },
  ];

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-linear-to-tr from-gray-100 via-white to-gray-200">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-2xl border-r border-gray-100 flex flex-col justify-between">
          {/* Top Section */}
          <div>
            {/* Logo */}
            <div className="mx-auto p-6 pb-4 border-b border-gray-100">
              <Image src={Logo} alt="SAT Logo" className="w-full h-auto" priority />
            </div>

            {/* Navigation */}
            <ul className="px-3 mt-4 space-y-1">
              {menuItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <li
                    className={`flex items-center gap-4 px-4 py-2 text-gray-700 font-medium text-md rounded-xl cursor-pointer transition-colors
                    ${pathname === item.href
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-blue-50 hover:text-blue-600"
                      }`}
                  >
                    {item.icon}
                    <p>{item.name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </div>

          {/* Bottom Section */}
          <ul className="px-3 mb-4 space-y-1 border-t border-gray-100 pt-4">
            {bottomItems?.map((item) => {
              const isActive = pathname === item.href;
              const isLogout = item.name === "Logout";

              return isLogout ? (
                // Logout Button
                <li
                  key={item.name}
                  onClick={item.action}
                  className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5 px-3 transition-colors text-red-500 hover:text-red-700 hover:bg-red-100"
                >
                  {item.icon}
                  {item.name}
                </li>
              ) : (
                // Normal Link Navigation
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl py-2.5 px-3 transition-colors 
                    ${isActive
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Navbar />
          {children}
        </main>
      </div>
    </SessionProvider>
  );
};

export default AdminLayout;
