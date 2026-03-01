export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  body?: Record<string, unknown>;
};

export const SORT_TYPE = {
  ALPHABETICAL: 'alphabetical',
  POPULARITY: 'popularity',
} as const;

export type SortType = (typeof SORT_TYPE)[keyof typeof SORT_TYPE];

export type FetchLike = (
  input: string,
  init?: Record<string, unknown>,
) => Promise<{
  ok: boolean;
  status: number;
  headers?: { get(name: string): string | null };
  json(): Promise<unknown>;
  text(): Promise<string>;
}>;

export type Client = {
  baseUrl: string;
  apiKey: string;
  headers?: Record<string, string>;
  geolocation?: GeolocationInput;
  fetch?: FetchLike;
};

export type MovieGluClientConfig = {
  apiKey?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  geolocation?: GeolocationInput;
  fetch?: FetchLike;
};

export type CinemaShowTimesParams = {
  date: string;
  cinemaId: number;
  filmId?: number;
  sort?: SortType;
};

export const IMAGE_SIZE_CATEGORY = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  XLARGE: 'xlarge',
  XXLARGE: 'xxlarge',
} as const;

export type ImageSizeCategory = (typeof IMAGE_SIZE_CATEGORY)[keyof typeof IMAGE_SIZE_CATEGORY];

export type FilmDetailsParams = {
  filmId: number;
  sizeCategory?: ImageSizeCategory | ImageSizeCategory[];
};

export type FilmShowTimesParams = {
  date: string;
  filmId: number;
  limit?: number;
};

export type ListParams = {
  limit?: number;
};

export type GeolocationInput = string | UserLocation;

export type CinemasNearbyParams = ListParams;

export type CinemasNearbyRequestOptions = Pick<RequestOptions, 'headers'>;
export type CinemaDetailsRequestOptions = Pick<RequestOptions, 'headers'>;

export type MovieGluSdk = {
  films: {
    nowShowing(params: ListParams): Promise<FilmsNowShowing>;
    comingSoon(params: ListParams): Promise<FilmsComingSoonResponse>;
    details(idOrParams: number | FilmDetailsParams): Promise<FilmDetailsResponse>;
    showTimes(params: FilmShowTimesParams): Promise<FilmShowTimesResponse>;
  };
  cinemas: {
    nearby(params: CinemasNearbyParams, options?: CinemasNearbyRequestOptions): Promise<CinemasNearbyResponse>;
    details(id: number, options?: CinemaDetailsRequestOptions): Promise<CinemaDetailsResponse>;
    showTimes(params: CinemaShowTimesParams): Promise<CinemaShowTimesResponse>;
  };
};

export type UserLocation = {
  lat: number;
  lng: number;
  source: 'fe' | 'ip' | 'default';
};

export type CinemasNearbyResponse = {
  cinemas: Cinema[];
  status: Status;
};

export type FilmsNowShowing = {
  films: Film[];
  status: Status;
};

export type FilmsComingSoonResponse = {
  films: FilmComingSoon[];
  status: Status;
};

export type FilmDetailsResponse = {
  film_id: number;
  imdb_id?: number;
  imdb_title_id?: string;
  film_name: string;
  other_titles?: OtherTitles;
  version_type?: string;
  images: FilmImages;
  synopsis_long: string;
  distributor_id?: number;
  distributor?: string;
  release_dates: ReleaseDate[];
  age_rating: AgeRating[];
  duration_mins?: number;
  review_stars?: number;
  review_txt?: string;
  trailers: Trailers | null;
  genres: Genre[];
  cast: Cast[];
  directors: Director[];
  producers: Producer[];
  writers: Writer[];
  show_dates: ShowDate[];
  alternate_versions: AlternateVersion[];
  status: Status;
};

export type CinemaDetailsResponse = {
  cinema_id: number;
  cinema_name: string;
  address: string;
  address2?: string;
  city: string;
  state?: string;
  county?: string;
  country?: string;
  postcode: string;
  phone?: string;
  lat: number;
  lng: number;
  distance?: number;
  ticketing?: number;
  directions?: string;
  logo_url?: string;
  show_dates: ShowDate[];
  status: Status;
};

export type CinemaShowTimesResponse = {
  cinema: CinemaShowTimesCinema;
  films: CinemaShowTimesFilm[];
  status: Status;
};

export type FilmShowTimesResponse = {
  film: FilmShowTimesFilm;
  cinemas: FilmShowTimesCinema[];
  status: Status;
};

export type KeyNumberObject<T> = Record<`${number}`, T>;

export type Status = {
  count: number;
  state: string;
  method: string;
  message: string | null;
  request_method: string;
  version: string;
  territory: string;
  device_datetime_sent: string;
  device_datetime_used: string;
};

export type OtherTitles = Record<string, string>;

export type ReleaseDate = {
  release_date: string;
  notes?: string;
};

export type AgeRating = {
  rating: string;
  age_rating_image?: string;
  age_advisory?: string;
};

export type FilmImageSize = {
  film_image: string;
  width: number;
  height: number;
};

export type Poster = {
  image_orientation: string;
  region: string;
  medium: FilmImageSize;
};

export type Still = {
  image_orientation: string;
  medium: FilmImageSize;
};

export type FilmImages = {
  poster?: KeyNumberObject<Poster>;
  still?: KeyNumberObject<Still>;
};

export type ShowDate = {
  date: string;
};

export type Cinema = {
  cinema_id: number;
  cinema_name: string;
  address: string;
  address2?: string;
  city: string;
  state?: string;
  county?: string;
  country?: string;
  postcode: string;
  phone?: string;
  lat: number;
  lng: number;
  distance: number;
  ticketing?: number;
  directions?: string;
  logo_url: string;
};

export type Film = {
  film_id: number;
  imdb_id?: number;
  imdb_title_id?: string;
  film_name: string;
  other_titles?: OtherTitles;
  release_dates: ReleaseDate[];
  age_rating: AgeRating[];
  film_trailer: string | null;
  synopsis_long: string;
  images: FilmImages;
};

export type FilmComingSoon = {
  film_id: number;
  imdb_id?: number;
  imdb_title_id?: string;
  film_name: string;
  other_titles?: OtherTitles;
  release_dates: ReleaseDate[];
  age_rating: AgeRating[];
  film_trailer: string | null;
  synopsis_long: string;
  images: FilmImages;
};

export type Genre = {
  genre_id: number;
  genre_name: string;
};

export type Cast = {
  cast_id: number;
  cast_name: string;
};

export type Director = {
  director_id: number;
  director_name: string;
};

export type Producer = {
  producer_id: number;
  producer_name: string;
};

export type Writer = {
  writer_id: number;
  writer_name: string;
};

export type AlternateVersion = {
  film_id: number;
  film_name: string;
  version_type: string;
};

export type TrailerItem = {
  film_trailer: string;
  trailer_image?: string;
  version?: number;
  quality?: string;
  region?: string;
};

export type Trailers = {
  [quality: string]: TrailerItem[];
};

export type ShowtimeTime = {
  start_time: string;
  end_time: string;
};

export type ShowtimeGroup = {
  film_id: number;
  film_name: string;
  times: ShowtimeTime[];
};

export type Showings = Record<string, ShowtimeGroup>;

export type CinemaShowTimesCinema = {
  cinema_id: number;
  cinema_name: string;
};

export type CinemaShowTimesFilm = {
  film_id: number;
  imdb_id?: number;
  imdb_title_id?: string;
  film_name: string;
  other_titles?: OtherTitles;
  version_type: string;
  age_rating: AgeRating[];
  film_image: string;
  film_image_height: number;
  film_image_width: number;
  showings: Showings;
  show_dates: ShowDate[];
};

export type FilmShowTimesFilm = {
  film_id: number;
  imdb_id?: number;
  imdb_title_id?: string;
  film_name: string;
  other_titles?: OtherTitles;
  version_type: string;
  age_rating: AgeRating[];
  film_image: string;
  film_image_height: number;
  film_image_width: number;
};

export type FilmShowTimesCinema = {
  cinema_id: number;
  cinema_name: string;
  distance: number;
  logo_url: string;
  showings: Showings;
};
