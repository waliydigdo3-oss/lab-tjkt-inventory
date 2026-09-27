# LAB TJKT — Inventory Laboratorium

Aplikasi inventory lab: stok alat & bahan, pembelian (harga + kegunaan), dan
peminjaman dengan persetujuan admin. Tanpa build step, bisa offline, dan bisa
sinkron ke Google Sheets.

## Cara menjalankan

- **Klik ganda `index.html`** — langsung jalan di browser (Chrome/Edge/Firefox/HP).
- Atau lewat server lokal: `python3 -m http.server 8000` lalu buka
  `http://localhost:8000`.
- Agar bisa dibuka siapa saja (online): lihat **`DEPLOY.md`**
  (hosting gratis + domain + Google Sheets).

> Catatan: seluruh file harus tetap dalam satu folder agar saling terhubung.

## Struktur file

```
lab-inventory/
├── index.html          → kerangka halaman + layar login (tanpa style/logika)
├── css/
│   └── style.css       → seluruh tampilan (tema gelap-lembut, responsif)
├── js/
│   ├── core.js         → state, database, seed, helper, auth & hak akses  (1)
│   ├── sync.js         → sinkronisasi Google Sheets (Apps Script)         (2)
│   ├── ui.js           → navigasi halaman + sistem modal                  (3)
│   ├── dashboard.js    → statistik, grafik, peringatan, aktivitas         (4)
│   ├── inventory.js    → stok alat & bahan (CRUD + filter)                (5)
│   ├── purchases.js    → pembelian + kegunaan & harga (admin)             (6)
│   ├── loans.js        → pinjam, ajuan kembali, konfirmasi admin          (7)
│   ├── io.js           → ekspor CSV, backup/restore JSON                  (8)
│   ├── device.js       → Mode Ringan selalu aktif                         (9)
│   └── main.js         → inisialisasi aplikasi                           (10)
├── apps-script/
│   └── Code.gs         → backend Apps Script (tempel ke spreadsheet)
├── DEPLOY.md           → panduan hosting, domain & Google Sheets
└── README.md
```

Angka = urutan muat `<script>` di `index.html`. **Jangan diubah urutannya**:
`core.js` harus pertama (fondasi), `main.js` harus terakhir (init).

## Akun awal

| Peran | Username | Password |
|---|---|---|
| Admin (akses penuh) | `admin` | `admin123` |
| User (stok + pinjam) | `user` | `user123` |

Segera ganti password lewat menu **Akses Akun** setelah masuk sebagai admin.

## Hak akses singkat

- **Admin:** semua menu — stok, pembelian, peminjaman, kelola akun,
  impor/backup, dan pengaturan sinkronisasi.
- **User:** melihat stok, meminjam, dan mengajukan pengembalian.
  Pengembalian butuh **persetujuan admin** sebelum stok bertambah.

## Sinkronisasi Google Sheets

1 sheet per menu (dibuat otomatis): `Stok`, `Pembelian`, `Peminjaman`,
`Pengguna`. Pengaturan ada di menu **Ekspor → Sinkronisasi Google Sheets**
(khusus admin). Panduan lengkap: **`DEPLOY.md` Bagian 3**.
