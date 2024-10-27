"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

// Define strict types for responses
interface ErrorData {
  detail?: string;
}

interface BrochureResponse {
  content: string;
}

type StreamChunk =
  | {
      type: "content";
      text: string;
    }
  | {
      type: "done";
    };

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Type Guards
  function isErrorData(data: unknown): data is ErrorData {
    return (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof (data as ErrorData).detail === "string"
    );
  }

  function isBrochureResponse(data: unknown): data is BrochureResponse {
    return (
      typeof data === "object" &&
      data !== null &&
      "content" in data &&
      typeof (data as BrochureResponse).content === "string"
    );
  }

  // Parse streaming chunks with type safety
  function parseStreamChunk(data: string): StreamChunk {
    if (data === "[DONE]") {
      return { type: "done" };
    }
    return { type: "content", text: data };
  }

  const handleStream = async () => {
    setIsLoading(true);
    setContent("");

    try {
      const endpoint = isStreaming
        ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/brochures/public/stream`
        : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/brochures/public`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, company_name: companyName }),
      });

      if (!response.ok) {
        const errorData: unknown = await response.json();
        if (isErrorData(errorData)) {
          throw new Error(errorData.detail ?? "Failed to generate brochure");
        } else {
          throw new Error("Failed to generate brochure");
        }
      }

      if (isStreaming) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                const chunk = parseStreamChunk(data);

                switch (chunk.type) {
                  case "content":
                    setContent((prev) => prev + chunk.text);
                    break;
                  case "done":
                    return;
                }
              }
            }
          }
        } catch (err) {
          toast.error(
            "Error processing stream: " +
              (err instanceof Error ? err.message : String(err)),
          );
        }
      } else {
        const data: unknown = await response.json();
        if (isBrochureResponse(data)) {
          setContent(data.content);
        } else {
          throw new Error("Unexpected response format");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

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

    void handleStream();
  };

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 to-teal-700 py-12">
      <div className="container px-4">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Header */}
          <div className="max-w-lg space-y-4">
            <h1 className="bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
              Company Brochure Generator
            </h1>
            <p className="text-zinc-100 md:text-xl">
              Transform any webpage into a comprehensive company brochure with
              AI.
            </p>
          </div>

          {/* Form */}
          <div className="mx-auto w-full max-w-xl space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                className="rounded-lg bg-white text-gray-800 placeholder-gray-400"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
              />
              <Input
                className="rounded-lg bg-white text-gray-800 placeholder-gray-400"
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
                  className="bg-gradient-to-r from-teal-400 to-cyan-500 font-semibold text-white hover:from-teal-500 hover:to-cyan-600 disabled:opacity-50"
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
          </div>

          {/* Content Display */}
          {content && (
            <div className="mx-auto mt-8 w-full max-w-3xl space-y-6 rounded-lg bg-gray-800/80 p-6 text-left text-gray-200 shadow-lg">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
