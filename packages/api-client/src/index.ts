export type ApiError = {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
};

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  headers?: HeadersInit;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

export function createApiClient(options: ApiClientOptions) {
  const fetcher = options.fetch ?? globalThis.fetch;

  async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await fetcher(new URL(path, options.baseUrl), {
      ...init,
      headers: {
        Accept: "application/json",
        ...options.headers,
        ...init.headers,
      },
    });

    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const error = isApiError(body)
        ? body
        : {
            status: response.status,
            message: response.statusText || "Request failed",
            details: body,
          };

      throw new ApiClientError(error);
    }

    return body as T;
  }

  return {
    request,
    get: <T>(path: string, init?: RequestInit) =>
      request<T>(path, { ...init, method: "GET" }),
    post: <T>(path: string, body?: unknown, init?: RequestInit) =>
      request<T>(path, {
        ...init,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    put: <T>(path: string, body?: unknown, init?: RequestInit) =>
      request<T>(path, {
        ...init,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    delete: <T>(path: string, init?: RequestInit) =>
      request<T>(path, { ...init, method: "DELETE" }),
  };
}

function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.status === "number" &&
    typeof candidate.message === "string"
  );
}
