/* =====================================================
 * LAB TJKT — js/purchases.js
 * Pembelian: daftar, filter, input pembelian + kegunaan & harga.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= RENDER: PEMBELIAN ================= */
function renderBeli(){
  const fb=$("#fBelanja").value, fm=$("#fBulan").value;
  const bln=thisMonth();
  $("#bTransaksi").textContent=DB.purchases.length;
  $("#bBulan").textContent=DB.purchases.filter(p=>p.tanggal.startsWith(bln)).length+" bulan ini";
  $("#bTotal").textContent=fmtRp(DB.purchases.reduce((a,b)=>a+Number(b.total||0),0));
  const byB={};DB.purchases.forEach(p=>byB[p.kategoriBelanja]=(byB[p.kategoriBelanja]||0)+Number(p.total||0));
  const top=Object.entries(byB).sort((a,b)=>b[1]-a[1])[0];
  $("#bTopCat").textContent=top?top[0]:"—";$("#bTopVal").textContent=top?fmtRp(top[1]):"Rp0";

  const list=DB.purchases.filter(p=>{
    if(fb&&p.kategoriBelanja!==fb)return false;
    if(fm&&!p.tanggal.startsWith(fm))return false;
    return matchSearch(p.namaSnap,p.supplier,p.kegunaan,p.nota,p.kategoriBelanja);
  }).sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
  $("#buyBody").innerHTML=list.length?list.map(p=>`<tr>
    <td style="white-space:nowrap"><div class="cell-b">${fmtTgl(p.tanggal)}</div><div class="cell-s">${esc(p.nota||"tanpa nota")}</div></td>
    <td><div class="cell-b">${esc(p.namaSnap)}</div><div class="cell-s" style="max-width:340px">${esc(p.kegunaan)}</div><div style="margin-top:5px"><span class="chip info">${esc(p.kategoriBelanja)}</span></div></td>
    <td>${esc(p.supplier||"—")}</td>
    <td style="white-space:nowrap">${p.jumlah} × ${fmtRp(p.harga)}</td>
    <td><b style="color:var(--teal)">${fmtRp(p.total)}</b></td>
    <td><div class="row-actions">
      <button class="tbtn" title="Detail" onclick="detailBuy('${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
      <button class="tbtn red admin-only" title="Hapus" onclick="delBuy('${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
    </div></td></tr>`).join("")
    :`<tr><td colspan="6"><div class="empty"><b>Belum ada pembelian</b>Klik "Input Pembelian" untuk mencatat barang & harga yang dibeli.</div></td></tr>`;
}
$("#fBelanja").addEventListener("change",renderBeli);
$("#fBulan").addEventListener("change",renderBeli);

/* ---- Form Pembelian ---- */
function formPurchase(){
  const opts=DB.items.map(i=>`<option value="${i.id}">${esc(i.nama)} (stok: ${i.stok})</option>`).join("");
  openModalShell("buy","Input Pembelian Baru","Stok otomatis bertambah & harga tercatat",
  `<div class="form-grid">
    <div><label class="lbl">Tanggal Beli <i>*</i></label><input class="input" type="date" id="p_tgl" value="${todayISO()}"></div>
    <div><label class="lbl">No. Nota / Invoice</label><input class="input" id="p_nota" placeholder="mis. INV-2026-001"></div>
    <div class="full">
      <label class="lbl">Barang <i>*</i></label>
      <div class="seg" style="margin-bottom:8px" id="p_mode"><button class="active" data-m="ada">Barang sudah ada</button><button data-m="baru">Barang baru</button></div>
      <select class="input" id="p_barang">${opts||"<option value=''>— belum ada barang —</option>"}</select>
      <input class="input" id="p_namabaru" style="display:none;margin-top:8px" placeholder="Nama barang baru...">
      <div id="p_katbaru_wrap" style="display:none;margin-top:8px"><select class="input" id="p_katbaru">${KATEGORI.map(k=>`<option>${k}</option>`).join("")}</select></div>
    </div>
    <div><label class="lbl">Jumlah <i>*</i></label><input class="input" type="number" min="1" value="1" id="p_jml"></div>
    <div><label class="lbl">Harga Satuan (Rp) <i>*</i></label><div class="rp-wrap"><input class="input" type="number" min="0" value="0" id="p_harga"></div></div>
    <div class="full"><div class="total-box"><span>Total Pembelian</span><b id="p_total">Rp0</b></div></div>
    <div><label class="lbl">Supplier / Toko</label><input class="input" id="p_sup" placeholder="mis. Toko Elektro Jaya"></div>
    <div><label class="lbl">Kategori Belanja</label><select class="input" id="p_katb">${BELANJA.map(k=>`<option>${k}</option>`).join("")}</select></div>
    <div class="full"><label class="lbl">Kegunaan / Keperluan Barang <i>*</i></label><textarea class="input" id="p_guna" placeholder="mis. Untuk praktikum elektronika dasar kelas A — 30 mahasiswa..."></textarea></div>
  </div>`,
  `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="savePurchase()">Simpan Pembelian</button>`,true);
  let mode="ada";
  $$("#p_mode button").forEach(b=>b.onclick=()=>{
    mode=b.dataset.m;$$("#p_mode button").forEach(x=>x.classList.toggle("active",x===b));
    const isBaru=mode==="baru";
    $("#p_barang").style.display=isBaru?"none":"block";
    $("#p_namabaru").style.display=isBaru?"block":"none";
    $("#p_katbaru_wrap").style.display=isBaru?"block":"none";
  });
  const calc=()=>{$("#p_total").textContent=fmtRp((parseInt($("#p_jml").value)||0)*(parseInt($("#p_harga").value)||0))};
  $("#p_jml").oninput=calc;$("#p_harga").oninput=calc;calc();
  window._pMode=()=>mode;
}
function savePurchase(){
  if(!requireAdmin())return;
  const mode=window._pMode?window._pMode():"ada";
  const tgl=$("#p_tgl").value||todayISO();
  const jml=Math.max(1,parseInt($("#p_jml").value)||0);
  const harga=Math.max(0,parseInt($("#p_harga").value)||0);
  const guna=$("#p_guna").value.trim();
  if(!jml||!guna)return toast("Jumlah & kegunaan wajib diisi.","err");
  let barangId,namaSnap;
  if(mode==="baru"){
    const nm=$("#p_namabaru").value.trim();
    if(!nm)return toast("Nama barang baru wajib diisi.","err");
    const nb={id:uid(),nama:nm,kategori:$("#p_katbaru").value,merk:"",lokasi:"",stok:0,satuan:"pcs",minStok:1,kondisi:"Baik",harga,deskripsi:guna};
    DB.items.push(nb);barangId=nb.id;namaSnap=nm;
  }else{
    barangId=$("#p_barang").value;
    if(!barangId)return toast("Pilih barang dulu (atau buat barang baru).","err");
    namaSnap=getItem(barangId).nama;
  }
  DB.purchases.push({id:uid(),tanggal:tgl,barangId,namaSnap,jumlah:jml,harga,total:jml*harga,
    supplier:$("#p_sup").value.trim(),kegunaan:guna,kategoriBelanja:$("#p_katb").value,nota:$("#p_nota").value.trim()});
  const it=getItem(barangId);if(it){it.stok+=jml;it.harga=harga||it.harga}
  save();closeModal();render();
  toast(`Pembelian <b>${esc(namaSnap)} ×${jml}</b> (${fmtRp(jml*harga)}) tersimpan. Stok → ${it?it.stok:"?"}.`);
}
function detailBuy(id){
  const p=DB.purchases.find(x=>x.id===id);if(!p)return;
  openModalShell("eye","Detail Pembelian",p.namaSnap,
  `<div class="detail-list">
    <div class="drow"><span>Tanggal</span><b>${fmtTgl(p.tanggal)}</b></div>
    <div class="drow"><span>Barang</span><b>${esc(p.namaSnap)} ×${p.jumlah}</b></div>
    <div class="drow"><span>Harga Satuan</span><b>${fmtRp(p.harga)}</b></div>
    <div class="drow"><span>Total</span><b style="color:var(--teal)">${fmtRp(p.total)}</b></div>
    <div class="drow"><span>Supplier</span><b>${esc(p.supplier||"—")}</b></div>
    <div class="drow"><span>Kategori</span><b>${esc(p.kategoriBelanja)}</b></div>
    <div class="drow"><span>No. Nota</span><b>${esc(p.nota||"—")}</b></div>
    <div class="drow" style="flex-direction:column;align-items:flex-start;gap:6px"><span>Kegunaan / Keperluan</span><b style="text-align:left;font-weight:600">${esc(p.kegunaan)}</b></div>
  </div>`,
  `<button class="btn btn-ghost btn-block" onclick="closeModal()">Tutup</button>`);
}
function delBuy(id){
  if(!requireAdmin())return;
  const p=DB.purchases.find(x=>x.id===id);if(!p)return;
  if(!confirm(`Hapus catatan pembelian "${p.namaSnap}" (${fmtRp(p.total)})?\nStok TIDAK dikurangi otomatis.`))return;
  DB.purchases=DB.purchases.filter(x=>x.id!==id);save();render();toast("Catatan pembelian dihapus.","warn");
}
