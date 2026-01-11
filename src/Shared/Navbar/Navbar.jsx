// Shared/Navbar/Navbar.jsx
"use client";

// React
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Next Auth
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { FiMaximize, FiMinimize } from "react-icons/fi";
import { MdMenu } from "react-icons/md";

const Navbar = ({
  isSidebarCollapsed,
  toggleSidebarWidth,
}) => {
  const axiosPublic = useAxiosPublic();
  const { data: session } = useSession();

  // Current path
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
    <nav className="sticky top-0 z-40 bg-white shadow-lg px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left: Menu Toggle + Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Toggle */}
          <label
            htmlFor="admin-drawer"
            className="btn btn-ghost drawer-button lg:hidden"
            aria-label="Open sidebar"
          >
            <MdMenu className="text-2xl" />
          </label>

          {/* Desktop Sidebar Width Toggle */}
          <button
            onClick={toggleSidebarWidth}
            className="hidden lg:flex p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <MdMenu className="text-2xl" />
          </button>

          <h1 className="text-xl font-bold text-gray-800 Roboto-slab-display">
            {pageTitle}
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-4">
          {/* Fullscreen Toggle */}
          <FullscreenButton />

          {/* Avatar & User Details */}
          <div className="flex items-center gap-3">
            {MyUserIsLoading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : (
              <div className="w-10 h-10 rounded-full ring ring-gray-200 ring-offset-2 flex items-center justify-center bg-gray-300 text-gray-800 font-bold select-none">
                {getUserInitials(MyUserData?.personal?.name)}
              </div>
            )}

            {/* User Details - Hidden on mobile, visible on tablet and up */}
            <div className="hidden md:block border-l pl-4 border-gray-300 min-w-30">
              {MyUserIsLoading ? (
                <div className="space-y-1 animate-pulse">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-40 bg-gray-200 rounded" />
                </div>
              ) : MyUserError ? (
                <p className="text-sm text-red-500 font-medium">Failed to load user</p>
              ) : (
                <>
                  <p className="font-semibold leading-tight text-sm">
                    {MyUserData?.personal?.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-600 font-medium truncate max-w-45">
                    {MyUserData?.credentials?.email || "Unknown Email"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// FullscreenButton component
function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Failed to exit fullscreen:", err);
      });
      setIsFullscreen(false);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer hidden sm:block"
      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
    >
      {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
    </button>
  );
}