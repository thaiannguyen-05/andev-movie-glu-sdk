import { httpRequest } from './http';
import type {
  CinemaDetailsRequestOptions,
  CinemaShowTimesParams,
  CinemaShowTimesResponse,
  CinemaDetailsResponse,
  CinemasNearbyParams,
  CinemasNearbyRequestOptions,
  CinemasNearbyResponse,
  FilmDetailsParams,
  FilmDetailsResponse,
  FilmShowTimesParams,
  FilmShowTimesResponse,
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
  FILM_SHOWTIME: '/filmShowTimes',
  CINEMA_NEARBY: '/cinemasNearby',
  FILMS_COMING_SOON: '/filmsComingSoon',
  FILMS_DETAIL: '/filmDetails/',
  CINEMA_DETAIL: '/cinemaDetails/',
  CINEMA_SHOWTIME: '/cinemaShowTimes/',
} as const;

const DEFAULT_API_KEY = 'Bcg2m9aHOI8QSg5h8EDNK8ecPZRTiove3dsbZVuz';
const DEFAULT_LIST_LIMIT = 10;
const VALID_IMAGE_SIZE_CATEGORIES = new Set(['small', 'medium', 'large', 'xlarge', 'xxlarge']);

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
  const limit = params.limit ?? DEFAULT_LIST_LIMIT;
  assertPositiveInteger(limit, 'limit');
  return { n: limit };
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

function toFilmShowTimesQuery(params: FilmShowTimesParams): { date: string; film_id: number; n?: number } {
  assertDateString(params.date, 'date');
  assertPositiveInteger(params.filmId, 'filmId');

  if (params.limit !== undefined) {
    assertPositiveInteger(params.limit, 'limit');
  }

  return {
    date: params.date,
    film_id: params.filmId,
    n: params.limit,
  };
}

function normalizeFilmDetailsInput(input: number | FilmDetailsParams): { film_id: number; size_category?: string } {
  const details = typeof input === 'number' ? { filmId: input } : input;
  assertPositiveInteger(details.filmId, 'filmId');

  if (!details.sizeCategory) {
    return { film_id: details.filmId };
  }

  const sizeCategoryRaw = Array.isArray(details.sizeCategory)
    ? details.sizeCategory.join(',')
    : details.sizeCategory;

  const normalizedValues = sizeCategoryRaw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (normalizedValues.length === 0 || normalizedValues.some((value) => !VALID_IMAGE_SIZE_CATEGORIES.has(value))) {
    throw new TypeError('sizeCategory must be one or more of: small, medium, large, xlarge, xxlarge');
  }

  return {
    film_id: details.filmId,
    size_category: normalizedValues.join(','),
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
  FILM_SHOWTIME(params: FilmShowTimesParams): string {
    return buildUrl(ENDPOINT_PATH.FILM_SHOWTIME, toFilmShowTimesQuery(params));
  },
  FILMS_DETAIL(idOrParams: number | FilmDetailsParams): string {
    return buildUrl(ENDPOINT_PATH.FILMS_DETAIL, normalizeFilmDetailsInput(idOrParams));
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
  const resolvedApiKey = (config.apiKey ?? DEFAULT_API_KEY).trim();
  if (!resolvedApiKey) {
    throw new TypeError('apiKey must not be empty');
  }

  const client = {
    baseUrl: normalizeBaseUrl(config.baseUrl ?? DEFAULT_BASE_URL),
    apiKey: resolvedApiKey,
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
      details(idOrParams: number | FilmDetailsParams): Promise<FilmDetailsResponse> {
        return httpRequest<FilmDetailsResponse>(client, ENDPOINT_PATH.FILMS_DETAIL, {
          queryParams: normalizeFilmDetailsInput(idOrParams),
        });
      },
      showTimes(params: FilmShowTimesParams): Promise<FilmShowTimesResponse> {
        return httpRequest<FilmShowTimesResponse>(client, ENDPOINT_PATH.FILM_SHOWTIME, {
          queryParams: toFilmShowTimesQuery(params),
        });
      },
    },
    cinemas: {
      nearby(params: CinemasNearbyParams, options?: CinemasNearbyRequestOptions): Promise<CinemasNearbyResponse> {
        const geolocationHeader = options?.headers?.geolocation;
        const geolocation = geolocationHeader ?? client.geolocation;

        return httpRequest<CinemasNearbyResponse>(client, ENDPOINT_PATH.CINEMA_NEARBY, {
          queryParams: toListQuery(params),
          headers: {
            ...options?.headers,
            ...(geolocation ? { geolocation: formatGeolocationHeader(geolocation) } : {}),
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
