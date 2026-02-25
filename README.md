# @andev2005/movie-glu-sdk

SDK Node.js/TypeScript để gọi MovieGlu API (phim đang chiếu, phim sắp chiếu, rạp gần đây, chi tiết phim/rạp, lịch chiếu).

## Cài đặt

```bash
pnpm add @andev2005/movie-glu-sdk
```

Hoặc:

```bash
npm i @andev2005/movie-glu-sdk
```

## Yêu cầu

- Có `apiKey` của MovieGlu
- Runtime có `fetch` (Node.js 18+) hoặc truyền `fetch` custom vào client

## Sử dụng nhanh

### TypeScript / JavaScript

```ts
import { createMovieGluClient } from '@andev2005/movie-glu-sdk';

const movieGlu = createMovieGluClient({
  apiKey: process.env.MOVIE_GLU_API_KEY!,
});

async function main() {
  const nowShowing = await movieGlu.films.nowShowing({ limit: 10 });
  console.log(nowShowing.films);

  const comingSoon = await movieGlu.films.comingSoon({ limit: 10 });
  console.log(comingSoon.films);

  const cinemas = await movieGlu.cinemas.nearby({ limit: 5 });
  console.log(cinemas.cinemas);
}

main().catch(console.error);
```

## Khởi tạo client

```ts
import { createMovieGluClient } from '@andev2005/movie-glu-sdk';

const client = createMovieGluClient({
  apiKey: 'your-api-key',
  // Tuỳ chọn:
  // baseUrl: 'https://api-gate2.movieglu.com',
  // headers: { 'x-custom-header': 'value' },
  // fetch: customFetch, // dùng khi môi trường không có global fetch
});
```

## API hiện có

### `films`

```ts
// Phim đang chiếu
await client.films.nowShowing({ limit: 10 });

// Phim sắp chiếu
await client.films.comingSoon({ limit: 10 });

// Chi tiết phim
await client.films.details(12345);
```

### `cinemas`

```ts
// Rạp gần đây
await client.cinemas.nearby({ limit: 10 });

// Chi tiết rạp
await client.cinemas.details(1001);

// Lịch chiếu rạp theo ngày
await client.cinemas.showTimes({
  cinemaId: 1001,
  date: '2026-02-25', // YYYY-MM-DD
});
```

### Lọc lịch chiếu theo phim + sắp xếp

```ts
import { SORT_TYPE } from '@andev2005/movie-glu-sdk';

await client.cinemas.showTimes({
  cinemaId: 1001,
  filmId: 12345,
  date: '2026-02-25',
  sort: SORT_TYPE.POPULARITY, // hoặc SORT_TYPE.ALPHABETICAL
});
```

## Xử lý lỗi

SDK sẽ throw `MovieGluError` nếu request thất bại (HTTP status không thành công).

```ts
import { MovieGluError } from '@andev2005/movie-glu-sdk';

try {
  const data = await client.films.nowShowing({ limit: 10 });
  console.log(data);
} catch (error) {
  if (error instanceof MovieGluError) {
    console.error('MovieGluError:', error.message);
    console.error('status:', error.status);
    console.error('details:', error.details);
  } else {
    console.error(error);
  }
}
```

## Validate tham số

SDK có kiểm tra đầu vào và sẽ throw `TypeError` nếu:

- `apiKey` bị thiếu/rỗng
- `limit` không phải số nguyên dương
- `id`, `cinemaId`, `filmId` không phải số nguyên dương
- `date` không đúng định dạng `YYYY-MM-DD`

## Utility build URL (tuỳ chọn)

Nếu bạn chỉ muốn lấy URL endpoint (không gửi request), có thể dùng `MOVIE_GLU`:

```ts
import { MOVIE_GLU } from '@andev2005/movie-glu-sdk';

const url = MOVIE_GLU.FILM_NOWSHOWING(10);
console.log(url);
```

Các helper có sẵn:

- `MOVIE_GLU.FILM_NOWSHOWING(limit)`
- `MOVIE_GLU.CINEMA_NEARBY(limit)`
- `MOVIE_GLU.FILMS_COMING_SOON(limit)`
- `MOVIE_GLU.FILMS_DETAIL(id)`
- `MOVIE_GLU.CINEMA_DETAIL(id)`
- `MOVIE_GLU.CINEMA_SHOWTIME({ cinemaId, date, filmId?, sort? })`

## Export chính

- `createMovieGluClient`
- `MOVIE_GLU`
- `SORT_TYPE`
- `MovieGluError`
- Tất cả TypeScript types (`FilmDetailsResponse`, `CinemaShowTimesResponse`, ...)

## Build package

```bash
npm run build
```
