import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method: string, url: string, data?: any) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  // Check if the response is JSON before returning
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response;
  } else if (!response.ok) {
    // If not JSON and not OK, create a better error response
    const text = await response.text();
    console.error('Non-JSON response:', text.substring(0, 500)); // Log part of the text

    // Create a new Response with appropriate JSON error
    return new Response(
      JSON.stringify({ 
        message: `Server returned non-JSON response with status ${response.status}` 
      }), 
      { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    },
  },
});