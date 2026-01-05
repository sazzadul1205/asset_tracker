// app/admin/layout.jsx
"use client";

// next components
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';


// Icons
import {
  MdOutlineDashboard, MdLogout, MdPersonOutline,
} from "react-icons/md";
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

// Hooks
import useAuth from '@/hooks/useAuth';

// Components
import Navbar from '@/Shared/Navbar/Navbar';
import Footer from '@/Shared/Footer/Footer';


const AdminLayout = ({ children }) => {
  // Hooks
  const { logout } = useAuth();
  const pathname = usePathname();

  // Menu Items -- Top Menu
  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdOutlineDashboard className="text-xl" />,
      href: "/admin/dashboard",
    },
    {
      name: "My Assets",
      icon: <MyAssetsIcon className="w-5 h-5" />,
      href: "/admin/myAssets",
    },
    {
      name: "My Requests",
      icon: <MyRequestsIcon className="w-5 h-5" />,
      href: "/admin/myRequests",
    },
    {
      name: "Assets",
      icon: <FaBox className="text-xl" />,
      href: "/admin/assets",
    },
    {
      name: "Asset Categories",
      icon: <FaInbox className="text-xl" />,
      href: "/admin/assetsCategories",
    },
    {
      name: "Transactions",
      icon: <GrTransaction className="text-xl" />,
      href: "/admin/transactions",
    },
    {
      name: "Employees",
      icon: <EmployeesIcon className="w-5 h-5" />,
      href: "/admin/employees",
    },
    {
      name: "Departments",
      icon: <DepartmentIcon className="w-5 h-5" />,
      href: "/admin/departments",
    },
    {
      name: "Company Settings",
      icon: <CompanySettingsIcon className="w-5 h-5" />,
      href: "/admin/companySettings",
    },
  ];

  // Menu Items -- Bottom Menu
  const bottomItems = [
    {
      name: "Profile",
      icon: <MdPersonOutline className="text-xl" />,
      href: "/admin/profile",
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
        {/* Sidebar - Fixed Position */}
        <aside className="w-64 bg-white shadow-2xl border-r border-gray-100 flex flex-col justify-between fixed h-screen overflow-y-auto">
          {/* Top Section */}
          <div>
            {/* Logo */}
            <div className="mx-auto p-6 pb-4 border-b border-gray-100">
              <Image
                src={Logo}
                alt="SAT Logo"
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Navigation */}
            <ul className="px-3 mt-4 space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-2 font-medium text-md rounded-xl cursor-pointer transition-colors
                ${pathname === item.href
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-blue-50 hover:text-blue-600"
                      }`}
                  >
                    {item.icon}
                    <p>{item.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Section */}
          <ul className="px-3 mb-4 space-y-1 border-t border-gray-100 pt-4">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const isLogout = item.name === "Logout";

              return (
                <li key={item.name}>
                  {isLogout ? (
                    // Logout Button
                    <button
                      onClick={item.action}
                      className="flex items-center gap-3 w-full text-left rounded-xl py-2.5 px-3 transition-colors text-red-500 hover:text-red-700 hover:bg-red-100 cursor-pointer"
                    >
                      {item.icon}
                      {item.name}
                    </button>
                  ) : (
                    // Normal Link Navigation
                    <Link
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
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main Content - Offset by sidebar width */}
        <main className="flex-1 flex flex-col overflow-hidden ml-64">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto relative">
            {children}
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </SessionProvider>
  );
};

export default AdminLayout;