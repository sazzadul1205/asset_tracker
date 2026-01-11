// app/employee/layout.jsx
"use client";

// React Components
import { useEffect, useState } from 'react';

// next components
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';


// Icons
import { BiGroup } from "react-icons/bi";
import { GrTransaction } from 'react-icons/gr';
import { MdOutlineDashboard, MdLogout, MdPersonOutline, MdClose, MdChevronRight, MdChevronLeft } from "react-icons/md";

// Assets - Logo
import Logo from "../../../public/Logo/Website_Logo.png";

// Assets - Icons
import MyAssetsIcon from "../../../public/Icons/Admin/MyAssetsIcon";
import MyRequestsIcon from "../../../public/Icons/Admin/MyRequestsIcon";

// Hooks
import useAuth from '@/hooks/useAuth';

// Components
import Navbar from '@/Shared/Navbar/Navbar';
import Footer from '@/Shared/Footer/Footer';


const ManagerLayout = ({ children }) => {
  const { logout } = useAuth();
  const pathname = usePathname();

  // Sidebar states
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Menu Items -- Top Menu
  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdOutlineDashboard className="text-xl" />,
      href: "/manager/dashboard",
    },
    {
      name: "My Assets",
      icon: <MyAssetsIcon className="w-5 h-5" />,
      href: "/manager/myAssets",
    },
    {
      name: "My Requests",
      icon: <MyRequestsIcon className="w-5 h-5" />,
      href: "/manager/myRequests",
    },
    {
      name: "Transactions",
      icon: <GrTransaction className="text-xl" />,
      href: "/manager/transactions",
    },
    {
      name: "My Employees",
      icon: <BiGroup className="text-xl" />,
      href: "/manager/myEmployees",
    },
  ];

  // Menu Items -- Bottom Menu
  const bottomItems = [
    {
      name: "Profile",
      icon: <MdPersonOutline className="text-xl" />,
      href: "/manager/profile",
    },
    {
      name: "Logout",
      icon: <MdLogout className="text-xl text-red-600" />,
      action: logout,
    },
  ];

  // Close drawer on mobile when clicking a link
  const handleMobileLinkClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Toggle sidebar width on desktop
  const toggleSidebarWidth = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };


  return (
    <SessionProvider>
      <div className="drawer lg:drawer-open">
        <input
          id="admin-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isMenuOpen}
          onChange={(e) => setIsMenuOpen(e.target.checked)}
        />

        {/* ================= MAIN CONTENT ================= */}
        <div className="drawer-content flex flex-col min-h-screen bg-linear-to-tr from-gray-100 via-white to-gray-200">
          {/* Navbar - Always visible */}
          <Navbar
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebarWidth={toggleSidebarWidth}
            setIsMenuOpen={setIsMenuOpen}
          />

          {/* Main content area */}
          <main className={`flex-1 overflow-y-auto transition-all duration-300
            }`}>
            {children}
          </main>

          <Footer />
        </div>

        {/* ================= SIDEBAR DRAWER ================= */}
        <div className="drawer-side z-50">
          <label
            htmlFor="admin-drawer"
            className="drawer-overlay"
            aria-label="Close sidebar"
          ></label>

          {/* Desktop Sidebar (hidden on mobile) */}
          <aside className={`hidden lg:flex flex-col justify-between min-h-screen bg-white shadow-2xl transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'
            }`}>
            {/* Top */}
            <div>
              {/* Logo and Toggle */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <Image
                  src={Logo}
                  alt="SAT Logo"
                  className={`transition-all duration-300 ${isSidebarCollapsed ? "w-10" : "w-full"
                    }`}
                  priority
                />
                {/* Desktop toggle button */}
                <button
                  onClick={toggleSidebarWidth}
                  className="p-2 rounded hover:bg-gray-100 transition-colors hidden lg:block"
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isSidebarCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                </button>
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
                      ${isSidebarCollapsed ? "justify-center" : ""}
                      `}
                      title={isSidebarCollapsed ? item.name : ""}
                    >
                      {item.icon}
                      {!isSidebarCollapsed && <span>{item.name}</span>}
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
                        ${isSidebarCollapsed ? "justify-center" : ""}`}
                        title={isSidebarCollapsed ? item.name : ""}
                      >
                        {item.icon}
                        {!isSidebarCollapsed && item.name}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors
                        ${pathname === item.href
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-gray-100"
                          }
                        ${isSidebarCollapsed ? "justify-center" : ""}`}
                        title={isSidebarCollapsed ? item.name : ""}
                      >
                        {item.icon}
                        {!isSidebarCollapsed && item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Mobile Drawer (shown on mobile) */}
          <aside className="w-64 min-h-screen bg-white shadow-2xl flex flex-col justify-between lg:hidden">
            {/* Top */}
            <div>
              {/* Logo and Close Button for Mobile */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <Image
                  src={Logo}
                  alt="SAT Logo"
                  className="w-full"
                  priority
                />
                {/* Close button for mobile only */}
                <label
                  htmlFor="admin-drawer"
                  className="btn btn-circle btn-ghost"
                  aria-label="Close sidebar"
                >
                  <MdClose className="text-xl" />
                </label>
              </div>

              {/* Menu */}
              <ul className="px-2 mt-4 space-y-1">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={handleMobileLinkClick}
                      className={`flex items-center gap-4 px-4 py-2 rounded-xl transition-colors font-semibold
                      ${pathname === item.href
                          ? "bg-blue-100 text-blue-600"
                          : "hover:bg-blue-50 hover:text-blue-600"
                        }
                      `}
                    >
                      {item.icon}
                      <span>{item.name}</span>
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
                        onClick={() => {
                          handleMobileLinkClick();
                          item.action();
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2 rounded-xl transition-colors
                        hover:bg-red-100 text-red-500`}
                      >
                        {item.icon}
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={handleMobileLinkClick}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors
                        ${pathname === item.href
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-gray-100"
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
        </div>
      </div>
    </SessionProvider>
  );
};

export default ManagerLayout;