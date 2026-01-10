// app/auth/login/page.jsx
"use client";

// Next Components
import Image from "next/image";

// React Components
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";

// Shared
import Shared_Input from "@/Shared/Shared_Input/Shared_Input";

// Hooks
import useAuth from "@/hooks/useAuth";

import Logo from "../../../../public/Logo/Website_Logo.png";

// Demo accounts
const demoAccounts = [
  {
    role: "Admin",
    email: "admin@gmail.com",
    password: "Pritom1205",
  },
  {
    role: "Manager",
    email: "manager@gmail.com",
    password: "M@nager1205",
  },
  {
    role: "Employee",
    email: "employee@gmail.com",
    password: "Employee1205",
  },
];

const LoginPage = () => {
  const { login, loading } = useAuth(true);

  // States
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  /* ===============================
     Error fade handling
  ================================ */
  useEffect(() => {
    if (!errorMessage) return;

    const showTimer = setTimeout(() => setShowError(true), 0);
    const fadeTimer = setTimeout(() => setShowError(false), 4500);
    const removeTimer = setTimeout(() => setErrorMessage(null), 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [errorMessage]);

  /* ===============================
     Demo click → autofill
  ================================ */
  const handleDemoFill = (account) => {
    setValue("email", account.email);
    setValue("password", account.password);
  };

  /* ===============================
     Submit
  ================================ */
  const onSubmit = async (data) => {
    setErrorMessage(null);
    setShowError(false);

    try {
      const res = await login(data.email, data.password);
      if (!res.success) {
        setErrorMessage(res.message || "Login failed.");
      }
    } catch {
      setErrorMessage("Something went wrong.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4 relative">

      {/* ===============================
      Login Card
  ================================ */}
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image src={Logo} alt="SAT Logo" className="w-48 h-auto" priority />
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg p-8 rounded-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-800">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {errorMessage && (
            <div
              className={`bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm text-center
          transition-opacity duration-500
          ${showError ? "opacity-100" : "opacity-0"}`}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Shared_Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              register={register}
              name="email"
              errors={errors}
            />

            <Shared_Input
              label="Password"
              type="password"
              placeholder="Your Password"
              register={register}
              name="password"
              errors={errors}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 font-semibold rounded-lg
            ${loading
                  ? "bg-blue-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
                }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* ===============================
      Demo Accounts → BELOW LOGIN CARD
  ================================ */}
      <div className="mt-6 w-full max-w-md space-y-3">
        {demoAccounts.map((account, index) => (
          <div
            key={index}
            onClick={() => handleDemoFill(account)}
            className="cursor-pointer bg-white border border-gray-200 rounded-xl p-4 shadow-lg
                   hover:border-blue-500 hover:shadow-xl transition-all active:scale-[0.98]"
          >
            <h4 className="text-sm font-extrabold text-gray-800 mb-1">
              {account.role} Login
            </h4>

            <p className="text-xs text-gray-600 font-mono">
              {account.email}
            </p>

            <p className="text-[11px] text-blue-600 mt-2 font-semibold">
              Click to auto-fill
            </p>
          </div>
        ))}
      </div>
    </div>

  );
};

export default LoginPage;
