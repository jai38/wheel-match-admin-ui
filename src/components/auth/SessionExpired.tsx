import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Component to handle session expiration
 * Automatically redirects to login when token expires
 */
export function SessionExpired() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("Your session has expired. Please login again.");
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
}
