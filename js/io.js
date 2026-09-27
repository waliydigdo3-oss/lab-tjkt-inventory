/* =====================================================
 * LAB TJKT — js/io.js
 * Ekspor CSV, backup/restore JSON, reset data.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= EKSPOR / IMPOR ================= */
function download(name,content,type="text/plain"){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
const csvEsc=v=>`"${String(v??"").replace(/"/g,'""')}"`;
function exportCSV(kind){
  if(!isAdmin()&&(kind==="beli"||kind==="semua"))return toast("Akses ditolak: khusus <b>admin</b>.","err");
  const date=todayISO();
  if(kind==="stok"||kind==="semua"){
    let c="Nama,Kategori,Merk,Lokasi,Stok,Satuan,Min Stok,Kondisi,Est Harga,Deskripsi\n";
    DB.items.forEach(i=>c+=[i.nama,i.kategori,i.merk,i.lokasi,i.stok,i.satuan,i.minStok,i.kondisi,i.harga,i.deskripsi].map(csvEsc).join(",")+"\n");
    if(kind==="stok")return download(`labstock-stok-${date}.csv`,c,"text/csv"),toast("File stok CSV diunduh.");
  }
  if(kind==="beli"||kind==="semua"){
    let c="Tanggal,Barang,Jumlah,Harga Satuan,Total,Supplier,Kategori Belanja,No Nota,Kegunaan\n";
    DB.purchases.forEach(p=>c+=[p.tanggal,p.namaSnap,p.jumlah,p.harga,p.total,p.supplier,p.kategoriBelanja,p.nota,p.kegunaan].map(csvEsc).join(",")+"\n");
    if(kind==="beli")return download(`labstock-pembelian-${date}.csv`,c,"text/csv"),toast("File pembelian CSV diunduh.");
  }
  if(kind==="pinjam"||kind==="semua"){
    let c="Peminjam,Identitas,Kontak,Barang,Jumlah,Tgl Pinjam,Rencana Kembali,Tgl Kembali,Status,Diajukan Oleh,Tgl Diajukan,Dikembalikan Oleh,Kondisi Kembali,Keperluan\n";
    DB.loans.forEach(l=>c+=[l.nama,l.identitas,l.kontak,l.namaSnap,l.jumlah,l.tglPinjam,l.tglRencana,l.tglKembali,l.status,l.diajukanOleh,l.tglDiajukan,l.dikembalikanOleh,l.kondisiKembali,l.keperluan].map(csvEsc).join(",")+"\n");
    if(kind==="pinjam")return download(`labstock-peminjaman-${date}.csv`,c,"text/csv"),toast("File peminjaman CSV diunduh.");
  }
  // semua → gabung + backup json
  download(`labstock-backup-${date}.json`,JSON.stringify(DB,null,2),"application/json");
  toast("Backup JSON + laporan diunduh. File CSV per modul tersedia di tiap halaman.");
}
$("#exportBtn").onclick=openExport;
$("#importBtn").onclick=()=>{if(requireAdmin())$("#importFile").click()};
$("#importFile").addEventListener("change",e=>{
  if(!requireAdmin()){e.target.value="";return}
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const d=JSON.parse(r.result);
    if(!d.items||!d.purchases||!d.loans)throw 0;
    DB=d;ensureUsers();save();render();toast("Data berhasil diimpor.");
  }catch{toast("File tidak valid.","err")}};
  r.readAsText(f);e.target.value="";
});
