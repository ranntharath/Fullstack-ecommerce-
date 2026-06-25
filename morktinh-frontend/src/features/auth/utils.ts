import type { User } from "@/features/auth/types";

type ApiError = {
  data?: unknown;
  error?: string;
  status?: number | string;
};

export function getAuthErrorMessage(error: unknown, fallback: string) {
  const apiError = error as ApiError;
  const data = apiError?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const message = record.message || record.detail || record.non_field_errors;

    if (Array.isArray(message)) {
      return String(message[0]);
    }

    if (message) {
      return String(message);
    }

    const firstErrorKey = Object.keys(record)[0];
    const firstError = record[firstErrorKey];

    if (Array.isArray(firstError)) {
      return String(firstError[0]);
    }

    if (firstError) {
      return String(firstError);
    }
  }

  return apiError?.error || fallback;
}

export function readStoredAuth() {
  if (typeof window === "undefined") {
    return {
      user: null,
      accessToken: null,
    };
  }

  const accessToken = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return {
      user: null,
      accessToken,
    };
  }

  try {
    return {
      user: JSON.parse(storedUser) as User,
      accessToken,
    };
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    return {
      user: null,
      accessToken: null,
    };
  }
}
