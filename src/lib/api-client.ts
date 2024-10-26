// src/lib/api-client.ts
import axios, { type AxiosError } from "axios";

// Define the expected error response structure
interface ApiErrorResponse {
  detail: string;
  status?: number;
  code?: string;
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Type assertion for AxiosError with our expected error response shape
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Check if we have a properly structured error response
    if (axiosError.response?.data) {
      return axiosError.response.data.detail;
    }

    // Fallback to axios error message
    return axiosError.message;
  }

  // Handle non-axios errors
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred";
};

// Optional: Type-safe request wrapper
export async function apiRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
// Types
export interface BaseResponse {
  id: string;
  created_at: string;
  owner_id: string | null;
}

export interface BrochureResponse extends BaseResponse {
  url: string;
  company_name: string;
  content: string;
}

export interface SummaryResponse extends BaseResponse {
  url: string;
  title: string;
  summary: string;
}

// API endpoints
export const endpoints = {
  brochure: "/api/v1/brochures/public/brochure",
  brochureStream: "/api/v1/brochures/public/brochure/stream",
  summarize: "/api/v1/websites/public/summarize",
} as const;

// Validation
export const validateUrl = (url: string): boolean => {
  return url.startsWith("http://") || url.startsWith("https://");
};
