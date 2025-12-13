"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/*
  QueryProvider
  - Wraps the app with React Query
  - Uses useState to persist QueryClient across renders
*/
export default function QueryProvider({ children }) {
  // Ensure a single QueryClient instance per browser session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,               // fail fast
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,   // 1 minute
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
