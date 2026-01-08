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
      // Log server error
      console.error(
        `[Axios Public] Error ${error.response.status}:`,
        error.response.data
      );
      // Reject with the actual server response instead of a generic message
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error("[Axios Public] No response received:", error.request);
      return Promise.reject({ error: "No response from server" });
    } else {
      console.error("[Axios Public] Axios error:", error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
