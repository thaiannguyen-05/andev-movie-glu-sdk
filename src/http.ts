import { MovieGluError } from './error';
import type { Client, FetchLike, RequestOptions } from './type';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type ResponseLike = {
  ok: boolean;
  status: number;
  headers?: { get(name: string): string | null };
  json(): Promise<unknown>;
  text(): Promise<string>;
};

function resolveFetch(customFetch?: FetchLike): FetchLike {
  if (customFetch) return customFetch;

  const runtimeFetch = globalThis.fetch as unknown as FetchLike | undefined;
  if (!runtimeFetch) {
    throw new MovieGluError(
      'Fetch API is not available. Pass a fetch implementation in createMovieGluClient({ fetch }).',
    );
  }

  return runtimeFetch;
}

async function parseResponse(response: ResponseLike): Promise<unknown> {
  const contentType = response.headers?.get?.('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'object' && payload) {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message;
    }

    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error;
    }

    const statusPayload = record.status;
    if (typeof statusPayload === 'object' && statusPayload) {
      const nested = statusPayload as Record<string, unknown>;
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message;
      }
    }
  }

  return `MovieGlu request failed with status ${status}`;
}

export async function httpRequest<T>(
  client: Client,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const fetcher = resolveFetch(client.fetch);
  const url = new URL(path, client.baseUrl);

  if (options.queryParams) {
    for (const [key, value] of Object.entries(options.queryParams)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    client: 'ANDE',
    'x-api-key': client.apiKey,
    authorization: 'Basic QU5ERV9YWDpWMEhoUjYzSHZOalM=',
    territory: 'XX',
    'api-version': 'v201',
    geolocation: '-22.0;14.0',
    'device-datetime': new Date().toISOString(),
    ...client.headers,
    ...options.headers,
  };

  if (options.body) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  const response = await fetcher(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message = getErrorMessage(payload, response.status);
    throw new MovieGluError(message, {
      status: response.status,
      details: payload,
    });
  }

  return payload as T;
}
