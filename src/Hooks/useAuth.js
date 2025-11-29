// hooks/useAuth.js
"use client";

// React Components
import { useEffect, useState } from "react";


// Next Components
import { useRouter } from "next/navigation";

// Next Auth
import { signIn, getSession, signOut } from "next-auth/react";

// Hooks
import useAxiosPublic from "./useAxiosPublic";

// Utils
import { useToast } from "./Toasts";

export const useAuth = (redirectIfAuthenticated = false) => {
  const router = useRouter();
  const axiosPublic = useAxiosPublic();
  const [loading, setLoading] = useState(false);
  const { confirm, success, error, info } = useToast();

  // Skip showing "Already logged in!" if user is actively logging in
  const [skipAlreadyLoggedInToast, setSkipAlreadyLoggedInToast] =
    useState(false);

  // Session check for pages like Login/SignUp
  useEffect(() => {
    if (!redirectIfAuthenticated) return;

    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        if (!skipAlreadyLoggedInToast) {
          info("Already logged in!"); // Only show if not skipping
        }

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
  }, [redirectIfAuthenticated, router, info, skipAlreadyLoggedInToast]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setSkipAlreadyLoggedInToast(true); // prevent the "Already logged in" toast during manual login

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        error(res.error || "Login failed");
        setLoading(false);
        return false;
      }

      if (res?.ok) {
        success("Login successful!", 1500);

        const session = await getSession();
        const role = session?.user?.role || "Employee";

        switch (role) {
          case "Admin":
            router.push("/Admin/Dashboard");
            break;
          case "Manager":
            router.push("/Manager/Dashboard");
            break;
          case "Employee":
            router.push("/Employee/Dashboard");
            break;
          default:
            router.push("/Employee/Dashboard");
        }

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
      if (data.password !== data.confirmPassword) {
        error("Passwords do not match");
        setLoading(false);
        return false;
      }

      await axiosPublic.post("/Users/CreateAccount", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      success("Account created successfully!", 2000);

      // Auto-login after signup
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

      // Clear URL messages
      const url = new URL(window.location.href);
      url.searchParams.delete("message");
      router.replace(url.toString(), { scroll: false });

      success("Logged out successfully!", 1500);
      router.push("/Auth/Login");
    } catch (err) {
      error(err.message || "Logout failed");
    }
  };

  return { login, signUp, logout, loading };
};
