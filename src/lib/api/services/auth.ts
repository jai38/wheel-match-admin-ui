import apiClient from "../client";
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types";

/**
 * Authentication Service
 * Handles user authentication operations
 */
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );
    return response.data.data!;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      userData
    );
    return response.data.data!;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/profile");
    return response.data.data!;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post<ApiResponse>("/auth/logout");
    localStorage.removeItem("auth_token");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  /**
   * Store auth token
   */
  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  },

  /**
   * Clear auth token
   */
  clearToken(): void {
    localStorage.removeItem("auth_token");
  },
};
