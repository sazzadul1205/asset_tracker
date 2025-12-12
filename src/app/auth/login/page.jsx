// Auth/Login
"use client";

// React Components
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';

// Next Components
import Image from 'next/image';

// Shared
import Shared_Input from '@/Shared/Shared_Input/input';

// Hooks
import useAuth from '@/hooks/useAuth';

// Assets
import Logo from "../../../../public/Logo/Website_Logo.png";

const LoginPage = () => {
  const { login, loading } = useAuth(true);
  const [errorMessage, setErrorMessage] = useState(null); // error content
  const [showError, setShowError] = useState(false); // controls fade

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Fade-out effect for error message
  useEffect(() => {
    if (!errorMessage) return;

    // Defer state update to avoid synchronous setState warning
    const showTimer = setTimeout(() => setShowError(true), 0);

    // Fade out after 4.5s
    const fadeTimer = setTimeout(() => setShowError(false), 4500);

    // Remove completely after fade completes (0.5s)
    const removeTimer = setTimeout(() => setErrorMessage(null), 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [errorMessage]);


  // Form submission
  const onSubmit = async (data) => {
    setErrorMessage(null);
    setShowError(false);

    try {
      const res = await login(data.email, data.password);
      if (!res.success) {
        setErrorMessage(res.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src={Logo} alt="SAT Logo" className="w-48 h-auto" priority />
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg p-8 rounded-2xl space-y-6">

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Please sign in to access your dashboard
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              className={`bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm font-medium text-center
                transition-opacity duration-500 ease-in-out
                ${showError ? "opacity-100" : "opacity-0"}`}
            >
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <Shared_Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              register={register}
              name="email"
              errors={errors}
            />

            {/* Password */}
            <Shared_Input
              label="Password"
              type="password"
              placeholder="Your Password"
              register={register}
              name="password"
              errors={errors}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 font-semibold tracking-wide rounded-lg
                ${loading
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 ease-in-out active:scale-95"
                }`}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
