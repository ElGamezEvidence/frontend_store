function resolveApiUrl() {
  const url =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_URL?.trim() ||
    "";

  if (!url) {
    throw new Error(
      "API_URL / NEXT_PUBLIC_API_URL is not configured. Set it in Netlify environment variables to your Railway backend URL.",
    );
  }

  return url.replace(/\/$/, "");
}

export function getApiUrl() {
  return resolveApiUrl();
}

/** Prefer getApiUrl() at call-time so runtime env is read correctly. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  process.env.API_URL?.replace(/\/$/, "") ||
  "";

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
