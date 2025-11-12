// Auth/SignUp
"use client";

// Next Components
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

// React
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

// Sweetalert
import Swal from "sweetalert2";

// Assets
import Logo from "../../../../public/Logo/Website_Logo.png";

// Shared Input
import SharedInput from "../../../Shared/SharedInput/SharedInput";

// Hooks
import { useAuth } from "../../../Hooks/useAuth";

const SignUpPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, loading } = useAuth(true);
  const message = searchParams.get("message");

  // React Hook Form Handlers
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Show Swal if message exists
  useEffect(() => {
    if (message) {
      Swal.fire({
        toast: true,
        position: "top",
        icon: "info",
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "mx-auto",
        },
      });

      // Clear message from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("message");
      router.replace(url.toString(), { scroll: false });
    }
  }, [message, router]);

  // Handle form submission
  const onSubmit = async (data) => {
    await signUp(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Logo */}
      <div className="mx-auto pb-4 w-[200px]">
        <Image src={Logo} alt="SAT Logo" className="w-full h-auto" priority />
      </div>

      {/* Card */}
      <div className="card w-full max-w-md bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl hover:-translate-y-1.5 transition-all p-6 space-y-5 rounded-2xl">
        {/* Heading */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-extrabold text-gray-800 mt-4 tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Please sign up to access your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">
          {/* Full Name */}
          <SharedInput
            label="Full Name"
            placeholder="Enter your full name"
            name="name"
            register={register}
            rules={{ required: { value: true, message: "Name is required" } }}
            error={errors.name}
          />

          {/* Email */}
          <SharedInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            name="email"
            register={register}
            rules={{
              required: { value: true, message: "Email is required" },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            }}
            error={errors.email}
          />

          {/* Password */}
          <SharedInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            name="password"
            register={register}
            rules={{
              required: { value: true, message: "Password is required" },
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            }}
            error={errors.password}
          />

          {/* Confirm Password */}
          <SharedInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            name="confirmPassword"
            register={register}
            rules={{ required: { value: true, message: "Confirm your password" } }}
            error={errors.confirmPassword}
          />

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className={`btn w-full h-11 font-semibold tracking-wide ${loading
              ? "btn-disabled bg-blue-400 text-white cursor-not-allowed"
              : "btn-primary bg-blue-600 hover:bg-blue-700 text-white transition-all"
              }`}
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/Auth/Login" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
