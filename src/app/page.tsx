"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import Link from "next/link";

interface SummaryResponse {
  url: string;
  title: string;
  summary: string;
  created_at: string;
  id: string;
  owner_id: string;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
        throw new Error("Failed to fetch summary. Please try again.");
      }

      const data = (await response.json()) as SummaryResponse;
      setSummaryData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full bg-black py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid items-center gap-6">
          <div className="flex flex-col justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-3xl font-bold tracking-tighter text-transparent sm:text-5xl xl:text-6xl/none">
                Instant Website Insights
              </h1>
              <p className="mx-auto max-w-[600px] text-zinc-200 dark:text-zinc-100 md:text-xl">
                Transform any webpage into a clear, concise summary powered by
                AI. Save hours of reading in seconds.
              </p>
            </div>
            <div className="mx-auto w-full max-w-xl space-y-2">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  className="max-w-lg flex-1 border-gray-900 bg-gray-800 text-white placeholder:text-gray-400"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  className="bg-white text-black hover:bg-gray-200"
                  type="submit"
                  disabled={isLoading || !url}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Summarize"
                  )}
                </Button>
              </form>
              <p className="text-xs text-zinc-200 dark:text-zinc-100">
                Powered by advanced AI. No sign-up required.{" "}
                <Link
                  className="text-white underline underline-offset-2"
                  href="#"
                  prefetch={false}
                >
                  Learn how it works
                </Link>
              </p>
            </div>
          </div>

          {error && (
            <Alert className="mx-auto max-w-xl border border-red-500 bg-red-900/20 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {summaryData && (
            <div className="mx-auto mt-8 w-full max-w-3xl space-y-6 text-left">
              <div className="space-y-4 rounded-lg bg-gray-900/50 p-6">
                <h2 className="text-2xl font-bold text-white">
                  {summaryData.title}
                </h2>
                <div className="prose prose-invert max-w-none text-zinc-200">
                  <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
                </div>
                <p className="text-sm text-zinc-400">
                  Summarized on:{" "}
                  {new Date(summaryData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
