/* =====================================================
 * LAB TJKT — js/inventory.js
 * Stok barang lab: daftar, filter, tambah/ubah/hapus, +stok.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= RENDER: STOK ================= */
const catIco={
  "Elektronik":'<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
  "Komputer":'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  "Alat Ukur":'<path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10a1 1 0 0 0 0-1.3Z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2"/>',
  "Jaringan":'<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v5M10 12H7m7 0h3M6.5 16.8l3-3.3m5 3.3-3-3.3"/>',
  "Perkakas":'<path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7Z"/>',
  "Bahan Praktikum":'<path d="M9 3h6M10 3v6.3L4.6 18a2 2 0 0 0 1.8 3h11.2a2 2 0 0 0 1.8-3L14 9.3V3"/><path d="M7.5 14h9"/>',
  "Furniture":'<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 11h18a1 1 0 0 1 1 1v7H2v-7a1 1 0 0 1 1-1Z"/><path d="M5 19v2M19 19v2"/>',
  "ATK":'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/>'
};
function renderStok(){
  const fk=$("#fKategori").value, fo=$("#fKondisi").value, fs=$("#fStok").value;
  // isi opsi kategori sekali
  if($("#fKategori").options.length<=1)KATEGORI.forEach(k=>$("#fKategori").insertAdjacentHTML("beforeend",`<option>${k}</option>`));
  let list=DB.items.filter(i=>{
    if(fk&&i.kategori!==fk)return false;
    if(fo&&i.kondisi!==fo)return false;
    const s=stockStatus(i);
    if(fs==="habis"&&i.stok>0)return false;
    if(fs==="tipis"&&!(i.stok>0&&i.stok<=i.minStok))return false;
    if(fs==="aman"&&s.cls!=="ok")return false;
    return matchSearch(i.nama,i.kategori,i.merk,i.lokasi,i.kondisi);
  }).sort((a,b)=>a.nama.localeCompare(b.nama));

  $("#itemCards").style.display=itemView==="grid"?"grid":"none";
  $("#itemTableWrap").style.display=itemView==="table"?"block":"none";

  if(!list.length){
    const e=`<div class="empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg><b>Tidak ada barang ditemukan</b>Coba ubah filter/pencarian, atau tambah barang baru.</div>`;
    $("#itemCards").innerHTML=e;$("#itemTableBody").innerHTML=`<tr><td colspan="7">${e}</td></tr>`;return;
  }
  $("#itemCards").innerHTML=list.map(i=>{
    const s=stockStatus(i);
    return `<div class="card">
      <div class="card-top">
        <div class="card-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${catIco[i.kategori]||catIco["Elektronik"]}</svg></div>
        <div style="min-width:0;flex:1"><h4>${esc(i.nama)}</h4><div class="meta">${esc(i.kategori)} • ${esc(i.merk||"—")}</div></div>
        <span class="chip ${s.cls}">${s.txt}</span>
      </div>
      <div class="stock-line"><div class="stock-num">${i.stok} <small>${esc(i.satuan)}</small></div>
        <div class="bar" style="flex:1"><i style="width:${Math.min(100,Math.round(i.stok/Math.max(1,i.minStok*3)*100))}%"></i></div></div>
      <div class="card-meta">
        <div><span>Lokasi</span>${esc(i.lokasi||"—")}</div>
        <div><span>Kondisi</span>${esc(i.kondisi)}</div>
        <div><span>Min. Stok</span>${i.minStok} ${esc(i.satuan)}</div>
        <div><span>Est. Harga</span>${fmtRp(i.harga)}</div>
      </div>
      <div class="card-actions">
        <button class="mini-btn teal" onclick="openModal('loan','${i.id}')">Pinjam</button>
        <button class="mini-btn admin-only" onclick="openModal('item','${i.id}')">Ubah</button>
        <button class="mini-btn admin-only" onclick="quickStock('${i.id}')">+ Stok</button>
        <button class="mini-btn red admin-only" onclick="delItem('${i.id}')">Hapus</button>
      </div>
    </div>`;
  }).join("");
  $("#itemTableBody").innerHTML=list.map(i=>{
    const s=stockStatus(i);
    return `<tr><td><div class="cell-b">${esc(i.nama)}</div><div class="cell-s">${esc(i.merk||"—")}</div></td>
    <td>${esc(i.kategori)}</td><td>${esc(i.lokasi||"—")}</td>
    <td><b>${i.stok}</b> ${esc(i.satuan)}</td>
    <td><span class="chip ${s.cls}">${s.txt}</span></td><td>${esc(i.kondisi)}</td>
    <td><div class="row-actions">
      <button class="tbtn green" title="Pinjam" onclick="openModal('loan','${i.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7"/></svg></button>
      <button class="tbtn admin-only" title="Ubah" onclick="openModal('item','${i.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
      <button class="tbtn red admin-only" title="Hapus" onclick="delItem('${i.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
    </div></td></tr>`;
  }).join("");
}
["fKategori","fKondisi","fStok"].forEach(id=>$("#"+id).addEventListener("change",renderStok));
$$("#viewSeg button").forEach(b=>b.onclick=()=>{itemView=b.dataset.view;$$("#viewSeg button").forEach(x=>x.classList.toggle("active",x===b));renderStok()});

/* ---- Form Barang ---- */
function openModal(kind,presetId){
  if(kind==="item"){if(!requireAdmin())return;return formItem(presetId)}
  if(kind==="purchase"){if(!requireAdmin())return;return formPurchase()}
  if(kind==="loan")return formLoan(presetId);
  if(kind==="ret")return formReturn(presetId);
}
function formItem(id){
  const it=id?getItem(id):null;
  const v=(k,d="")=>it?it[k]??d:d;
  openModalShell("item",it?"Ubah Barang":"Tambah Barang Baru",it?it.nama:"Lengkapi data barang lab",
  `<div class="form-grid">
    <div class="full"><label class="lbl">Nama Barang <i>*</i></label><input class="input" id="f_nama" value="${esc(v("nama"))}" placeholder="mis. Multimeter Digital"></div>
    <div><label class="lbl">Kategori <i>*</i></label><select class="input" id="f_kat">${KATEGORI.map(k=>`<option ${v("kategori")===k?"selected":""}>${k}</option>`).join("")}</select></div>
    <div><label class="lbl">Merk / Tipe</label><input class="input" id="f_merk" value="${esc(v("merk"))}" placeholder="mis. Sanwa CD800a"></div>
    <div><label class="lbl">Lokasi / Rak</label><input class="input" id="f_lok" value="${esc(v("lokasi"))}" placeholder="mis. Lemari B2"></div>
    <div><label class="lbl">Kondisi</label><select class="input" id="f_kon">${KONDISI.map(k=>`<option ${v("kondisi","Baik")===k?"selected":""}>${k}</option>`).join("")}</select></div>
    <div><label class="lbl">Stok Saat Ini <i>*</i></label><input class="input" type="number" min="0" id="f_stok" value="${v("stok",0)}"></div>
    <div><label class="lbl">Satuan</label><select class="input" id="f_sat">${SATUAN.map(k=>`<option ${v("satuan","pcs")===k?"selected":""}>${k}</option>`).join("")}</select></div>
    <div><label class="lbl">Batas Min. Stok</label><input class="input" type="number" min="0" id="f_min" value="${v("minStok",1)}"><div class="hint">Stok ≤ batas ini = "Menipis".</div></div>
    <div><label class="lbl">Estimasi Harga (Rp)</label><div class="rp-wrap"><input class="input" type="number" min="0" id="f_harga" value="${v("harga",0)}"></div></div>
    <div class="full"><label class="lbl">Deskripsi</label><textarea class="input" id="f_des" placeholder="Spesifikasi singkat, kegunaan...">${esc(v("deskripsi"))}</textarea></div>
  </div>`,
  `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="saveItem('${id||""}')">Simpan Barang</button>`);
}
function saveItem(id){
  if(!requireAdmin())return;
  const nama=$("#f_nama").value.trim();
  if(!nama)return toast("Nama barang wajib diisi.","err");
  const data={nama,kategori:$("#f_kat").value,merk:$("#f_merk").value.trim(),lokasi:$("#f_lok").value.trim(),
    kondisi:$("#f_kon").value,stok:Math.max(0,parseInt($("#f_stok").value)||0),satuan:$("#f_sat").value,
    minStok:Math.max(0,parseInt($("#f_min").value)||0),harga:Math.max(0,parseInt($("#f_harga").value)||0),deskripsi:$("#f_des").value.trim()};
  if(id){Object.assign(getItem(id),data);toast(`Barang "<b>${esc(nama)}</b>" diperbarui.`)}
  else{DB.items.push({id:uid(),...data});toast(`Barang "<b>${esc(nama)}</b>" ditambahkan ke stok.`)}
  save();closeModal();render();
}
function quickStock(id){
  if(!requireAdmin())return;
  const it=getItem(id);if(!it)return;
  const jml=prompt(`Tambah stok "${it.nama}" (stok saat ini: ${it.stok} ${it.satuan}):`,"1");
  if(jml===null)return;
  const n=parseInt(jml);
  if(isNaN(n)||n<=0)return toast("Jumlah tidak valid.","err");
  it.stok+=n;save();render();toast(`Stok <b>${esc(it.nama)}</b> +${n} → ${it.stok} ${esc(it.satuan)}.`);
}
function delItem(id){
  if(!requireAdmin())return;
  const it=getItem(id);if(!it)return;
  const aktif=DB.loans.filter(l=>l.barangId===id&&l.status!=="kembali").length;
  if(aktif)return toast(`Tidak bisa dihapus: masih ada <b>${aktif}</b> peminjaman aktif barang ini.`,"err");
  if(!confirm(`Hapus "${it.nama}" dari stok?`))return;
  DB.items=DB.items.filter(x=>x.id!==id);save();render();toast("Barang dihapus.","warn");
}
