// hooks/useAuth.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

/**
 * useAuth - Secure authentication hook with role-based redirects
 * @param {boolean} redirectIfAuthenticated - redirect logged-in users automatically
 */
const useAuth = (redirectIfAuthenticated = false) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (redirectIfAuthenticated && status === "authenticated") {
      const role = session?.user?.role || "Employee";

      if (role === "Admin") router.push("/admin/dashboard");
      else if (role === "Manager") router.push("/manager/dashboard");
      else router.push("/dashboard"); // Employee or default
    }
  }, [status, redirectIfAuthenticated, router, session]);

  /**
   * Login using NextAuth credentials provider
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Sign in using NextAuth credentials
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        return { success: false, message: res.error };
      }

      // Get the latest session safely
      const session = await getSession();
      const role = session?.user?.role || "Employee";

      // Role-based redirect
      if (role === "Admin") router.push("/admin/dashboard");
      else if (role === "Manager") router.push("/manager/dashboard");
      else router.push("/employee/dashboard");

      return { success: true, data: session };
    } catch (err) {
      // Catch unexpected errors
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      return { success: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  };

  //  Logout using NextAuth
  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  };

  // Returns user data
  const user = session?.user || null;

  // Returns user data safely
  return {
    login,
    logout,
    user,
    loading: loading || status === "loading",
    error,
    isAuthenticated: status === "authenticated",
  };
};

export default useAuth;
