"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

const SignupPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    setMessage("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setMessage(json.error || json.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center">Create Account</h1>

        {message && <div className="bg-red-100 text-red-700 p-2 rounded">{message}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            {...register("name", { required: true })}
            className="input input-bordered w-full"
          />
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
            className="input input-bordered w-full"
          />
          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: true, minLength: 6 })}
            className="input input-bordered w-full"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
