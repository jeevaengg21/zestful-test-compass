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
    queryFn: async (): Promise<AuthResponse> => {
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch user data");
      }

      return response.json();
    },
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