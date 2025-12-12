// hooks/useAxiosPublic.js
import axios from "axios";

/**
 * Create a robust Axios instance for public API requests.
 * Secure defaults + optional logging in development.
 */

const axiosPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api", // flexible base URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10s timeout to prevent hanging requests
});

// Request interceptor (optional: can modify requests globally)
axiosPublic.interceptors.request.use(
  (config) => {
    // Add any custom headers or logging here
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Axios Public] Request: ${config.method.toUpperCase()} ${config.url}`
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (centralized error handling)
axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status outside 2xx
      console.error(
        `[Axios Public] Error ${error.response.status}:`,
        error.response.data
      );
    } else if (error.request) {
      // No response received
      console.error("[Axios Public] No response received:", error.request);
    } else {
      // Something else
      console.error("[Axios Public] Axios error:", error.message);
    }

    // Optionally, wrap in a consistent error format
    return Promise.reject({
      message:
        error.response?.data?.message || error.message || "Network Error",
      status: error.response?.status || null,
      original: error,
    });
  }
);
const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
