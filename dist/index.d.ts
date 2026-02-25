type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    queryParams?: Record<string, string | number | boolean | null | undefined>;
    body?: Record<string, unknown>;
};
declare const SORT_TYPE: {
    readonly ALPHABETICAL: "alphabetical";
    readonly POPULARITY: "popularity";
};
type SortType = (typeof SORT_TYPE)[keyof typeof SORT_TYPE];
type FetchLike = (input: string, init?: Record<string, unknown>) => Promise<{
    ok: boolean;
    status: number;
    headers?: {
        get(name: string): string | null;
    };
    json(): Promise<unknown>;
    text(): Promise<string>;
}>;
type Client = {
    baseUrl: string;
    apiKey: string;
    headers?: Record<string, string>;
    fetch?: FetchLike;
};
type MovieGluClientConfig = {
    apiKey: string;
    baseUrl?: string;
    headers?: Record<string, string>;
    fetch?: FetchLike;
};
type CinemaShowTimesParams = {
    date: string;
    cinemaId: number;
    filmId?: number;
    sort?: SortType;
};
type ListParams = {
    limit: number;
};
type MovieGluSdk = {
    films: {
        nowShowing(params: ListParams): Promise<FilmsNowShowing>;
        comingSoon(params: ListParams): Promise<FilmsComingSoonResponse>;
        details(id: number): Promise<FilmDetailsResponse>;
    };
    cinemas: {
        nearby(params: ListParams): Promise<CinemasNearbyResponse>;
        details(id: number): Promise<CinemaDetailsResponse>;
        showTimes(params: CinemaShowTimesParams): Promise<CinemaShowTimesResponse>;
    };
};
type UserLocation = {
    lat: number;
    lng: number;
    source: 'fe' | 'ip' | 'default';
};
type CinemasNearbyResponse = {
    cinemas: Cinema[];
    status: Status;
};
type FilmsNowShowing = {
    films: Film[];
    status: Status;
};
type FilmsComingSoonResponse = {
    films: FilmComingSoon[];
    status: Status;
};
type FilmDetailsResponse = {
    film_id: number;
    imdb_id: number;
    imdb_title_id: string;
    film_name: string;
    other_titles: OtherTitles;
    version_type: string;
    images: FilmImages;
    synopsis_long: string;
    distributor_id: number;
    distributor: string;
    release_dates: ReleaseDate[];
    age_rating: AgeRating[];
    duration_mins: number;
    review_stars: number;
    review_txt: string;
    trailers: Trailer[] | null;
    genres: Genre[];
    cast: Cast[];
    directors: Director[];
    producers: Producer[];
    writers: Writer[];
    show_dates: ShowDate[];
    alternate_versions: AlternateVersion[];
    status: Status;
};
type CinemaDetailsResponse = {
    cinema_id: number;
    cinema_name: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    county: string;
    country: string;
    postcode: string;
    phone: string;
    lat: number;
    lng: number;
    distance: number;
    ticketing: number;
    directions: string;
    logo_url: string;
    show_dates: ShowDate[];
    status: Status;
};
type CinemaShowTimesResponse = {
    cinema: CinemaShowTimesCinema;
    films: CinemaShowTimesFilm[];
    status: Status;
};
type FilmShowTimesResponse = {
    film: FilmShowTimesFilm;
    cinemas: FilmShowTimesCinema[];
    status: Status;
};
type KeyNumberObject<T> = Record<`${number}`, T>;
type Status = {
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
type OtherTitles = Record<string, string>;
type ReleaseDate = {
    release_date: string;
    notes: string;
};
type AgeRating = {
    rating: string;
    age_rating_image: string;
    age_advisory: string;
};
type FilmImageSize = {
    film_image: string;
    width: number;
    height: number;
};
type Poster = {
    image_orientation: string;
    region: string;
    medium: FilmImageSize;
};
type Still = {
    image_orientation: string;
    medium: FilmImageSize;
};
type FilmImages = {
    poster: KeyNumberObject<Poster>;
    still: KeyNumberObject<Still>;
};
type ShowDate = {
    date: string;
};
type Cinema = {
    cinema_id: number;
    cinema_name: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    county: string;
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
type Film = {
    film_id: number;
    imdb_id: number;
    imdb_title_id: string;
    film_name: string;
    other_titles?: OtherTitles;
    release_dates: ReleaseDate[];
    age_rating: AgeRating[];
    film_trailer: string | null;
    synopsis_long: string;
    images: FilmImages;
};
type FilmComingSoon = {
    film_id: number;
    imdb_id: number;
    imdb_title_id: string;
    film_name: string;
    other_titles: OtherTitles;
    release_dates: ReleaseDate[];
    age_rating: AgeRating[];
    film_trailer: string | null;
    synopsis_long: string;
    images: FilmImages;
};
type Genre = {
    genre_id: number;
    genre_name: string;
};
type Cast = {
    cast_id: number;
    cast_name: string;
};
type Director = {
    director_id: number;
    director_name: string;
};
type Producer = {
    producer_id: number;
    producer_name: string;
};
type Writer = {
    writer_id: number;
    writer_name: string;
};
type AlternateVersion = {
    film_id: number;
    film_name: string;
    version_type: string;
};
type Trailer = {
    trailer_url?: string;
    trailer_image?: string;
    trailer_type?: string;
    [key: string]: string | number | boolean | null | undefined;
};
type ShowtimeTime = {
    start_time: string;
    end_time: string;
};
type ShowtimeGroup = {
    film_id: number;
    film_name: string;
    times: ShowtimeTime[];
};
type Showings = Record<string, ShowtimeGroup>;
type CinemaShowTimesCinema = {
    cinema_id: number;
    cinema_name: string;
};
type CinemaShowTimesFilm = {
    film_id: number;
    imdb_id: number;
    imdb_title_id: string;
    film_name: string;
    other_titles: OtherTitles;
    version_type: string;
    age_rating: AgeRating[];
    film_image: string;
    film_image_height: number;
    film_image_width: number;
    showings: Showings;
    show_dates: ShowDate[];
};
type FilmShowTimesFilm = {
    film_id: number;
    imdb_id: number;
    imdb_title_id: string;
    film_name: string;
    other_titles: OtherTitles;
    version_type: string;
    age_rating: AgeRating[];
    film_image: string;
    film_image_height: number;
    film_image_width: number;
};
type FilmShowTimesCinema = {
    cinema_id: number;
    cinema_name: string;
    distance: number;
    logo_url: string;
    showings: Showings;
};

declare class MovieGluError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly details?: unknown;
    constructor(message: string, options?: {
        status?: number;
        code?: string;
        details?: unknown;
    });
}

declare const DEFAULT_BASE_URL = "https://api-gate2.movieglu.com";
declare const MOVIE_GLU: {
    FILM_NOWSHOWING(limit: number): string;
    CINEMA_NEARBY(limit: number): string;
    FILMS_COMING_SOON(limit: number): string;
    FILMS_DETAIL(id: number): string;
    CINEMA_DETAIL(id: number): string;
    CINEMA_SHOWTIME(params: CinemaShowTimesParams): string;
};
declare function createMovieGluClient(config: MovieGluClientConfig): MovieGluSdk;

export { type AgeRating, type AlternateVersion, type Cast, type Cinema, type CinemaDetailsResponse, type CinemaShowTimesCinema, type CinemaShowTimesFilm, type CinemaShowTimesParams, type CinemaShowTimesResponse, type CinemasNearbyResponse, type Client, DEFAULT_BASE_URL, type Director, type FetchLike, type Film, type FilmComingSoon, type FilmDetailsResponse, type FilmImageSize, type FilmImages, type FilmShowTimesCinema, type FilmShowTimesFilm, type FilmShowTimesResponse, type FilmsComingSoonResponse, type FilmsNowShowing, type Genre, type KeyNumberObject, type ListParams, MOVIE_GLU, type MovieGluClientConfig, MovieGluError, type MovieGluSdk, type OtherTitles, type Poster, type Producer, type ReleaseDate, type RequestOptions, SORT_TYPE, type ShowDate, type Showings, type ShowtimeGroup, type ShowtimeTime, type SortType, type Status, type Still, type Trailer, type UserLocation, type Writer, createMovieGluClient };
