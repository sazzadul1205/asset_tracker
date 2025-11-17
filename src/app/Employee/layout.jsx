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

const EmployeeLayout = ({ children }) => {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-linear-to-tr from-gray-100 via-white to-gray-200">

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" >
          {children}
        </main >
      </div >
    </SessionProvider>
  );
};

export default EmployeeLayout;