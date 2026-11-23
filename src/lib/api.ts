/** Known healthy Railway production API for Soukly. */
const PRODUCTION_API_URL =
  "https://sunny-enchantment-production-df870c45.up.railway.app";

function normalizeApiUrl(raw: string) {
  let url = raw.trim().replace(/\/$/, "");
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
}

function resolveApiUrl() {
  const configured =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_URL?.trim() ||
    "";

  const cleaned = normalizeApiUrl(configured);

  const onCloudHost = Boolean(
    process.env.NETLIFY ||
      process.env.CONTEXT ||
      process.env.CF_PAGES ||
      process.env.CLOUDFLARE ||
      process.env.WORKERS,
  );
  if (onCloudHost || process.env.NODE_ENV === "production") {
    if (!cleaned || /localhost|127\.0\.0\.1/.test(cleaned)) {
      return PRODUCTION_API_URL;
    }
  }

  if (!cleaned) {
    throw new Error(
      "API_URL / NEXT_PUBLIC_API_URL is not configured. Set it in Cloudflare environment variables to your Railway backend URL (including https://).",
    );
  }

  return cleaned;
}

export function getApiUrl() {
  return resolveApiUrl();
}

/** Prefer getApiUrl() at call-time so runtime env is read correctly. */
export const API_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    PRODUCTION_API_URL,
);

type FetchOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const base = getApiUrl();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, "BACKEND_UNREACHABLE");
  }

  if (!res.ok) {
    let message = `HTTP_${res.status}`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
