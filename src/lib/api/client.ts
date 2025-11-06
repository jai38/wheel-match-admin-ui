import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "./types";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";
const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";

/**
 * Create axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("auth_token");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;

        case 403:
          // Forbidden
          console.error("Access forbidden:", data?.message);
          break;

        case 404:
          // Not found
          console.error("Resource not found:", data?.message);
          break;

        case 409:
          // Conflict (e.g., duplicate entry)
          console.error("Conflict:", data?.message);
          break;

        case 500:
          // Server error
          console.error("Server error:", data?.message);
          break;

        default:
          console.error("API Error:", data?.message || "Unknown error");
      }

      // Return structured error
      return Promise.reject({
        status: data?.status || "error",
        message: data?.message || "An error occurred",
        statusCode: status,
      });
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error: No response from server");
      return Promise.reject({
        status: "error",
        message: "Network error. Please check your connection.",
        statusCode: 0,
      });
    } else {
      // Something else happened
      console.error("Request error:", error.message);
      return Promise.reject({
        status: "error",
        message: error.message || "Request failed",
        statusCode: 0,
      });
    }
  }
);

/**
 * Helper function to build query string from params
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const filtered = Object.entries(params).filter(([_, value]) => {
    return value !== undefined && value !== null && value !== "";
  });

  if (filtered.length === 0) return "";

  const searchParams = new URLSearchParams();
  filtered.forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `?${searchParams.toString()}`;
};

export default apiClient;
