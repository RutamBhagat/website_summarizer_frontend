import "~/styles/globals.css";

import { Toaster } from "sonner";
import { Navbar } from "~/components/navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export default function ProviderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <body>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Navbar />
        {children}
      </QueryClientProvider>
    </body>
  );
}
