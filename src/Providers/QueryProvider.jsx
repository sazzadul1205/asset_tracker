"use client";

// React components
import { useState } from "react";

// Tanstack components
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({ children }) {
    // Create client once per app lifecycle
    const [queryClient] = useState(() => new QueryClient());

    // Provide client to app
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
