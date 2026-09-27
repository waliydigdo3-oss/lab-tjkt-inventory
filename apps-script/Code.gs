/***** LAB TJKT — Backend Google Sheets (Apps Script) *****
 * Cara pakai:
 * 1. Buka spreadsheet Anda → menu Ekstensi → Apps Script.
 * 2. Hapus semua isi editor, lalu tempel SELURUH file ini.
 * 3. Simpan (Ctrl+S), beri nama project mis. "LAB TJKT API".
 * 4. Deploy → Deployment baru → jenis "Aplikasi web":
 *    - "Jalankan sebagai" : Saya
 *    - "Siapa yang memiliki akses" : Siapa pun
 * 5. Deploy → izinkan akses (Lanjutan → buka project) → salin URL Web App.
 * 6. Di aplikasi lab (login admin) → ikon Ekspor → Sinkronisasi →
 *    tempel URL → Simpan & Sinkronkan.
 *
 * Sheet dibuat OTOMATIS (1 sheet per menu, tidak digabung):
 * Stok | Pembelian | Peminjaman | Pengguna
 **********************************************************/

const SHEETS = {
  items:     { name: "Stok",       cols: ["id","nama","kategori","merk","lokasi","stok","satuan","minStok","kondisi","harga","deskripsi"] },
  purchases: { name: "Pembelian",  cols: ["id","tanggal","barangId","namaSnap","jumlah","harga","total","supplier","kegunaan","kategoriBelanja","nota"] },
  loans:     { name: "Peminjaman", cols: ["id","nama","identitas","kontak","barangId","namaSnap","jumlah","tglPinjam","tglRencana","tglKembali","keperluan","status","dikembalikanOleh","kondisiKembali","catatan","tglDiajukan","diajukanOleh","catatanAjuan"] },
  users:     { name: "Pengguna",   cols: ["id","nama","username","pass","role","identitas","created"] }
};
// Kolom yang wajib diperlakukan sebagai TEKS (agar "0812..." tidak jadi angka)
const TEXT_COLS = { loans: ["kontak"] };

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function cellToJson(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return (v === null || v === undefined) ? "" : v;
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "read";
    if (action === "ping") return out({ ok: true, time: new Date().toISOString() });
    if (action !== "read") return out({ ok: false, error: "unknown action" });
    const data = {};
    Object.keys(SHEETS).forEach(function (key) {
      const cols = SHEETS[key].cols;
      const sh = getSheet(SHEETS[key].name);
      // pastikan baris header sesuai skema
      const lastCol = sh.getLastColumn();
      let head = [];
      if (lastCol > 0) head = sh.getRange(1, 1, 1, Math.max(lastCol, cols.length)).getValues()[0];
      let needHead = head.length < cols.length;
      if (!needHead) {
        for (let i = 0; i < cols.length; i++) {
          if (String(head[i]) !== cols[i]) { needHead = true; break; }
        }
      }
      if (needHead) sh.getRange(1, 1, 1, cols.length).setValues([cols]);
      // baca baris data
      const rows = [];
      const lastRow = sh.getLastRow();
      if (lastRow > 1) {
        const vals = sh.getRange(2, 1, lastRow - 1, cols.length).getValues();
        for (let r = 0; r < vals.length; r++) {
          const o = {}; let empty = true;
          for (let j = 0; j < cols.length; j++) {
            const v = cellToJson(vals[r][j]);
            o[cols[j]] = v;
            if (v !== "" && v !== null) empty = false;
          }
          if (!empty) rows.push(o);
        }
      }
      data[key] = rows;
    });
    return out({ ok: true, data: data });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const key = body.collection;
    if (!SHEETS[key]) return out({ ok: false, error: "unknown collection: " + key });
    const cols = SHEETS[key].cols;
    const sh = getSheet(SHEETS[key].name);
    const rows = Array.isArray(body.rows) ? body.rows : [];
    // format teks untuk kolom tertentu SEBELUM tulis (format menetap di sheet)
    (TEXT_COLS[key] || []).forEach(function (c) {
      const idx = cols.indexOf(c);
      if (idx >= 0) sh.getRange(1, idx + 1, Math.max(rows.length + 1, 1), 1).setNumberFormat("@");
    });
    sh.clearContents();
    const grid = [cols];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      grid.push(cols.map(function (c) {
        const v = r[c];
        return (v === null || v === undefined) ? "" : v;
      }));
    }
    sh.getRange(1, 1, grid.length, cols.length).setValues(grid);
    return out({ ok: true, count: rows.length });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}
