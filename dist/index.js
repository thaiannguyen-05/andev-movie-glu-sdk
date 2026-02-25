var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_BASE_URL: () => DEFAULT_BASE_URL,
  MOVIE_GLU: () => MOVIE_GLU,
  MovieGluError: () => MovieGluError,
  SORT_TYPE: () => SORT_TYPE,
  createMovieGluClient: () => createMovieGluClient
});
module.exports = __toCommonJS(index_exports);

// src/error.ts
var MovieGluError = class extends Error {
  status;
  code;
  details;
  constructor(message, options) {
    super(message);
    this.name = "MovieGluError";
    this.status = (options == null ? void 0 : options.status) ?? 0;
    this.code = options == null ? void 0 : options.code;
    this.details = options == null ? void 0 : options.details;
  }
};

// src/http.ts
function resolveFetch(customFetch) {
  if (customFetch) return customFetch;
  const runtimeFetch = globalThis.fetch;
  if (!runtimeFetch) {
    throw new MovieGluError(
      "Fetch API is not available. Pass a fetch implementation in createMovieGluClient({ fetch })."
    );
  }
  return runtimeFetch;
}
async function parseResponse(response) {
  var _a, _b;
  const contentType = ((_b = (_a = response.headers) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, "content-type")) ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function getErrorMessage(payload, status) {
  if (typeof payload === "object" && payload) {
    const record = payload;
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
    const statusPayload = record.status;
    if (typeof statusPayload === "object" && statusPayload) {
      const nested = statusPayload;
      if (typeof nested.message === "string" && nested.message.trim()) {
        return nested.message;
      }
    }
  }
  return `MovieGlu request failed with status ${status}`;
}
async function httpRequest(client, path, options = {}) {
  const fetcher = resolveFetch(client.fetch);
  const url = new URL(path, client.baseUrl);
  if (options.queryParams) {
    for (const [key, value] of Object.entries(options.queryParams)) {
      if (value === void 0 || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  const headers = {
    Accept: "application/json",
    "x-api-key": client.apiKey,
    ...client.headers,
    ...options.headers
  };
  if (options.body) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }
  const response = await fetcher(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : void 0
  });
  const payload = await parseResponse(response);
  if (!response.ok) {
    const message = getErrorMessage(payload, response.status);
    throw new MovieGluError(message, {
      status: response.status,
      details: payload
    });
  }
  return payload;
}

// src/type.ts
var SORT_TYPE = {
  ALPHABETICAL: "alphabetical",
  POPULARITY: "popularity"
};

// src/index.ts
var DEFAULT_BASE_URL = "https://api-gate2.movieglu.com";
var ENDPOINT_PATH = {
  FILM_NOWSHOWING: "/filmsNowShowing",
  CINEMA_NEARBY: "/cinemasNearby",
  FILMS_COMING_SOON: "/filmsComingSoon",
  FILMS_DETAIL: "/filmDetails/",
  CINEMA_DETAIL: "/cinemaDetails/",
  CINEMA_SHOWTIME: "/cinemaShowTimes/"
};
function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, "");
}
function buildUrl(path, queryParams, baseUrl = DEFAULT_BASE_URL) {
  const url = new URL(path, `${normalizeBaseUrl(baseUrl)}/`);
  if (!queryParams) {
    return url.toString();
  }
  for (const [key, value] of Object.entries(queryParams)) {
    if (value === void 0 || value === null) continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}
function assertPositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}
function assertDateString(value, name) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError(`${name} must be in YYYY-MM-DD format`);
  }
}
function toListQuery(params) {
  assertPositiveInteger(params.limit, "limit");
  return { n: params.limit };
}
function toCinemaShowTimesQuery(params) {
  assertPositiveInteger(params.cinemaId, "cinemaId");
  assertDateString(params.date, "date");
  if (params.filmId !== void 0) {
    assertPositiveInteger(params.filmId, "filmId");
  }
  return {
    cinema_id: params.cinemaId,
    date: params.date,
    sort: params.sort ?? SORT_TYPE.POPULARITY,
    film_id: params.filmId
  };
}
var MOVIE_GLU = {
  FILM_NOWSHOWING(limit) {
    assertPositiveInteger(limit, "limit");
    return buildUrl(ENDPOINT_PATH.FILM_NOWSHOWING, { n: limit });
  },
  CINEMA_NEARBY(limit) {
    assertPositiveInteger(limit, "limit");
    return buildUrl(ENDPOINT_PATH.CINEMA_NEARBY, { n: limit });
  },
  FILMS_COMING_SOON(limit) {
    assertPositiveInteger(limit, "limit");
    return buildUrl(ENDPOINT_PATH.FILMS_COMING_SOON, { n: limit });
  },
  FILMS_DETAIL(id) {
    assertPositiveInteger(id, "id");
    return buildUrl(ENDPOINT_PATH.FILMS_DETAIL, { film_id: id });
  },
  CINEMA_DETAIL(id) {
    assertPositiveInteger(id, "id");
    return buildUrl(ENDPOINT_PATH.CINEMA_DETAIL, { cinema_id: id });
  },
  CINEMA_SHOWTIME(params) {
    return buildUrl(ENDPOINT_PATH.CINEMA_SHOWTIME, toCinemaShowTimesQuery(params));
  }
};
function createMovieGluClient(config) {
  if (typeof config.apiKey !== "string" || !config.apiKey.trim()) {
    throw new TypeError("apiKey is required");
  }
  const client = {
    baseUrl: normalizeBaseUrl(config.baseUrl ?? DEFAULT_BASE_URL),
    apiKey: config.apiKey,
    headers: config.headers,
    fetch: config.fetch
  };
  return {
    films: {
      nowShowing(params) {
        return httpRequest(client, ENDPOINT_PATH.FILM_NOWSHOWING, {
          queryParams: toListQuery(params)
        });
      },
      comingSoon(params) {
        return httpRequest(client, ENDPOINT_PATH.FILMS_COMING_SOON, {
          queryParams: toListQuery(params)
        });
      },
      details(id) {
        assertPositiveInteger(id, "id");
        return httpRequest(client, ENDPOINT_PATH.FILMS_DETAIL, {
          queryParams: { film_id: id }
        });
      }
    },
    cinemas: {
      nearby(params) {
        return httpRequest(client, ENDPOINT_PATH.CINEMA_NEARBY, {
          queryParams: toListQuery(params)
        });
      },
      details(id) {
        assertPositiveInteger(id, "id");
        return httpRequest(client, ENDPOINT_PATH.CINEMA_DETAIL, {
          queryParams: { cinema_id: id }
        });
      },
      showTimes(params) {
        return httpRequest(client, ENDPOINT_PATH.CINEMA_SHOWTIME, {
          queryParams: toCinemaShowTimesQuery(params)
        });
      }
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_BASE_URL,
  MOVIE_GLU,
  MovieGluError,
  SORT_TYPE,
  createMovieGluClient
});
