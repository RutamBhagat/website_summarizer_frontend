"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  apiClient,
  endpoints,
  validateUrl,
  type BrochureResponse,
} from "~/lib/api-client";

// Custom hook for handling brochure streaming
const useBrochureStream = (
  url: string,
  companyName: string,
  isStreaming: boolean,
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["brochure", url, companyName, isStreaming],
    queryFn: async () => {
      if (!url || !companyName) {
        throw new Error("URL and company name are required");
      }

      const endpoint = isStreaming
        ? endpoints.brochureStream
        : endpoints.brochure;

      if (isStreaming) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${endpoint}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, company_name: companyName }),
          },
        );

        if (!response.ok) {
          const errorData = (await response.json()) as { detail?: string };
          throw new Error(errorData.detail ?? "Failed to generate brochure");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let content = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            content += chunk;

            queryClient.setQueryData(
              ["brochure", url, companyName, isStreaming],
              content,
            );
          }
          return content;
        } catch (error) {
          throw error;
        } finally {
          reader.releaseLock();
        }
      }

      const { data } = await apiClient.post<BrochureResponse>(endpoint, {
        url,
        company_name: companyName,
      });
      return data;
    },
    enabled: false,
    retry: 1,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });
};

interface BrochureContentProps {
  data: string | BrochureResponse | undefined | null;
  isStreaming: boolean;
}

const BrochureContent: React.FC<BrochureContentProps> = ({
  data,
  isStreaming,
}) => {
  if (!data) return null;

  if (isStreaming && typeof data === "string") {
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{data}</ReactMarkdown>
      </div>
    );
  }

  if (!isStreaming && typeof data !== "string") {
    return (
      <>
        <h2 className="text-2xl font-bold text-white">{data.company_name}</h2>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{data.content}</ReactMarkdown>
        </div>
        <p className="text-sm text-zinc-400">
          Generated on: {new Date(data.created_at).toLocaleDateString()}
        </p>
      </>
    );
  }

  return null;
};

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);

  const { data, isLoading, error, refetch } = useBrochureStream(
    url,
    companyName,
    isStreaming,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    void refetch();
  };

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 to-teal-700 py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="max-w-lg space-y-4">
            <h1 className="bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl xl:text-6xl">
              Company Brochure Generator
            </h1>
            <p className="text-zinc-100 md:text-xl">
              Transform any webpage into a comprehensive company brochure with
              AI.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                className="rounded-lg border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
              />
              <Input
                className="rounded-lg border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />

              <div className="flex items-center justify-between rounded-lg bg-gray-800/20 p-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isStreaming}
                    onCheckedChange={setIsStreaming}
                    disabled={isLoading}
                  />
                  <Label className="text-sm text-zinc-100">
                    Enable streaming response
                  </Label>
                </div>
                <Button
                  className="transform rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 font-semibold text-white transition-all hover:scale-105 hover:from-teal-500 hover:to-cyan-600 disabled:opacity-50"
                  type="submit"
                  disabled={isLoading || !url || !companyName}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </form>

            <p className="text-xs text-zinc-300">
              Powered by advanced AI. No sign-up required.{" "}
              <Link
                className="text-cyan-300 underline underline-offset-2 hover:text-cyan-400"
                href="https://github.com/RutamBhagat/website_summarizer"
                prefetch={false}
              >
                Learn how it works
              </Link>
            </p>
          </div>

          {error instanceof Error ? (
            <div className="text-red-400">{error.message}</div>
          ) : (
            <Suspense fallback={<div>Loading content...</div>}>
              {data && (
                <div className="mx-auto mt-8 w-full max-w-3xl space-y-6 rounded-lg bg-gray-800/80 p-6 text-left text-gray-200 shadow-lg">
                  <BrochureContent data={data} isStreaming={isStreaming} />
                </div>
              )}
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
