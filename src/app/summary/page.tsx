"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  apiClient,
  endpoints,
  validateUrl,
  type SummaryResponse,
} from "~/lib/api-client";

export default function SummarizerPage() {
  const [url, setUrl] = useState("");

  const {
    data: summaryData,
    error,
    refetch,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["summary", url],
    queryFn: async () => {
      if (!validateUrl(url)) {
        throw new Error(
          "Please enter a valid URL starting with http:// or https://",
        );
      }
      const { data } = await apiClient.post<SummaryResponse>(
        endpoints.summarize,
        { url },
      );
      return data;
    },
    enabled: false,
    retry: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast.error("Please enter a URL", { duration: 5000 });
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Invalid URL. Please use http:// or https://", {
        duration: 5000,
      });
      return;
    }

    // Use a regular toast instead of loading
    toast("Starting summary generation...", {
      duration: 5000,
      description: "Please wait while we process your request",
    });

    void refetch();
  };

  useEffect(() => {
    // Clear any existing toasts when status changes
    toast.dismiss();

    if (isLoading) {
      // Optional: Show a progress toast
      toast("Generating summary...", {
        duration: 5000,
        description: "This may take a moment",
      });
    } else if (isSuccess) {
      toast.success("Summary generated successfully!", {
        duration: 5000,
      });
    } else if (isError && error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred",
        {
          duration: 5000,
        },
      );
    }
  }, [isLoading, isSuccess, isError, error]);

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 to-teal-700 py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="max-w-lg space-y-4">
            <h1 className="bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl xl:text-6xl">
              Instant Website Insights
            </h1>
            <p className="text-zinc-100 md:text-xl">
              Transform any webpage into a concise summary with AI. Save hours
              of reading in seconds.
            </p>
          </div>
          <div className="mx-auto w-full max-w-xl space-y-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                className="flex-1 rounded-lg border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              <Button
                className="transform rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 font-semibold text-white transition-all hover:scale-105 hover:from-teal-500 hover:to-cyan-600 disabled:opacity-50"
                type="submit"
                disabled={isLoading || !url}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Summarize"
                )}
              </Button>
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

          {isSuccess && summaryData && (
            <div className="mx-auto mt-8 w-full max-w-3xl space-y-6 rounded-lg bg-gray-800/80 p-6 text-left text-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-white">
                {summaryData.title}
              </h2>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
              </div>
              <p className="text-sm text-zinc-400">
                Summarized on:{" "}
                {new Date(summaryData.created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {isError && error && (
            <div className="text-red-500">Error: {error.message}</div>
          )}
        </div>
      </div>
    </section>
  );
}
