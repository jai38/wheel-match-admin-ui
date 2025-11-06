import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api";
import type { LoginRequest, RegisterRequest } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * React Query hooks for authentication
 */

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      authService.setToken(data.token);
      queryClient.setQueryData(["user"], data.user);
      toast.success("Login successful!");
      navigate("/dashboard");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Login failed");
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      authService.setToken(data.token);
      queryClient.setQueryData(["user"], data.user);
      toast.success("Registration successful!");
      navigate("/dashboard");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Registration failed");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      authService.clearToken();
      toast.success("Logged out successfully");
      navigate("/login");
    },
    onError: (error: { message?: string }) => {
      // Clear local state even if API call fails
      queryClient.clear();
      authService.clearToken();
      navigate("/login");
      toast.error(error.message || "Logout failed");
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => authService.getProfile(),
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIsAuthenticated = () => {
  return authService.isAuthenticated();
};
