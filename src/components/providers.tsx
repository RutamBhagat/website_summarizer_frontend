"use client";

import { Toaster } from "sonner";
import { Navbar } from "~/components/navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ProviderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Move QueryClient initialization inside component to ensure client-side only
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Navbar />
      {children}
    </QueryClientProvider>
  );
}
