# Sistem Manajemen Armada

Aplikasi frontend untuk memantau kendaraan MBTA secara real-time melalui [MBTA V3 API](https://api-v3.mbta.com/docs/swagger/index.html). Fiturnya:

- Daftar kendaraan dalam grid card dengan pagination server-side.
- Filter multi-pilih berdasarkan Rute dan Trip, dengan opsi yang dimuat lewat infinite scroll.
- Popup detail kendaraan dengan peta Leaflet.

## Cara menjalankan

Prasyarat: Node.js `^20.19` atau `>=22.12`, dan Yarn 1.x.

```bash
yarn install
cp .env.example .env.local
yarn dev
```

Setelah `cp`, isi `VITE_MBTA_API_KEY` di `.env.local`. Aplikasi lalu terbuka di http://localhost:5173.

API key bersifat opsional. Tanpa key, MBTA membatasi request jauh lebih ketat dan aplikasi akan menampilkan pesan batas permintaan. Dengan key, batasnya 1000 request per menit.

| Perintah            | Fungsi                                   |
| ------------------- | ---------------------------------------- |
| `yarn dev`          | Menjalankan server development           |
| `yarn build`        | Type-check dan build produksi ke `dist/` |
| `yarn preview`      | Menjalankan hasil build                  |
| `yarn test:run`     | Menjalankan seluruh unit test sekali     |
| `yarn test`         | Unit test dalam mode watch               |
| `yarn lint`         | ESLint                                   |
| `yarn format`       | Merapikan kode dengan Prettier           |
| `yarn format:check` | Mengecek format tanpa mengubah file      |

## Tech stack

| Kebutuhan     | Library                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| UI            | React 19 (functional components dan hooks), TypeScript 6                         |
| Build tool    | Vite 8                                                                           |
| Styling       | Tailwind CSS 4 (`@tailwindcss/vite`), ikon `lucide-react`                        |
| Data fetching | TanStack Query 5 di atas `fetch` bawaan browser                                  |
| Peta          | Leaflet 1.9 dan React Leaflet 5, tile OpenStreetMap                              |
| Kualitas kode | ESLint, Prettier (dengan `prettier-plugin-tailwindcss`), Vitest, Testing Library |

TypeScript sengaja dikunci di `~6.0`, karena `typescript-eslint` belum mendukung TypeScript 7.

## Arsitektur

Komponen disusun dengan pola atomic design. Import lintas folder memakai alias `@/` (mengarah ke `src/`).

```
src/
  main.tsx                Entry point dan konfigurasi QueryClient
  App.tsx                 Merender DashboardPage
  index.css               Tailwind dan design token (warna, font)
  components/
    atoms/                Elemen UI terkecil tanpa logika data
      Button.tsx          Tombol dengan varian primary, secondary, ghost, dan link
      Badge.tsx           Pill berbingkai dengan ikon
      Spinner.tsx         Indikator loading berputar
      Skeleton.tsx        Placeholder abu-abu saat memuat
      Select.tsx          Select native berlabel
      Checkbox.tsx        Kotak centang visual untuk opsi listbox
      ColorSwatch.tsx     Kotak warna rute
    molecules/            Gabungan beberapa atom dengan satu fungsi
      StatusBadge.tsx     Badge status kendaraan (warna, ikon, dan teks)
      FilterChip.tsx      Chip filter aktif dengan tombol hapus
      InfoField.tsx       Pasangan label dan nilai di popup detail
      InfoSection.tsx     Kelompok InfoField berjudul
      ErrorState.tsx      Pesan error dengan detail teknis dan tombol "Coba lagi"
      EmptyState.tsx      Tampilan hasil kosong
      SkeletonCard.tsx    Card placeholder saat memuat
    organisms/            Bagian halaman yang utuh
      Header.tsx          Judul aplikasi dan tombol "Muat ulang"
      FilterBar.tsx       Filter Rute dan Trip, chip aktif, dan reset filter
      MultiSelect.tsx     Dropdown multi-pilih dengan infinite scroll
      VehicleGrid.tsx     Grid card beserta state loading, error, dan kosong
      VehicleCard.tsx     Card kendaraan
      Pagination.tsx      Bar pagination
      VehicleDetail.tsx   Popup detail (native <dialog>)
      VehicleMap.tsx      Peta Leaflet, di-lazy-load
  pages/
    DashboardPage.tsx     State halaman (page, pageSize, filter, kendaraan terpilih) dan susunan organisms
  hooks/                  Pembungkus TanStack Query
    useVehicles.ts        Daftar kendaraan, jumlah halaman, total, dan refresh
    useRouteOptions.ts    Opsi filter Rute
    useTripOptions.ts     Opsi filter Trip berdasarkan rute terpilih
    useVehicleDetail.ts   Detail kendaraan beserta rute, trip, dan halte
  services/               Akses REST API MBTA
    apiClient.ts          fetchJson, ApiError, header API key, offsetFromLink
    vehicleService.ts     getVehicles, getVehicle
    routeService.ts       getRoutes
    tripService.ts        getTrips
  types/
    mbta.ts               Tipe data MBTA dan JSON:API
  utils/                  Fungsi murni tanpa React
    format.ts             Format koordinat, kecepatan, arah, okupansi, dan waktu
    status.ts             Pemetaan status kendaraan
    pagination.ts         Ukuran halaman, nomor halaman, dan perhitungan total
    error.ts              Pesan error yang mudah dipahami
```

Ringkasnya, setiap lapisan punya peran berikut:

- **atoms**: elemen UI dasar yang dipakai ulang di banyak tempat.
- **molecules**: gabungan atom dengan satu tujuan.
- **organisms**: bagian halaman yang lengkap.
- **pages**: menyimpan state halaman dan menyusun organisms.
- **hooks**: membungkus query TanStack Query.
- **services**: memanggil API.
- **types**: menyimpan tipe bersama.
- **utils**: berisi helper murni yang mudah diuji.

### Alur data

1. `services/apiClient.ts` membangun URL dengan `URLSearchParams` lalu memanggil `fetch`. Header `x-api-key` dikirim bila tersedia. Response non-2xx diubah menjadi `ApiError` yang membawa kode status. Respons JSON:API diratakan menjadi objek sederhana, dan relasi `route`/`trip`/`stop` diambil dari `included`.
2. Komponen memakai data lewat hook di `hooks/` yang membungkus TanStack Query:
   - `useQuery` untuk daftar kendaraan dan detail kendaraan.
   - `useInfiniteQuery` untuk opsi Rute dan Trip.

   TanStack Query menangani cache (`staleTime` 30 detik), pembatalan request lama lewat `AbortSignal`, retry hingga 2 kali (kecuali error 4xx), dan state loading/error.

3. State UI seperti halaman, ukuran halaman, filter, dan kendaraan terpilih disimpan dengan `useState` di `pages/DashboardPage.tsx`.

### Endpoint yang dipakai

| Endpoint                                                            | Untuk                                                                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `GET /vehicles?page[limit]&page[offset]&filter[route]&filter[trip]` | Daftar kendaraan                                                                                |
| `GET /vehicles/{id}?include=route,trip,stop`                        | Detail kendaraan beserta rute, trip, dan halte                                                  |
| `GET /routes?page[limit]&page[offset]`                              | Opsi filter Rute                                                                                |
| `GET /trips?filter[route]&page[limit]&page[offset]`                 | Opsi filter Trip. API mewajibkan filter, sehingga dropdown Trip baru aktif setelah rute dipilih |

### Pagination (server-side)

- Halaman diambil dengan `page[limit]` (ukuran halaman: 12/24/48/96) dan `page[offset] = (page - 1) × limit`.
- MBTA tidak mengembalikan total data. Karena itu jumlah halaman dihitung dari `page[offset]` pada `links.last`: `lastOffset / limit + 1`.
- Total data didapat dari satu request ringan ke halaman terakhir (`fields[vehicle]=label`), yaitu `lastOffset + jumlah data di halaman terakhir`.
- `placeholderData: keepPreviousData` menjaga data lama tetap tampil (diredupkan) saat halaman berganti, sehingga layout tidak melompat.
- Mengganti filter atau ukuran halaman mengembalikan ke halaman 1. Kalau data berkurang dan halaman aktif melebihi jumlah halaman, nomor halaman dikoreksi otomatis.

### Filter dan infinite scroll

- Rute dan trip terpilih dikirim sebagai daftar ID yang dipisah koma ke `filter[route]` dan `filter[trip]`.
- Dropdown memakai pola ARIA listbox `aria-multiselectable` dengan navigasi keyboard: panah, Home/End, Spasi/Enter, dan Esc.
- Halaman opsi berikutnya dimuat oleh `IntersectionObserver` ketika elemen sentinel di akhir daftar terlihat. Tombol "Muat lebih banyak" disediakan sebagai cadangan.
- Setiap dropdown punya kolom cari. API MBTA tidak mendukung pencarian teks untuk rute dan trip (`filter[long_name]` dan `filter[headsign]` ditolak), sehingga pencarian dilakukan di sisi klien terhadap opsi yang sudah dimuat. Infinite scroll tetap berjalan saat mencari, jadi data berikutnya ikut dimuat dan disaring.
- Ukuran halaman opsi dibedakan: rute 30 per request (total hanya ±180), trip 500 per request. Satu rute bisa punya ribuan trip (Red Line ±2.900), sehingga 500 per request memangkas jumlah request dari ±98 menjadi 6, dengan ukuran respons hanya ±5,5 KB (gzip).
- Menghapus sebuah rute ikut membuang trip terpilih milik rute tersebut.

### Popup detail dan peta

- Popup memakai `<dialog>` native dengan `showModal()`, sehingga focus trap, tombol Esc, dan backdrop sudah tersedia. Setelah popup ditutup, fokus kembali ke card asal.
- Peta di-lazy-load dengan `React.lazy`, jadi bundle Leaflet hanya diunduh saat popup dibuka. Empat jebakan Leaflet ditangani di `components/organisms/VehicleMap.tsx`:
  1. `leaflet/dist/leaflet.css` di-import.
  2. Ikon marker default yang rusak di bundler diperbaiki dengan meng-import PNG dari `leaflet/dist/images` dan memakai `L.Icon.Default.mergeOptions`.
  3. `map.invalidateSize()` dipanggil saat popup terbuka agar peta tidak abu-abu.
  4. Atribusi OpenStreetMap ditampilkan di `TileLayer`.

### Loading dan error

- Muat pertama menampilkan skeleton card. Saat berganti halaman atau filter, data lama diredupkan dan muncul indikator progres. Popup memakai skeleton per bagian, dan dropdown menampilkan baris "Memuat lagi…".
- Pesan error ditulis dalam bahasa yang mudah dipahami, dibedakan untuk 429 (batas request), 5xx, 404, dan gangguan jaringan. Setiap pesan dilengkapi tombol "Coba lagi" dan detail teknis yang bisa dibuka.
- Hasil kosong ditampilkan berbeda dari error, lengkap dengan tombol reset filter.

### Desain dan aksesibilitas

Gaya yang dipakai adalah minimalis fungsional dengan mode terang dan kontras tinggi:

- Font Fira Sans untuk UI dan Fira Code untuk data seperti label dan koordinat.
- Status kendaraan dibedakan dengan warna, ikon, dan teks sekaligus, jadi tidak bergantung pada warna saja.
- Ring fokus terlihat di semua kontrol, dan halaman aktif ditandai dengan `aria-current`.
- Perubahan konten diumumkan lewat `aria-live`, dan animasi menghormati `prefers-reduced-motion`.

### Catatan keamanan

Variabel berawalan `VITE_` ikut ter-bundle ke kode klien. Hal ini dapat diterima untuk API key MBTA yang publik dan hanya berfungsi sebagai penanda rate limit. `.env.local` tidak ikut ke repository karena sudah tercakup pola `*.local` di `.gitignore`.
