// hooks/useAuth.js
"use client";

// React Components
import { useEffect, useState } from "react";

// Next Components
import { useRouter } from "next/navigation";
import { signIn, getSession, signOut } from "next-auth/react";

// Hooks
import useAxiosPublic from "./useAxiosPublic";

// Toasts
import { useToast } from "./Toasts";

export const useAuth = (redirectIfAuthenticated = false) => {
  // Router for navigation
  const router = useRouter();

  // Axios instance
  const axiosPublic = useAxiosPublic();

  // Loading state
  const [loading, setLoading] = useState(false);

  // Toast hooks
  const { confirm, success, error, info } = useToast();

  // Session check for pages like Login/SignUp
  useEffect(() => {
    if (!redirectIfAuthenticated) return;

    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        // Already logged in
        info("Already logged in!");

        // Redirect based on role
        const role = session.user.role || "Employee";
        switch (role) {
          case "Admin":
            router.replace("/Admin/Dashboard");
            break;
          case "Manager":
            router.replace("/Manager/Dashboard");
            break;
          default:
            router.replace("/Employee/Dashboard");
        }
      }
    };

    checkSession();
  }, [info, redirectIfAuthenticated, router]);

  // Login function
  const login = async (email, password) => {
    // Set loading
    setLoading(true);

    try {
      // Sign in
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      // Check for errors
      if (res?.error) {
        error(res.error || "Login failed");
        setLoading(false);
        return false;
      }

      // Check for success
      if (res?.ok) {
        success("Login successful!", 1500);

        // Check user role
        const session = await getSession();
        const role = session?.user?.role || "Employee";

        // Redirect based on role
        switch (role) {
          case "Admin":
            router.push("/Admin/Dashboard");
            break;
          case "Manager":
            router.push("/Manager/Dashboard");
            break;
          default:
            router.push("/Employee/Dashboard");
        }

        // Set loading
        setLoading(false);
        return true;
      }
    } catch (err) {
      error(err.message || "Unexpected error");
      setLoading(false);
      return false;
    }
  };

  // SignUp function
  const signUp = async (data) => {
    setLoading(true);

    try {
      // Check confirm password inside hook
      if (data.password !== data.confirmPassword) {
        error("Passwords do not match");
        setLoading(false);
        return false;
      }

      // Sign up
      await axiosPublic.post("/Users/CreateAccount", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Show success
      success("Account created successfully!", 2000);

      // Auto-login after sign-up
      await login(data.email, data.password);
    } catch (err) {
      error(err.response?.data?.message || err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const confirmed = await confirm(
        "Are you sure?",
        "You will be logged out."
      );
      if (!confirmed) return;

      await signOut({ redirect: false });
      success("Logged out successfully!", 1500);
      router.push("/Auth/Login");
    } catch (err) {
      error(err.message || "Logout failed");
    }
  };

  // Return functions
  return { login, signUp, logout, loading };
};
