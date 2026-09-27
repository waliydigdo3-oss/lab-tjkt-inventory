# Push ke GitHub & Deploy ke Vercel — Panduan (±10 menit)

> Kenapa perlu langkah manual? GitHub dan Vercel butuh **login akun milik
> Anda** — saya tidak bisa masuk ke akun Anda. Kabar baiknya: caranya
> **tanpa install apa pun**, cukup lewat browser.

Hasil akhir: kode tersimpan di GitHub Anda + website online di Vercel
(mis. `https://lab-tjkt.vercel.app`) dan **otomatis update** setiap kode
di GitHub berubah.

---

## Langkah 1 — Buat repository GitHub (2 menit)

1. Buka **https://github.com/new** (login dulu).
2. Isi:
   - **Repository name:** `lab-tjkt-inventory`
   - Pilih **Public** (gratis, syarat deploy mudah)
   - **Jangan** centang "Add a README file"
3. Klik **Create repository** → biarkan halamannya terbuka.

## Langkah 2 — Upload semua file (3 menit)

1. Di halaman repository baru, klik link
   **"uploading an existing file"** (tengah halaman).
2. Di Windows Explorer, buka hasil ekstrak ZIP → buka folder
   `lab-inventory/` → **blok SEMUA isi di dalamnya**
   (`index.html`, folder `css/`, `js/`, `apps-script/`, file `.md`)
   → **seret (drag) ke halaman GitHub**.
   - ⚠️ Yang di-upload adalah **ISI folder**, bukan foldernya — supaya
     `index.html` berada di **akar (root)** repository.
   - Struktur akhir di GitHub harus persis seperti ini:
     ```
     lab-tjkt-inventory/
     ├── index.html
     ├── css/style.css
     ├── js/*.js
     ├── apps-script/Code.gs
     └── *.md
     ```
3. Di bawah halaman, klik **Commit changes**.
4. Cek: file `index.html` terlihat di halaman depan repo. ✅

> Alternatif (jurusan TJKT pasti bisa 😉): install Git, lalu di folder
> project jalankan:
> `git init -b main` → `git add .` → `git commit -m "LAB TJKT v1.1"` →
> `git remote add origin https://github.com/USERNAME/lab-tjkt-inventory.git` →
> `git push -u origin main`

## Langkah 3 — Deploy ke Vercel (3 menit)

1. Buka **https://vercel.com/walyz** (login akun Vercel Anda).
2. Klik **Add New… → Project**.
3. Jika repo belum muncul: klik **Adjust GitHub App Permissions** → pilih
   akun → beri akses ke repo `lab-tjkt-inventory` → Install.
4. Klik **Import** pada repo `lab-tjkt-inventory`.
5. Pengaturan (biarkan default, website ini statis):
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build & Output Settings: **kosongkan semua**
6. Klik **Deploy** → tunggu ±1 menit → klik gambar preview / tombol
   **Visit** 🎉
7. URL publik Anda mis. `https://lab-tjkt-inventory.vercel.app` —
   bisa diganti di **Project → Settings → Domains**
   (atau tambah domain sendiri `.sch.id`/`.com`, caranya mirip DEPLOY.md).

## Langkah 4 — Cara update website nanti

Setiap Anda mengubah file di GitHub (tombol pensil/upload → Commit),
Vercel **otomatis deploy ulang** ±1 menit. Tidak perlu setting lagi.

Untuk edit yang nyaman dari Windows, install **GitHub Desktop**:
login → Clone repo → edit file → Commit → Push. Website ikut terupdate.

## Checklist kalau gagal

| Gejala | Solusi |
|---|---|
| Halaman Vercel 404 | Pastikan `index.html` ada di **root** repo, bukan dalam subfolder |
| Tampilan rusak (tanpa CSS) | Struktur folder `css/` & `js/` harus utuh seperti di atas |
| Repo tidak muncul di Vercel | Ulangi *Adjust GitHub App Permissions*, pastikan repo dicentang |
| Sinkron Sheets error | Wajar sebelum setup Apps Script — ikuti `DEPLOY.md` Bagian 3 |
