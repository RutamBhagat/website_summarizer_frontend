"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface SummaryResponse {
  url: string;
  title: string;
  summary: string;
  created_at: string;
  id: string;
  owner_id: string;
}

export default function SummarizerPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error(
          "Please enter a valid URL starting with http:// or https://",
        );
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/websites/public/summarize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        },
      );

      if (!response.ok) {
        const errorData = (await response.json()) as { detail?: string };
        throw new Error(
          errorData.detail ?? "Failed to fetch summary. Please try again.",
        );
      }

      const data = (await response.json()) as SummaryResponse;
      setSummaryData(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

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

          {summaryData && (
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
        </div>
      </div>
    </section>
  );
}
