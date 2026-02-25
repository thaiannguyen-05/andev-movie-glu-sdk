import { httpRequest } from './http';
import type {
  CinemaDetailsRequestOptions,
  CinemaShowTimesParams,
  CinemaShowTimesResponse,
  CinemaDetailsResponse,
  CinemasNearbyParams,
  CinemasNearbyRequestOptions,
  CinemasNearbyResponse,
  FilmDetailsResponse,
  FilmsComingSoonResponse,
  FilmsNowShowing,
  GeolocationInput,
  ListParams,
  MovieGluClientConfig,
  MovieGluSdk,
  SortType,
} from './type';
import { SORT_TYPE } from './type';

export const DEFAULT_BASE_URL = 'https://api-gate2.movieglu.com';

const ENDPOINT_PATH = {
  FILM_NOWSHOWING: '/filmsNowShowing',
  CINEMA_NEARBY: '/cinemasNearby',
  FILMS_COMING_SOON: '/filmsComingSoon',
  FILMS_DETAIL: '/filmDetails/',
  CINEMA_DETAIL: '/cinemaDetails/',
  CINEMA_SHOWTIME: '/cinemaShowTimes/',
} as const;

type QueryValue = string | number | boolean | null | undefined;

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function buildUrl(path: string, queryParams?: Record<string, QueryValue>, baseUrl = DEFAULT_BASE_URL): string {
  const url = new URL(path, `${normalizeBaseUrl(baseUrl)}/`);

  if (!queryParams) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

function assertFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function assertDateString(value: string, name: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError(`${name} must be in YYYY-MM-DD format`);
  }
}

function formatGeolocationHeader(geolocation: GeolocationInput): string {
  if (typeof geolocation === 'string') {
    const value = geolocation.trim();
    if (!value) {
      throw new TypeError('geolocation header must not be empty');
    }

    return value;
  }

  assertFiniteNumber(geolocation.lat, 'geolocation.lat');
  assertFiniteNumber(geolocation.lng, 'geolocation.lng');

  // MovieGlu accepts geolocation in "lat;lng" format.
  return `${geolocation.lat};${geolocation.lng}`;
}

function toListQuery(params: ListParams): { n: number } {
  assertPositiveInteger(params.limit, 'limit');
  return { n: params.limit };
}

function toCinemaShowTimesQuery(params: CinemaShowTimesParams): {
  cinema_id: number;
  date: string;
  sort: SortType;
  film_id?: number;
} {
  assertPositiveInteger(params.cinemaId, 'cinemaId');
  assertDateString(params.date, 'date');

  if (params.filmId !== undefined) {
    assertPositiveInteger(params.filmId, 'filmId');
  }

  return {
    cinema_id: params.cinemaId,
    date: params.date,
    sort: params.sort ?? SORT_TYPE.POPULARITY,
    film_id: params.filmId,
  };
}

export const MOVIE_GLU = {
  FILM_NOWSHOWING(limit: number): string {
    assertPositiveInteger(limit, 'limit');
    return buildUrl(ENDPOINT_PATH.FILM_NOWSHOWING, { n: limit });
  },
  CINEMA_NEARBY(limit: number): string {
    assertPositiveInteger(limit, 'limit');
    return buildUrl(ENDPOINT_PATH.CINEMA_NEARBY, { n: limit });
  },
  FILMS_COMING_SOON(limit: number): string {
    assertPositiveInteger(limit, 'limit');
    return buildUrl(ENDPOINT_PATH.FILMS_COMING_SOON, { n: limit });
  },
  FILMS_DETAIL(id: number): string {
    assertPositiveInteger(id, 'id');
    return buildUrl(ENDPOINT_PATH.FILMS_DETAIL, { film_id: id });
  },
  CINEMA_DETAIL(id: number): string {
    assertPositiveInteger(id, 'id');
    return buildUrl(ENDPOINT_PATH.CINEMA_DETAIL, { cinema_id: id });
  },
  CINEMA_SHOWTIME(params: CinemaShowTimesParams): string {
    return buildUrl(ENDPOINT_PATH.CINEMA_SHOWTIME, toCinemaShowTimesQuery(params));
  },
};

export function createMovieGluClient(config: MovieGluClientConfig): MovieGluSdk {
  if (typeof config.apiKey !== 'string' || !config.apiKey.trim()) {
    throw new TypeError('apiKey is required');
  }

  const client = {
    baseUrl: normalizeBaseUrl(config.baseUrl ?? DEFAULT_BASE_URL),
    apiKey: config.apiKey,
    headers: config.headers,
    geolocation: config.geolocation,
    fetch: config.fetch,
  };

  return {
    films: {
      nowShowing(params: ListParams): Promise<FilmsNowShowing> {
        return httpRequest<FilmsNowShowing>(client, ENDPOINT_PATH.FILM_NOWSHOWING, {
          queryParams: toListQuery(params),
        });
      },
      comingSoon(params: ListParams): Promise<FilmsComingSoonResponse> {
        return httpRequest<FilmsComingSoonResponse>(client, ENDPOINT_PATH.FILMS_COMING_SOON, {
          queryParams: toListQuery(params),
        });
      },
      details(id: number): Promise<FilmDetailsResponse> {
        assertPositiveInteger(id, 'id');
        return httpRequest<FilmDetailsResponse>(client, ENDPOINT_PATH.FILMS_DETAIL, {
          queryParams: { film_id: id },
        });
      },
    },
    cinemas: {
      nearby(params: CinemasNearbyParams, options?: CinemasNearbyRequestOptions): Promise<CinemasNearbyResponse> {
        const geolocationHeader = options?.headers?.geolocation;
        const geolocation = geolocationHeader ?? client.geolocation;
        if (!geolocation) {
          throw new TypeError(
            'geolocation header is required for cinemas.nearby. Pass nearby(..., { headers: { geolocation } }) or createMovieGluClient({ geolocation }).',
          );
        }

        return httpRequest<CinemasNearbyResponse>(client, ENDPOINT_PATH.CINEMA_NEARBY, {
          queryParams: toListQuery(params),
          headers: {
            ...options?.headers,
            geolocation: formatGeolocationHeader(geolocation),
          },
        });
      },
      details(id: number, options?: CinemaDetailsRequestOptions): Promise<CinemaDetailsResponse> {
        assertPositiveInteger(id, 'id');
        const geolocationHeader = options?.headers?.geolocation;

        return httpRequest<CinemaDetailsResponse>(client, ENDPOINT_PATH.CINEMA_DETAIL, {
          queryParams: { cinema_id: id },
          headers: {
            ...options?.headers,
            ...(geolocationHeader ? { geolocation: formatGeolocationHeader(geolocationHeader) } : {}),
          },
        });
      },
      showTimes(params: CinemaShowTimesParams): Promise<CinemaShowTimesResponse> {
        return httpRequest<CinemaShowTimesResponse>(client, ENDPOINT_PATH.CINEMA_SHOWTIME, {
          queryParams: toCinemaShowTimesQuery(params),
        });
      },
    },
  };
}

export * from './error';
export * from './type';
