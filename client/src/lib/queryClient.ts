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
  
  console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log('[API Request] Request body:', options.body);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    console.log(`[API Response] Status: ${response.status} for ${url}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('[API Response] Unauthorized - removing token and redirecting');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      const errorText = await response.text();
      console.error(`[API Error] ${response.status}: ${response.statusText}`, errorText);
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API Response] Data for ${url}:`, data);
    
    return data;
  } catch (error) {
    console.error(`[API Error] Request to ${url} failed:`, error);
    throw error;
  }
}