// React Components
import React from "react";

// Next Components
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// Packages
import { useQuery } from "@tanstack/react-query";

// Assets
import User_Fallback from "../../../public/UserFallback.png";

// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const Navbar = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session } = useSession();

  const pathname = usePathname();

  // Fetch current user data
  const {
    data: MyUserData,
    error: MyUserError,
    isLoading: MyUserIsLoading,
  } = useQuery({
    queryKey: ["MyUserData", session?.user?.employee_id],
    queryFn: () =>
      axiosPublic
        .get(`/Users/${session?.user?.employee_id}`)
        .then((res) => res.data),
    keepPreviousData: true,
    enabled: !!session?.user?.employee_id,
  });

  // Dynamic page title
  let pageTitle = "Admin Dashboard";
  switch (pathname) {
    case "/Admin/AssetsCategory":
      pageTitle = "Admin Assets Category";
      break;
    case "/Admin/MyAssets":
      pageTitle = "Admin My Assets";
      break;
    case "/Admin/Employees":
      pageTitle = "Admin Employees";
      break;
    case "/Admin/Departments":
      pageTitle = "Admin Departments";
      break;
    case "/Admin/CompanySettings":
      pageTitle = "Company Settings";
      break;
    case "/Admin/MyRequests":
      pageTitle = "My Requests";
      break;
    case "/Admin/Assets":
      pageTitle = "All Assets";
      break;
    case "/Admin/Transactions":
      pageTitle = "Transactions";
      break;
    case "/Admin/Profile":
      pageTitle = "Admin Profile";
      break;
    case "/Employee/Dashboard":
      pageTitle = "Employee Dashboard";
      break;
    case "/Employee/MyRequests":
      pageTitle = "My Requests";
      break;
    case "/Employee/MyAssets":
      pageTitle = "My Assets";
      break;
    default:
      pageTitle = "Unknown Page";
  }

  return (
    <nav className="navbar bg-white shadow-2xl px-6 py-3 sticky top-0 z-50">
      {/* Left: Page Title */}
      <div className="flex-1">
        <p className="text-xl font-bold text-gray-800 Roboto-slab-display">{pageTitle}</p>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-black">
          {/* User Avatar */}
          <div
            className="w-11 h-11 rounded-full ring ring-gray-200 ring-offset-2 flex 
          items-center justify-center bg-gray-300 text-gray-800 font-bold"
          >
            {MyUserIsLoading
              ? <div className="w-11 h-11 bg-gray-200 animate-pulse rounded-full" />
              : (MyUserData?.identity?.full_name
                ?.trim()
                ?.split(" ")
                ?.map((w) => w[0])
                ?.join("")
                ?.substring(0, 2)
                ?.toUpperCase() || "NA")
            }
          </div>


          {/* User Details */}
          <div className="border-l-2 pl-3 border-gray-300">
            {MyUserIsLoading ? (
              <div className="flex items-center animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-200" />
                <div className="ml-3 space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            ) : MyUserError ? (
              <p className="text-red-500 text-sm">Failed to load user</p>
            ) : (
              <>
                <h3 className="font-semibold">{MyUserData?.identity?.full_name || "Unknown User"}</h3>
                <p className="text-sm text-gray-600 font-medium">
                  {MyUserData?.identity?.email || "Unknown Email"} ({MyUserData?.contact?.position || "-"})
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
