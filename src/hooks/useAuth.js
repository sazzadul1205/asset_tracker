// hooks/useAuth.js
"use client";

// React Components
import { useState, useEffect } from "react";

// Next
import { useRouter } from "next/navigation";

// NextAuth
import { signIn, signOut, useSession, getSession } from "next-auth/react";

/**
 * useAuth - Secure authentication hook with role-based redirects
 * @param {boolean} redirectIfAuthenticated - redirect logged-in users automatically
 */
const useAuth = (redirectIfAuthenticated = false) => {
  const router = useRouter();

  // States
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (!redirectIfAuthenticated || status !== "authenticated") return;

    const role = session?.user?.role;

    const roleRedirectMap = {
      admin: "/admin/dashboard",
      manager: "/manager/dashboard",
      employee: "employee/dashboard",
    };

    const redirectPath = roleRedirectMap[role];

    if (redirectPath) {
      router.push(redirectPath);
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
      const role = session?.user?.role || "employee";

      console.log("Login - Session role:", role); // Debug log

      // Role-based redirect - USE LOWERCASE COMPARISON
      const normalizedRole = role.toLowerCase();

      if (normalizedRole === "admin") {
        router.push("/admin/dashboard");
      } else if (normalizedRole === "manager") {
        router.push("/manager/dashboard");
      } else {
        router.push("/employee/dashboard");
      }

      return { success: true, data: session };
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      return { success: false, message: "Unexpected error" };
    } finally {
      setLoading(false);
    }
  };
  // SignUp function
  const signUp = async (data) => {
    setLoading(true);

    try {
      if (data.password !== data.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return false;
      }

      await axiosPublic.post("/Users/CreateAccount", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Auto-login after signup
      await login(data.email, data.password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Sign up failed");
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
