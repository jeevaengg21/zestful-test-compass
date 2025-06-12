import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  tenantId: string;
  tenant: {
    name: string;
    subscriptionPlan: string;
    maxUsers?: number;
    maxProjects?: number;
  };
}

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const token = localStorage.getItem("token");
  
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    retry: false,
  });

  return {
    user: authData?.user,
    isLoading,
    isAuthenticated: !!authData?.user && !!token,
    error,
    logout: () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    },
  };
}