export const defaultApiBaseUrl = 'http://localhost:3001';

export function normalizeApiBaseUrl(value?: string): string {
  const trimmedValue = value?.trim();

  if (trimmedValue === undefined || trimmedValue.length === 0) {
    return defaultApiBaseUrl;
  }

  return trimmedValue.endsWith('/') ? trimmedValue.slice(0, -1) : trimmedValue;
}

export const apiBaseUrl = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_COHOS_API_BASE_URL ?? process.env.COHOS_API_BASE_URL,
);

export function toApiUrl(path: string, baseUrl = apiBaseUrl): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizeApiBaseUrl(baseUrl)}${normalizedPath}`;
}

export type ApiRequestOptions = Omit<RequestInit, 'headers'> & {
  readonly headers?: HeadersInit;
};

export async function fetchFromApi<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  const response = await fetch(toApiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`COHOS API request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();

  return payload as TResponse;
}
