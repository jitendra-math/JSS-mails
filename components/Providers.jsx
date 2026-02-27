"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }) {
  // Initialize QueryClient ek hi baar hota hai session mein
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 1 minute tak data ko fresh maano (No unnecessary loading)
        staleTime: 1000 * 60, 
        
        // Window focus hote hi refresh (Premium native feel)
        refetchOnWindowFocus: true,
        
        // Error aane par 2 baar retry karega
        retry: 2,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
