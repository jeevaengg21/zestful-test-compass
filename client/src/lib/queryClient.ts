import { QueryClient } from '@tanstack/react-query';

const defaultQueryFn = async ({ queryKey }: { queryKey: any }) => {
  const url = queryKey[0];
  const token = localStorage.getItem('token');
  
  console.log('Making API request to:', url);
  console.log('Token present:', !!token);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    if (response.status === 401) {
      console.log('Unauthorized - removing token and redirecting');
      localStorage.removeItem('token');
      window.location.reload();
    }
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}