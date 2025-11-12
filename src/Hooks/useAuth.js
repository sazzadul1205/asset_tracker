// hooks/useAuth.js
"use client";

// React Components
import { useState } from "react";

// Next Components
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

// Sweetalert
import Swal from "sweetalert2";

export const useAuth = () => {
  // Router
  const router = useRouter();

  // Loading state
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    // Loading
    setLoading(true);

    try {
      // Sign in user
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      // Check for errors
      if (res?.error) {
        Swal.fire({
          toast: true,
          position: "top",
          icon: "error",
          title: res.error,
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          customClass: {
            popup: "mx-auto",
          },
        });
        setLoading(false);
        return false;
      }

      //   Check for success
      if (res?.ok) {
        Swal.fire({
          toast: true,
          position: "top",
          icon: "success",
          title: "Login successful!",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: "mx-auto",
          },
        });

        // Get user role
        const session = await getSession();
        const role = session?.user?.role || "Employee";

        // Redirect to dashboard
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
        setLoading(false);
        return true;
      }
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top",
        icon: "error",
        title: err.message || "Unexpected error occurred",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        customClass: {
          popup: "mx-auto",
        },
      });
      setLoading(false);
      return false;
    }
  };

  return { login, loading };
};
