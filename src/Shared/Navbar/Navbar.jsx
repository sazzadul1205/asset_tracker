// Shared/Navbar/Navbar.jsx
"use client";

// React
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// Next Auth
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

const Navbar = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session } = useSession();

  const pathname = usePathname();


  // Convert path to title: /admin/companySettings -> Company Settings
  const pageTitle = useMemo(() => {
    if (!pathname) return "Dashboard";

    // remove empty parts
    const parts = pathname.split("/").filter(Boolean);

    // get last part
    const lastPart = parts[parts.length - 1];

    // Convert camelCase or kebab-case to Title Case
    const title = lastPart
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return title || "Dashboard";
  }, [pathname]);

  // Fetch current user data
  const {
    data: MyUserData,
    error: MyUserError,
    isLoading: MyUserIsLoading,
  } = useQuery({
    queryKey: ["MyUserData", session?.user?.userId],
    queryFn: async () => {
      try {
        const res = await axiosPublic.get(`/users/${session?.user?.userId}`);
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

  // Compute initials for avatar
  const getUserInitials = (fullName) => {
    if (!fullName) return "NA";
    return fullName
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Page Title */}
        <h1 className="text-xl font-bold text-gray-800 Roboto-slab-display">
          {pageTitle}
        </h1>

        {/* Right: User Info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {MyUserIsLoading ? (
            <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <div className="w-11 h-11 rounded-full ring ring-gray-200 ring-offset-2 flex items-center justify-center bg-gray-300 text-gray-800 font-bold select-none">
              {getUserInitials(MyUserData?.personal?.name)}
            </div>
          )}

          {/* User Details */}
          <div className="border-l pl-4 border-gray-300 min-w-45">
            {MyUserIsLoading ? (
              <div className="space-y-1 animate-pulse">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-200 rounded" />
              </div>
            ) : MyUserError ? (
              <p className="text-sm text-red-500 font-medium">Failed to load user</p>
            ) : (
              <>
                {/* Name */}
                <p className="font-semibold leading-tight">
                  {MyUserData?.personal?.name || "Unknown User"}
                </p>

                {/* Email and Role */}
                <p className="text-sm text-gray-600 font-medium truncate">
                  {MyUserData?.credentials?.email || "Unknown Email"}
                  <span className="text-gray-400"> · </span>
                  {
                    MyUserData?.employment?.position &&
                      MyUserData.employment.position.toLowerCase() !== "unassigned"
                      ? MyUserData.employment.position
                      : MyUserData?.employment?.role || "-"
                  }
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
