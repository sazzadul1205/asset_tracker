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
  const { data: session, status } = useSession();

  // Get Current Route
  const pathname = usePathname();

  // Fetch Asset Category Options
  const {
    data: MyUserData,
    error: MyUserError,
    refetch: MyUserRefetch,
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

  // Dynamic title based on route
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
    default:
      pageTitle = "Admin Dashboard";
  }


  return (
    <nav className="navbar bg-white shadow-2xl px-6 py-3 sticky top-0 z-50">
      {/* Left: Dynamic Page Title */}
      <div className="flex-1">
        <p className="text-xl font-bold text-gray-800 Roboto-slab-display">
          {pageTitle}
        </p>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-black">
          {/* User Avatar */}
          <div className="w-11 h-11 rounded-full ring ring-gray-200 ring-offset-2 overflow-hidden">
            {MyUserIsLoading ? (
              <div className="w-11 h-11 bg-gray-200 animate-pulse rounded-full" />
            ) : (
              <Image
                alt="User Avatar"
                src={User_Fallback}
                width={44}
                height={44}
                className="object-cover"
              />
            )}
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
                {/* User Name */}
                <h3 className="font-semibold">{MyUserData?.full_name || "John Doe"}</h3>
                {/* User Email & Role */}
                <p className="text-sm text-gray-600 font-medium">
                  {MyUserData?.email || "H2nBp@example.com"} ({MyUserData?.position || "Employee"})
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
