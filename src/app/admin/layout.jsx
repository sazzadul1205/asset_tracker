// app/admin/layout.jsx
"use client";

// React Components
import { useState } from 'react';


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


  // Sidebar state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`fixed h-screen bg-white shadow-2xl flex flex-col justify-between
          transition-all duration-300
          ${isMenuOpen ? "w-20" : "w-64"}`}
        >
          {/* Top */}
          <div>
            {/* Logo */}
            <div className="p-6 border-b border-gray-100 flex justify-center">
              <Image
                src={Logo}
                alt="SAT Logo"
                className={`transition-all duration-300 ${isMenuOpen ? "w-10" : "w-full"
                  }`}
                priority
              />
            </div>

            {/* Menu */}
            <ul className="px-2 mt-4 space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-2 rounded-xl transition-colors font-semibold
                    ${pathname === item.href
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-blue-50 hover:text-blue-600"
                      }
                    ${isMenuOpen ? "justify-center" : ""}
                    `}
                  >
                    {item.icon}
                    {!isMenuOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom */}
          <ul className="px-2 mb-4 space-y-1 border-t border-gray-100 pt-4">
            {bottomItems.map((item) => {
              const isLogout = item.name === "Logout";

              return (
                <li key={item.name}>
                  {isLogout ? (
                    <button
                      onClick={item.action}
                      className={`flex items-center gap-3 w-full px-4 py-2 rounded-xl transition-colors
                      hover:bg-red-100 text-red-500
                      ${isMenuOpen ? "justify-center" : ""}`}
                    >
                      {item.icon}
                      {!isMenuOpen && item.name}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors
                      ${pathname === item.href
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                        }
                      ${isMenuOpen ? "justify-center" : ""}`}
                    >
                      {item.icon}
                      {!isMenuOpen && item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ================= MAIN ================= */}
        <main
          className={`flex-1 flex flex-col transition-all duration-300
          ${isMenuOpen ? "ml-20" : "ml-64"}`}
        >
          <Navbar
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>

          <Footer />
        </main>
      </div>
    </SessionProvider>
  );
};

export default AdminLayout;