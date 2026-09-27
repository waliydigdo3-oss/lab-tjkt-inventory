# Hosting, Domain & Google Sheets — Panduan Lengkap

> Catatan jujur: saya (AI) tidak bisa mendaftarkan akun hosting/domain untuk
> Anda karena butuh email + pembayaran milik Anda sendiri. Tapi kabar baiknya:
> website ini **100% file statis** (HTML/CSS/JS) sehingga bisa online **gratis
> dalam ±5 menit** dengan langkah di bawah. Domain berbayar hanya opsional.

---

## Bagian 1 — Online-kan website GRATIS (Netlify Drop)

1. Siapkan file `LabStock-inventory.zip` (atau folder `lab-inventory/`).
2. Buka **https://app.netlify.com/drop** → daftar/masuk (bisa pakai
   akun Google, gratis).
3. **Seret (drag & drop) file ZIP** ke halaman itu → tunggu ±1 menit.
4. Jadi! Website langsung bisa dibuka siapa saja lewat URL acak seperti
   `https://lab-tjkt-anda.netlify.app`.
5. (Opsional) Ganti nama URL: **Site settings → Change site name**,
   mis. `lab-tjkt-sekolah` → `https://lab-tjkt-sekolah.netlify.app`.

Alternatif gratis lain (cara mirip): **Cloudflare Pages**,
**Vercel**, **GitHub Pages**.

---

## Bagian 2 — Domain sendiri, mis. `labtjkt.sch.id` (opsional, berbayar)

1. Beli domain di registrar Indonesia/internasional, mis. **Niagahoster**,
   **Domainesia**, **Namecheap**, atau **Cloudflare Registrar**.
   - Untuk sekolah Indonesia, ekstensi paling pas: **`.sch.id`**
     (butuh dokumen sekolah, biasanya murah/gratis via program tertentu).
   - Umum & mudah: **`.com`** (±Rp 170 rb/tahun), **`.my.id`** (±Rp 10–25 rb),
     **`.id`** (±Rp 250 rb/tahun).
2. Di Netlify: **Site settings → Domain management → Add a custom domain**
   → masukkan domain Anda → ikuti petunjuk DNS yang muncul:
   - **Opsi A (mudah):** arahkan nameserver domain ke Netlify
     (`dns1.p01.nsone.net`, dst. — sesuai petunjuk).
   - **Opsi B:** tambah record DNS di registrar: `A @ → 75.2.60.5`
     dan `CNAME www → nama-site-anda.netlify.app`.
3. Tunggu DNS menyebar (±5 menit–24 jam). HTTPS (gembok) aktif otomatis.

---

## Bagian 3 — Hubungkan ke Google Sheets (1 sheet per menu)

Arsitekturnya: spreadsheet Anda menjadi **database bersama** lewat
**Apps Script Web App** (gratis, resmi dari Google). Aplikasi tetap bisa
dibuka offline memakai data lokal.

Sheet yang dipakai (dibuat otomatis, **tidak digabung**):

| Menu aplikasi | Nama sheet |
|---|---|
| Stok Alat & Bahan | `Stok` |
| Pembelian | `Pembelian` |
| Peminjaman | `Peminjaman` |
| Akses Akun (admin) | `Pengguna` |

### Langkah setup (±10 menit, cukup sekali)

1. Buka spreadsheet Anda
   (`1BrhrJ05Ul44004I75uZgeTJVAFP3TC1Q_uwNTW1Gdy0`).
2. Menu **Ekstensi → Apps Script** (tab baru terbuka).
3. Hapus semua isi editor → buka file **`apps-script/Code.gs`** dari
   project ini → salin **seluruhnya** → tempel → **Simpan** (Ctrl+S).
4. **Deploy → Deployment baru** → ikon gir → pilih **Aplikasi web**:
   - *Jalankan sebagai*: **Saya**
   - *Siapa yang memiliki akses*: **Siapa pun**
5. Klik **Deploy** → **Authorize access** → pilih akun Google Anda →
   **Advanced/Lanjutan → Go to … (unsafe)** → **Allow/Izinkan**.
6. **Salin URL Web App** (`https://script.google.com/macros/s/.../exec`).
7. Buka aplikasi lab → **login sebagai admin** → klik ikon **Ekspor**
   (panah bawah di bar atas) → bagian **Sinkronisasi Google Sheets** →
   tempel URL → **Simpan & Sinkronkan**.
8. Uji: tambah 1 barang → sheet `Stok` harus langsung terisi baris baru.

> Sheet `Sheet1` bawaan boleh diabaikan/dihapus. Jangan ubah nama sheet
> atau judul kolom — itu "jembatan" aplikasinya.

### Cara kerja sinkronisasi

- **Otomatis:** setiap ada perubahan (tambah/ubah/hapus/pinjam/konfirmasi),
  data dikirim ke Sheets ±1 detik kemudian.
- **Saat dibuka / login:** aplikasi mengambil data terbaru dari Sheets.
- **Tombol "Sinkron Sekarang":** tarik data terbaru secara manual.
- **Offline:** aplikasi tetap jalan dengan data lokal; saat internet kembali,
  data dikirim otomatis. Jika sempat mengedit offline lama, tekan
  **Sinkron Sekarang** setelah online.
- Aturan konflik: **data yang terakhir tersimpan yang menang**
  (last-write-wins) — cukup untuk pemakaian satu lab.

### Keamanan

- URL Web App = **kunci tulis** database. Siapa pun yang memegangnya bisa
  baca/tulis — simpan baik-baik, jangan disebar.
- Kolom `pass` di sheet `Pengguna` berisi **hash**, bukan password asli.
- Akses aplikasi tetap dijaga halaman login (admin/user) seperti biasa.
- Backup berkala: menu Ekspor → **Backup Penuh (JSON)**.

### Kalau nanti mengubah file Code.gs

Setelah edit script: **Deploy → Kelola deployment → Edit →
Versi baru → Deploy** agar URL lama memakai kode terbaru.
