/* =====================================================
 * LAB TJKT — js/loans.js
 * Peminjaman: pinjam, ajuan kembali, konfirmasi/tolak admin.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= RENDER: PEMINJAMAN ================= */
function renderPinjam(){
  const dipinjam=DB.loans.filter(l=>l.status==="dipinjam");
  const menunggu=DB.loans.filter(l=>l.status==="menunggu");
  $("#lAktif").textContent=dipinjam.length;
  $("#lAktifSub").textContent=menunggu.length+" menunggu konfirmasi";
  $("#lTelat").textContent=dipinjam.filter(l=>loanState(l)==="late").length;
  $("#lKembali").textContent=DB.loans.filter(l=>l.status==="kembali").length;
  const list=DB.loans.filter(l=>{
    const s=loanState(l);
    if(loanFilter==="aktif"&&s!=="active")return false;
    if(loanFilter==="terlambat"&&s!=="late")return false;
    if(loanFilter==="menunggu"&&s!=="pending")return false;
    if(loanFilter==="kembali"&&s!=="done")return false;
    return matchSearch(l.nama,l.identitas,l.namaSnap,l.keperluan,l.kontak);
  }).sort((a,b)=>(b.tglPinjam||"").localeCompare(a.tglPinjam||""));
  if(!list.length){$("#loanCards").innerHTML=`<div class="empty" style="grid-column:1/-1"><b>Tidak ada data peminjaman</b>Klik "Pinjam Barang" untuk mencatat peminjaman baru.</div>`;return}
  $("#loanCards").innerHTML=list.map(l=>{
    const s=loanState(l);
    const chip=s==="done"?'<span class="chip ok">Dikembalikan</span>':s==="pending"?'<span class="chip warn">Menunggu Konfirmasi</span>':s==="late"?'<span class="chip bad">Terlambat</span>':'<span class="chip info">Dipinjam</span>';
    const wa=l.kontak?`https://wa.me/${l.kontak.replace(/\D/g,"").replace(/^0/,"62")}`:"";
    return `<div class="card loan-card ${s==="late"?"late":s==="done"?"done":s==="pending"?"pending":""}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div style="min-width:0"><h4 style="font-size:15px">${esc(l.namaSnap)} <span style="color:var(--teal)">×${l.jumlah}</span></h4>
        <div class="meta" style="font-size:12px;color:var(--muted);margin-top:3px">${esc(l.keperluan)}</div></div>${chip}
      </div>
      <div class="person"><div class="avatar">${esc(initials(l.nama))}</div>
        <div style="min-width:0;flex:1"><b>${esc(l.nama)}</b><small>${esc(l.identitas)} • ${esc(l.kontak||"—")}</small></div>
        ${wa&&s!=="done"?`<a class="mini-btn" style="flex:0 0 auto;text-decoration:none;padding:8px 12px" target="_blank" rel="noopener" href="${wa}">WA</a>`:""}
      </div>
      <div class="date-row">
        <div><span>Pinjam</span><b>${fmtTgl(l.tglPinjam)}</b></div>
        <div><span>Rencana Kembali</span><b style="${s==="late"?"color:var(--red)":""}">${fmtTgl(l.tglRencana)}</b></div>
        <div><span>Aktual</span><b>${l.tglKembali?fmtTgl(l.tglKembali):"—"}</b></div>
      </div>
      ${l.status==="kembali"?`<div style="font-size:12.5px;color:var(--muted);background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.3);border-radius:10px;padding:9px 12px;margin-bottom:12px">Dikembalikan oleh <b style="color:#a7f3d0">${esc(l.dikembalikanOleh||l.nama)}</b> • Kondisi: ${esc(l.kondisiKembali||"—")}${l.catatan?" • "+esc(l.catatan):""}</div>`
        :s==="pending"?`<div style="font-size:12.5px;color:var(--muted);background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.35);border-radius:10px;padding:9px 12px;margin-bottom:12px">Diajukan kembali oleh <b style="color:#fde68a">${esc(l.diajukanOleh||l.nama)}</b> • ${fmtTgl(l.tglDiajukan)} — <b>menunggu konfirmasi admin</b>${l.catatanAjuan?" • "+esc(l.catatanAjuan):""}</div>`
        :l.catatan?`<div style="font-size:12.5px;color:var(--muted);margin-bottom:12px">Catatan: ${esc(l.catatan)}</div>`:""}
      <div class="card-actions">
        ${s==="active"&&!isAdmin()&&isOwner(l)?`<button class="mini-btn teal" onclick="formRequestReturn('${l.id}')">Ajukan Pengembalian</button>`:""}
        ${s==="active"&&isAdmin()?`<button class="mini-btn teal" onclick="formReturn('${l.id}')">Konfirmasi Kembali</button>`:""}
        ${s==="pending"&&isAdmin()?`<button class="mini-btn teal" onclick="formReturn('${l.id}')">Setujui & Konfirmasi</button><button class="mini-btn red" onclick="rejectReturn('${l.id}')">Tolak</button>`:""}
        ${s==="pending"&&!isAdmin()&&isOwner(l)?`<button class="mini-btn" onclick="cancelRequest('${l.id}')">Batalkan Ajuan</button>`:""}
        <button class="mini-btn" onclick="detailLoan('${l.id}')">Detail</button>
        <button class="mini-btn red admin-only" onclick="delLoan('${l.id}')">Hapus</button>
      </div>
    </div>`;
  }).join("");
}
$$("#loanSeg button").forEach(b=>b.onclick=()=>{loanFilter=b.dataset.loan;$$("#loanSeg button").forEach(x=>x.classList.toggle("active",x===b));renderPinjam()});

function render(){
  renderDashboard();
  if(page==="stok")renderStok();
  if(page==="beli")renderBeli();
  if(page==="pinjam")renderPinjam();
  if(page==="pengguna")renderUsers();
  // badge selalu update
  const aktif=DB.loans.filter(l=>l.status!=="kembali").length;
  const badge=$("#navLoanBadge");badge.style.display=aktif?"flex":"none";badge.textContent=aktif;
}

/* ---- Form Peminjaman ---- */
function formLoan(presetId){
  const avail=DB.items.filter(i=>i.stok>0);
  const opts=DB.items.map(i=>`<option value="${i.id}" ${presetId===i.id?"selected":""}>${esc(i.nama)} — sisa ${i.stok} ${esc(i.satuan)}${i.stok<=0?" (HABIS)":""}</option>`).join("");
  const t=todayISO(), r=(()=>{const d=new Date();d.setDate(d.getDate()+7);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")})();
  openModalShell("loan","Catat Peminjaman","Stok otomatis berkurang saat disimpan",
  `<div class="form-grid">
    <div class="full"><label class="lbl">Nama Peminjam <i>*</i></label><input class="input" id="l_nama" value="${(!isAdmin()&&currentUser)?esc(currentUser.nama):""}" placeholder="mis. Nadia Putri"></div>
    <div><label class="lbl">NIM / NIP / Identitas</label><input class="input" id="l_ident" value="${(!isAdmin()&&currentUser)?esc(currentUser.identitas||""):""}" placeholder="mis. NIM 202303101"></div>
    <div><label class="lbl">No. HP / WA</label><input class="input" id="l_wa" placeholder="mis. 0812xxxxxxx"></div>
    <div><label class="lbl">Barang yang Dipinjam <i>*</i></label><select class="input" id="l_barang">${opts||"<option value=''>— belum ada barang —</option>"}</select><div class="hint" id="l_sisa"></div></div>
    <div><label class="lbl">Jumlah <i>*</i></label><input class="input" type="number" min="1" value="1" id="l_jml"></div>
    <div><label class="lbl">Tanggal Pinjam <i>*</i></label><input class="input" type="date" id="l_tgl" value="${t}"></div>
    <div><label class="lbl">Rencana Kembali <i>*</i></label><input class="input" type="date" id="l_renc" value="${r}"></div>
    <div class="full"><label class="lbl">Keperluan Peminjaman <i>*</i></label><textarea class="input" id="l_perlu" placeholder="mis. Praktikum biologi sel — Kelas A..."></textarea></div>
    <div class="full"><label class="lbl">Catatan (opsional)</label><input class="input" id="l_cat" placeholder="Kondisi awal, aksesoris yang dibawa..."></div>
  </div>`,
  `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-amber" onclick="saveLoan()">Simpan Peminjaman</button>`,true);
  const upd=()=>{const it=getItem($("#l_barang").value);$("#l_sisa").textContent=it?`Sisa stok: ${it.stok} ${it.satuan}`:""};
  $("#l_barang").onchange=upd;upd();
}
function saveLoan(){
  const nama=$("#l_nama").value.trim(), barangId=$("#l_barang").value;
  const jml=Math.max(1,parseInt($("#l_jml").value)||0);
  const perlu=$("#l_perlu").value.trim();
  if(!nama)return toast("Nama peminjam wajib diisi.","err");
  if(!barangId)return toast("Pilih barang yang dipinjam.","err");
  if(!perlu)return toast("Keperluan wajib diisi.","err");
  const it=getItem(barangId);
  if(it.stok<jml)return toast(`Stok tidak cukup! Sisa <b>${it.stok} ${esc(it.satuan)}</b>.`,"err");
  DB.loans.push({id:uid(),nama,identitas:$("#l_ident").value.trim(),kontak:$("#l_wa").value.trim(),
    barangId,namaSnap:it.nama,jumlah:jml,tglPinjam:$("#l_tgl").value||todayISO(),tglRencana:$("#l_renc").value||todayISO(),
    tglKembali:"",keperluan:perlu,status:"dipinjam",dikembalikanOleh:"",kondisiKembali:"",catatan:$("#l_cat").value.trim()});
  it.stok-=jml;save();closeModal();render();
  toast(`<b>${esc(nama)}</b> meminjam <b>${esc(it.nama)} ×${jml}</b>. Sisa stok ${it.stok}.`);
}
function formReturn(id){
  const l=DB.loans.find(x=>x.id===id);if(!l)return;
  if(!requireAdmin())return;
  const pend=l.status==="menunggu";
  openModalShell("back",pend?"Setujui Pengembalian":"Konfirmasi Pengembalian",`${l.nama} — ${l.namaSnap} ×${l.jumlah}${pend&&l.tglDiajukan?` • diajukan ${fmtTgl(l.tglDiajukan)}`:""}`,
  `<div class="form-grid">
    <div><label class="lbl">Tanggal Diterima Lab <i>*</i></label><input class="input" type="date" id="r_tgl" value="${(pend&&l.tglDiajukan)||todayISO()}"><div class="hint">Jatuh tempo: ${fmtTgl(l.tglRencana)}${l.tglRencana<todayISO()?' — <b style="color:var(--red)">TERLAMBAT</b>':""}</div></div>
    <div><label class="lbl">Kondisi Saat Kembali</label><select class="input" id="r_kon"><option>Baik</option><option>Rusak Ringan</option><option>Rusak Berat</option><option>Hilang Sebagian</option></select></div>
    <div class="full"><label class="lbl">Dikembalikan Oleh <i>*</i></label><input class="input" id="r_oleh" value="${esc((pend&&l.diajukanOleh)||l.nama)}" placeholder="Nama yang mengembalikan (bisa diwakilkan)"><div class="hint">Isi sesuai orang yang datang mengembalikan — boleh berbeda dari peminjam.</div></div>
    <div class="full"><label class="lbl">Catatan Pengembalian</label><textarea class="input" id="r_cat" placeholder="Kelengkapan, kerusakan, dsb.">${pend?esc(l.catatanAjuan||""):""}</textarea></div>
  </div>`,
  `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-green" onclick="saveReturn('${l.id}')">Setujui & Konfirmasi</button>`);
}
function saveReturn(id){
  const l=DB.loans.find(x=>x.id===id);if(!l)return;
  if(!requireAdmin())return;
  const oleh=$("#r_oleh").value.trim();
  if(!oleh)return toast("Nama pengembali wajib diisi.","err");
  l.tglKembali=$("#r_tgl").value||todayISO();
  l.kondisiKembali=$("#r_kon").value;l.dikembalikanOleh=oleh;
  l.catatan=$("#r_cat").value.trim();l.status="kembali";
  l.diajukanOleh="";l.tglDiajukan="";l.catatanAjuan="";
  const it=getItem(l.barangId);if(it)it.stok+=l.jumlah;
  save();closeModal();render();
  toast(`Barang kembali oleh <b>${esc(oleh)}</b>. Stok ${it?esc(it.nama)+" → "+it.stok:""} bertambah.`);
}
function formRequestReturn(id){
  const l=DB.loans.find(x=>x.id===id);if(!l||l.status!=="dipinjam")return;
  if(!isAdmin()&&!isOwner(l))return toast("Hanya <b>peminjam</b> yang bisa mengajukan pengembalian.","err");
  openModalShell("back","Ajukan Pengembalian",`${l.nama} — ${l.namaSnap} ×${l.jumlah}`,
  `<div class="form-grid">
    <div><label class="lbl">Tanggal Dikembalikan <i>*</i></label><input class="input" type="date" id="q_tgl" value="${todayISO()}"><div class="hint">Jatuh tempo: ${fmtTgl(l.tglRencana)}</div></div>
    <div><label class="lbl">Dikembalikan Oleh <i>*</i></label><input class="input" id="q_oleh" value="${esc(l.nama)}"></div>
    <div class="full"><label class="lbl">Catatan untuk Admin</label><textarea class="input" id="q_cat" placeholder="Kondisi barang, kelengkapan, dsb."></textarea><div class="hint">Ajuan diteruskan ke admin. Stok bertambah setelah admin konfirmasi.</div></div>
  </div>`,
  `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-amber" onclick="saveRequest('${l.id}')">Kirim Ajuan</button>`);
}
function saveRequest(id){
  const l=DB.loans.find(x=>x.id===id);if(!l||l.status!=="dipinjam")return;
  if(!isAdmin()&&!isOwner(l))return toast("Hanya <b>peminjam</b> yang bisa mengajukan pengembalian.","err");
  const oleh=$("#q_oleh").value.trim();
  if(!oleh)return toast("Nama pengembali wajib diisi.","err");
  l.status="menunggu";
  l.tglDiajukan=$("#q_tgl").value||todayISO();
  l.diajukanOleh=oleh;
  l.catatanAjuan=$("#q_cat").value.trim();
  save();closeModal();render();
  toast(`Ajuan pengembalian dikirim. Menunggu <b>konfirmasi admin</b>.`);
}
function cancelRequest(id){
  const l=DB.loans.find(x=>x.id===id);if(!l||l.status!=="menunggu")return;
  if(!isAdmin()&&!isOwner(l))return toast("Hanya <b>peminjam</b> yang bisa membatalkan ajuan ini.","err");
  if(!confirm("Batalkan ajuan pengembalian ini? Status kembali menjadi Dipinjam."))return;
  l.status="dipinjam";l.tglDiajukan="";l.diajukanOleh="";l.catatanAjuan="";
  save();closeModal();render();toast("Ajuan dibatalkan.","warn");
}
function rejectReturn(id){
  if(!requireAdmin())return;
  const l=DB.loans.find(x=>x.id===id);if(!l||l.status!=="menunggu")return;
  const alasan=prompt("Alasan penolakan (mis. barang belum diterima lab):","");
  if(alasan===null)return;
  l.status="dipinjam";l.tglDiajukan="";l.diajukanOleh="";l.catatanAjuan="";
  if(alasan.trim())l.catatan="Ajuan ditolak admin: "+alasan.trim();
  save();closeModal();render();toast("Ajuan <b>ditolak</b>, status kembali Dipinjam.","warn");
}
function detailLoan(id){
  const l=DB.loans.find(x=>x.id===id);if(!l)return;
  const s=loanState(l);
  openModalShell("eye","Detail Peminjaman",l.namaSnap,
  `<div class="detail-list">
    <div class="drow"><span>Status</span><b>${s==="done"?"Dikembalikan":s==="late"?"Terlambat":"Dipinjam"}</b></div>
    <div class="drow"><span>Peminjam</span><b>${esc(l.nama)}</b></div>
    <div class="drow"><span>Identitas</span><b>${esc(l.identitas||"—")}</b></div>
    <div class="drow"><span>Kontak</span><b>${esc(l.kontak||"—")}</b></div>
    <div class="drow"><span>Barang</span><b>${esc(l.namaSnap)} ×${l.jumlah}</b></div>
    <div class="drow"><span>Tgl Pinjam</span><b>${fmtTgl(l.tglPinjam)}</b></div>
    <div class="drow"><span>Rencana Kembali</span><b>${fmtTgl(l.tglRencana)}</b></div>
    <div class="drow"><span>Kembali Aktual</span><b>${l.tglKembali?fmtTgl(l.tglKembali):"—"}</b></div>
    <div class="drow"><span>Dikembalikan Oleh</span><b>${esc(l.dikembalikanOleh||"—")}</b></div>
    <div class="drow"><span>Kondisi Kembali</span><b>${esc(l.kondisiKembali||"—")}</b></div>
    ${s==="pending"?`<div class="drow"><span>Diajukan Oleh</span><b>${esc(l.diajukanOleh||"—")}</b></div><div class="drow"><span>Tgl Diajukan</span><b>${fmtTgl(l.tglDiajukan)}</b></div>${l.catatanAjuan?`<div class="drow" style="flex-direction:column;align-items:flex-start;gap:6px"><span>Catatan Ajuan</span><b style="text-align:left;font-weight:600">${esc(l.catatanAjuan)}</b></div>`:""}`:""}
    <div class="drow" style="flex-direction:column;align-items:flex-start;gap:6px"><span>Keperluan</span><b style="text-align:left;font-weight:600">${esc(l.keperluan)}</b></div>
    ${l.catatan?`<div class="drow" style="flex-direction:column;align-items:flex-start;gap:6px"><span>Catatan</span><b style="text-align:left;font-weight:600">${esc(l.catatan)}</b></div>`:""}
  </div>`,
  (s==="pending"&&isAdmin())?`<button class="btn btn-danger" onclick="rejectReturn('${l.id}')">Tolak Ajuan</button><button class="btn btn-green" onclick="formReturn('${l.id}')">Setujui & Konfirmasi</button>`
    :(s==="active"&&isAdmin())?`<button class="btn btn-ghost" onclick="closeModal()">Tutup</button><button class="btn btn-green" onclick="formReturn('${l.id}')">Konfirmasi Kembali</button>`
    :(s==="active"&&isOwner(l)&&!isAdmin())?`<button class="btn btn-ghost" onclick="closeModal()">Tutup</button><button class="btn btn-amber" onclick="formRequestReturn('${l.id}')">Ajukan Pengembalian</button>`
    :(s==="pending"&&isOwner(l)&&!isAdmin())?`<button class="btn btn-ghost" onclick="closeModal()">Tutup</button><button class="btn btn-danger" onclick="cancelRequest('${l.id}')">Batalkan Ajuan</button>`
    :`<button class="btn btn-ghost btn-block" onclick="closeModal()">Tutup</button>`);
}
function delLoan(id){
  if(!requireAdmin())return;
  const l=DB.loans.find(x=>x.id===id);if(!l)return;
  if(l.status!=="kembali"&&!confirm(`Peminjaman "${l.nama}" masih AKTIF (belum kembali).\nHapus tetap akan mengembalikan stok (+${l.jumlah}). Lanjut?`))return;
  if(l.status==="kembali"&&!confirm(`Hapus riwayat peminjaman "${l.nama}"?`))return;
  if(l.status!=="kembali"){const it=getItem(l.barangId);if(it)it.stok+=l.jumlah}
  DB.loans=DB.loans.filter(x=>x.id!==id);save();render();toast("Data peminjaman dihapus.","warn");
}
