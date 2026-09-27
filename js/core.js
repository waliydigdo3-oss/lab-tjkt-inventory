/* =====================================================
 * LAB TJKT — js/core.js
 * Inti: state, konstanta, database (seed/load/save), helper format,
 * toast, status stok & pinjaman. Dimuat PERTAMA.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= DATA & STATE ================= */
const LS_KEY="labstock_v1", LS_LITE="labstock_lite", LS_SES="labstock_session";
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtRp=n=>"Rp"+Number(n||0).toLocaleString("id-ID");
const fmtTgl=d=>{if(!d)return"—";const t=new Date(d+"T00:00:00");return isNaN(t)?d:t.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})};
const todayISO=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const thisMonth=()=>todayISO().slice(0,7);
const KATEGORI=["Elektronik","Komputer","Alat Ukur","Jaringan","Perkakas","Bahan Praktikum","Furniture","ATK","Lainnya"];
const SATUAN=["pcs","unit","set","box","meter","liter","pak","buah"];
const KONDISI=["Baik","Rusak Ringan","Rusak Berat","Perlu Kalibrasi"];
const BELANJA=["Operasional","Praktikum","Penelitian","Perawatan","Pengadaan Baru"];

let DB={items:[],purchases:[],loans:[],users:[]};
let page="dashboard", itemView="grid", loanFilter="semua", searchQ="", currentUser=null;

function seed(){
  const items=[
    {id:uid()+"1",nama:"Mikroskop Cahaya Binokuler",kategori:"Alat Ukur",merk:"Olympus CX23",lokasi:"Rak A1",stok:6,satuan:"unit",minStok:2,kondisi:"Baik",harga:8500000,deskripsi:"Perbesaran 40x–1000x untuk praktikum biologi."},
    {id:uid()+"2",nama:"Multimeter Digital",kategori:"Elektronik",merk:"Sanwa CD800a",lokasi:"Lemari B2",stok:12,satuan:"pcs",minStok:4,kondisi:"Baik",harga:685000,deskripsi:"Ukur tegangan, arus, resistansi."},
    {id:uid()+"3",nama:"Laptop Praktikum",kategori:"Komputer",merk:"Lenovo V14",lokasi:"Rak C1",stok:3,satuan:"unit",minStok:5,kondisi:"Baik",harga:7250000,deskripsi:"Untuk praktikum pemrograman & jaringan."},
    {id:uid()+"4",nama:"Arduino Uno R3 + Kit Sensor",kategori:"Elektronik",merk:"Arduino",lokasi:"Lemari B1",stok:15,satuan:"set",minStok:5,kondisi:"Baik",harga:450000,deskripsi:"Kit mikrokontroler + 37 sensor."},
    {id:uid()+"5",nama:"Kabel UTP Cat6 (roll)",kategori:"Jaringan",merk:"Belden",lokasi:"Gudang",stok:2,satuan:"box",minStok:3,kondisi:"Baik",harga:1250000,deskripsi:"Roll 305m untuk praktikum jaringan."},
    {id:uid()+"6",nama:"Osiloskop Digital 100MHz",kategori:"Alat Ukur",merk:"Rigol DS1102E",lokasi:"Meja Lab 2",stok:0,satuan:"unit",minStok:1,kondisi:"Rusak Ringan",harga:9800000,deskripsi:"Channel 2 error — menunggu servis."},
    {id:uid()+"7",nama:"Obeng Set Presisi 32in1",kategori:"Perkakas",merk:"Nankang",lokasi:"Lemari B3",stok:8,satuan:"set",minStok:3,kondisi:"Baik",harga:185000,deskripsi:"Servis perangkat elektronik kecil."},
    {id:uid()+"8",nama:"Ethanol 96% 1L",kategori:"Bahan Praktikum",merk:"Merck",lokasi:"Lemari Kimia",stok:4,satuan:"liter",minStok:6,kondisi:"Baik",harga:145000,deskripsi:"Sterilisasi & praktikum kimia."}
  ];
  const t=todayISO(), d=n=>{const x=new Date();x.setDate(x.getDate()-n);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
  const m=n=>{const x=new Date();x.setMonth(x.getMonth()-n);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-12"};
  const purchases=[
    {id:uid()+"p1",tanggal:m(5),barangId:items[4].id,namaSnap:items[4].nama,jumlah:4,harga:1250000,total:5000000,supplier:"PT Sarana Kabel",kegunaan:"Praktikum instalasi jaringan semester genap — 40 mahasiswa.",kategoriBelanja:"Praktikum",nota:"INV-2026-031"},
    {id:uid()+"p2",tanggal:m(3),barangId:items[1].id,namaSnap:items[1].nama,jumlah:6,harga:685000,total:4110000,supplier:"Toko Elektro Jaya",kegunaan:"Penambahan alat ukur untuk 3 meja praktikum elektronika dasar.",kategoriBelanja:"Pengadaan Baru",nota:"INV-2026-118"},
    {id:uid()+"p3",tanggal:m(1),barangId:items[7].id,namaSnap:items[7].nama,jumlah:10,harga:145000,total:1450000,supplier:"CV Kimia Lab",kegunaan:"Stok sterilisasi rutin & praktikum kimia organik.",kategoriBelanja:"Operasional",nota:"INV-2026-204"},
    {id:uid()+"p4",tanggal:d(6),barangId:items[3].id,namaSnap:items[3].nama,jumlah:5,harga:450000,total:2250000,supplier:"Arduino Store ID",kegunaan:"Penelitian IoT monitoring suhu ruangan lab.",kategoriBelanja:"Penelitian",nota:"INV-2026-231"}
  ];
  const loans=[
    {id:uid()+"l1",nama:"Nadia Putri",identitas:"NIM 202303101",kontak:"081234567890",barangId:items[0].id,namaSnap:items[0].nama,jumlah:2,tglPinjam:d(4),tglRencana:d(3),tglKembali:"",keperluan:"Praktikum biologi sel — Kelas A",status:"menunggu",dikembalikanOleh:"",kondisiKembali:"",catatan:"",tglDiajukan:d(1),diajukanOleh:"Nadia Putri",catatanAjuan:"2 unit lengkap, kondisi baik."},
    {id:uid()+"l2",nama:"Budi Santoso",identitas:"NIM 202204087",kontak:"081298765432",barangId:items[3].id,namaSnap:items[3].nama,jumlah:3,tglPinjam:d(12),tglRencana:d(2),tglKembali:"",keperluan:"Tugas akhir prototype smart garden",status:"dipinjam",dikembalikanOleh:"",kondisiKembali:"",catatan:"Lewat 2 hari — sudah diingatkan via WA."},
    {id:uid()+"l3",nama:"Siti Rahayu",identitas:"NIP 19880501",kontak:"081377788899",barangId:items[1].id,namaSnap:items[1].nama,jumlah:4,tglPinjam:d(20),tglRencana:d(13),tglKembali:d(13),keperluan:"Kalibrasi alat lab semesteran",status:"kembali",dikembalikanOleh:"Siti Rahayu",kondisiKembali:"Baik",catatan:"Semua unit kembali lengkap."}
  ];
  return {items,purchases,loans,users:defaultUsers()};
}
function saveLocal(){try{localStorage.setItem(LS_KEY,JSON.stringify(DB))}catch(e){}}
function save(){saveLocal();try{if(typeof schedulePush==="function")schedulePush()}catch(e){}}
function load(){
  try{const raw=localStorage.getItem(LS_KEY);if(raw){DB=JSON.parse(raw);ensureUsers();return}}catch(e){}
  DB=seed();save();
}

/* ================= HELPERS ================= */
const getItem=id=>DB.items.find(x=>x.id===id);
function stockStatus(it){
  if(it.stok<=0)return{cls:"bad",txt:"Habis"};
  if(it.stok<=it.minStok)return{cls:"warn",txt:"Menipis"};
  return{cls:"ok",txt:"Aman"};
}
function loanState(l){
  if(l.status==="kembali")return"done";
  if(l.status==="menunggu")return"pending";
  if(l.tglRencana&&l.tglRencana<todayISO())return"late";
  return"active";
}
function isOwner(l){
  return !!currentUser&&String(l.nama||"").trim().toLowerCase()===String(currentUser.nama||"").trim().toLowerCase();
}
function initials(n){return String(n||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase()}
function toast(msg,type=""){
  const box=$("#toasts"),el=document.createElement("div");
  el.className="toast "+type;
  el.innerHTML=`<div style="flex:1">${msg}</div>`;
  box.appendChild(el);
  setTimeout(()=>{el.classList.add("out");setTimeout(()=>el.remove(),320)},3200);
}
function matchSearch(...fields){
  if(!searchQ)return true;
  return fields.join(" ").toLowerCase().includes(searchQ);
}

/* ================= AUTH & HAK AKSES ================= */
function hashPw(pw){
  let h1=0xdeadbeef,h2=0x41c6ce57;const s="labstock$"+String(pw||"");
  for(let i=0;i<s.length;i++){const ch=s.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return(4294967296*(2097151&h2)+(h1>>>0)).toString(36);
}
function defaultUsers(){
  return [
    {id:"u-admin",nama:"Administrator",username:"admin",pass:"5enev629rj",role:"admin",identitas:"",created:todayISO()},
    {id:"u-user",nama:"User Lab",username:"user",pass:"sidawgdwa6",role:"user",identitas:"",created:todayISO()}
  ];
}
function ensureUsers(){
  if(!Array.isArray(DB.items))DB.items=[];
  if(!Array.isArray(DB.purchases))DB.purchases=[];
  if(!Array.isArray(DB.loans))DB.loans=[];
  if(!Array.isArray(DB.users)||!DB.users.length)DB.users=defaultUsers();
}
function isAdmin(){return !!currentUser&&currentUser.role==="admin"}
function requireAdmin(){
  if(isAdmin())return true;
  toast("Akses ditolak: khusus <b>admin</b>.","err");
  return false;
}
function doLogin(){
  const u=$("#loginUser").value.trim().toLowerCase(), p=$("#loginPass").value;
  const err=$("#loginErr");
  if(!u||!p){err.textContent="Isi username & password dulu.";return}
  const acc=(DB.users||[]).find(x=>String(x.username).toLowerCase()===u&&x.pass===hashPw(p));
  if(!acc){err.textContent="Username atau password salah.";return}
  currentUser=acc;
  try{localStorage.setItem(LS_SES,acc.id)}catch(e){}
  $("#loginBg").classList.add("hide");
  $("#loginPass").value="";err.textContent="";
  applyRoleUI();
  render();
  toast(`Selamat datang, <b>${esc(acc.nama)}</b> (${acc.role}).`);
  try{if(typeof bootPull==="function")bootPull()}catch(e){}
}
function doLogout(){
  currentUser=null;
  try{localStorage.removeItem(LS_SES)}catch(e){}
  closeModal();
  $("#loginBg").classList.remove("hide");
  applyRoleUI();
  setTimeout(()=>{try{$("#loginUser").focus()}catch(e){}},100);
}
function applyRoleUI(){
  const admin=isAdmin();
  document.body.classList.toggle("role-user",!admin);
  document.body.classList.toggle("role-admin",admin);
  if(currentUser){
    $("#profileAvatar").textContent=initials(currentUser.nama);
    $("#profileName").textContent=currentUser.nama;
    $("#profileRole").textContent=admin?"Administrator":"User";
    $("#sideAvatar").textContent=initials(currentUser.nama);
    $("#sideName").textContent=currentUser.nama;
    const sr=$("#sideRole");sr.textContent=admin?"ADMIN":"USER";sr.className="chip "+(admin?"warn":"info");
  }
  if(!admin&&(page==="beli"||page==="pengguna")){go("dashboard");return}
  let labels={dashboard:"Tambah",stok:"Barang",beli:"Pembelian",pinjam:"Pinjam",pengguna:"Pengguna"};
  if(!admin)labels={dashboard:"Pinjam",stok:"Pinjam",pinjam:"Pinjam"};
  $("#quickAddLabel").textContent=labels[page]||"Tambah";
}
function initAuth(){
  let sid=null;try{sid=localStorage.getItem(LS_SES)}catch(e){}
  currentUser=(DB.users||[]).find(x=>x.id===sid)||null;
  if(currentUser)$("#loginBg").classList.add("hide");
  else $("#loginBg").classList.remove("hide");
  applyRoleUI();
  render();
  try{if(currentUser&&typeof bootPull==="function")bootPull()}catch(e){}
  if(!currentUser)setTimeout(()=>{try{$("#loginUser").focus()}catch(e){}},200);
}
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&!$("#loginBg").classList.contains("hide")){
    const a=document.activeElement;
    if(a&&(a.id==="loginUser"||a.id==="loginPass"))doLogin();
  }
});
$("#logoutBtn").onclick=doLogout;

/* ---- Ekspor sesuai peran ---- */
function openExport(){
  const admin=isAdmin();
  openModalShell("eye","Ekspor / Backup Data",admin?"Pilih format unduhan":"Unduh data (akses user)",
  `<div style="display:flex;flex-direction:column;gap:10px">
    <button class="btn btn-ghost btn-block" onclick="exportCSV('stok')">Unduh Stok (CSV — Excel)</button>
    ${admin?`<button class="btn btn-ghost btn-block" onclick="exportCSV('beli')">Unduh Pembelian (CSV — Excel)</button>`:""}
    <button class="btn btn-ghost btn-block" onclick="exportCSV('pinjam')">Unduh Peminjaman (CSV — Excel)</button>
    ${admin?`<button class="btn btn-primary btn-block" onclick="exportCSV('semua')">Backup Penuh (JSON)</button>
    <button class="btn btn-danger btn-block" onclick="if(confirm('Reset SEMUA data ke contoh awal?')){DB=seed();save();currentUser=(DB.users||[]).find(x=>x.id===(currentUser&&currentUser.id))||DB.users[0];try{localStorage.setItem(LS_SES,currentUser.id)}catch(e){}applyRoleUI();render();closeModal();toast('Data direset ke contoh awal.','warn')}">Reset ke Data Contoh</button>`:""}
    ${admin?`<div style="border-top:1px solid var(--border-soft);margin-top:4px;padding-top:12px">
      <div style="font-size:13.5px;font-weight:800;margin-bottom:2px">Sinkronisasi Google Sheets</div>
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:8px">Status: <b style="color:${isSyncOn()?"var(--teal)":"var(--amber)"}">${isSyncOn()?"Terhubung":"Belum terhubung"}</b>${isSyncOn()&&lastSyncText()?" • terakhir "+esc(lastSyncText()):""}</div>
      <input class="input" id="apiUrl" placeholder="https://script.google.com/macros/s/.../exec" value="${esc(getApiUrl())}" style="margin-bottom:8px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" style="flex:1" onclick="connectSheets()">Simpan & Sinkronkan</button>
        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="manualSync()">Sinkron Sekarang</button>
        ${isSyncOn()?`<button class="btn btn-danger btn-sm" style="flex:1" onclick="disconnectSheets()">Putuskan</button>`:""}
      </div>
      <div class="hint">Otomatis: 1 sheet per menu — Stok, Pembelian, Peminjaman, Pengguna.</div>
    </div>`:""}
  </div>`,`<button class="btn btn-ghost btn-block" onclick="closeModal()">Tutup</button>`);
}

/* ---- Kelola Pengguna (admin) ---- */
function renderUsers(){
  if(!isAdmin())return;
  const list=(DB.users||[]).filter(u=>matchSearch(u.nama,u.username,u.role,u.identitas));
  $("#userBody").innerHTML=list.length?list.map(u=>`<tr>
    <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:36px;height:36px;font-size:13px;flex-shrink:0">${esc(initials(u.nama))}</div><div><div class="cell-b">${esc(u.nama)}</div><div class="cell-s">${esc(u.identitas||"—")}</div></div></div></td>
    <td><b>${esc(u.username)}</b>${currentUser&&u.id===currentUser.id?' <span class="chip info">Anda</span>':""}</td>
    <td>${u.role==="admin"?'<span class="chip warn">ADMIN</span>':'<span class="chip info">USER</span>'}</td>
    <td>${fmtTgl(u.created)}</td>
    <td><div class="row-actions">
      <button class="tbtn" title="Ubah" onclick="formUser('${u.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
      <button class="tbtn red" title="Hapus" onclick="delUser('${u.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
    </div></td></tr>`).join("")
    :`<tr><td colspan="5"><div class="empty"><b>Tidak ada pengguna ditemukan</b></div></td></tr>`;
}
function formUser(id){
  if(!requireAdmin())return;
  const u=id?(DB.users||[]).find(x=>x.id===id):null;
  const v=(k,d="")=>u?u[k]??d:d;
  openModalShell("user",u?"Ubah Pengguna":"Tambah Pengguna Baru",u?"@"+u.username:"Buat akun admin / user",
  `<div class="form-grid">
    <div class="full"><label class="lbl">Nama Lengkap <i>*</i></label><input class="input" id="u_nama" value="${esc(v("nama"))}" placeholder="mis. Nadia Putri"></div>
    <div><label class="lbl">Username <i>*</i></label><input class="input" id="u_user" value="${esc(v("username"))}" placeholder="tanpa spasi, mis. nadia"></div>
    <div><label class="lbl">Peran / Hak Akses <i>*</i></label><select class="input" id="u_role"><option value="user"${v("role","user")==="user"?" selected":""}>User — lihat stok & pinjam</option><option value="admin"${v("role")==="admin"?" selected":""}>Admin — akses penuh</option></select></div>
    <div class="full"><label class="lbl">NIM / NIP / Identitas (opsional)</label><input class="input" id="u_ident" value="${esc(v("identitas"))}" placeholder="Otomatis terisi saat meminjam"></div>
    <div class="full"><label class="lbl">Password ${u?"(kosongkan jika tidak diubah)":"<i>*</i>"}</label><input class="input" type="text" id="u_pass" placeholder="${u?"••••••":"min. 4 karakter"}"><div class="hint">User: hanya melihat stok + pinjam/kembali. Admin: semua menu termasuk pembelian & kelola user.</div></div>
  </div>`,
  `<button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="saveUser('${id||""}')">Simpan Pengguna</button>`);
}
function saveUser(id){
  if(!requireAdmin())return;
  const nama=$("#u_nama").value.trim();
  const username=$("#u_user").value.trim().toLowerCase().replace(/\s+/g,"");
  const role=$("#u_role").value, pass=$("#u_pass").value, ident=$("#u_ident").value.trim();
  if(!nama||!username)return toast("Nama & username wajib diisi.","err");
  if((DB.users||[]).some(x=>String(x.username).toLowerCase()===username&&x.id!==id))return toast("Username sudah dipakai.","err");
  if(!id&&pass.length<4)return toast("Password minimal 4 karakter.","err");
  if(id){
    const u=DB.users.find(x=>x.id===id);if(!u)return;
    if(u.role==="admin"&&role!=="admin"&&!DB.users.some(x=>x.id!==id&&x.role==="admin"))return toast("Tidak bisa: ini admin terakhir.","err");
    if(pass&&pass.length<4)return toast("Password minimal 4 karakter.","err");
    Object.assign(u,{nama,username,role,identitas:ident});
    if(pass)u.pass=hashPw(pass);
    if(currentUser&&currentUser.id===id)currentUser=u;
    toast(`Pengguna <b>${esc(nama)}</b> diperbarui.`);
  }else{
    DB.users.push({id:uid(),nama,username,pass:hashPw(pass),role,identitas:ident,created:todayISO()});
    toast(`Akun <b>${esc(username)}</b> (${role}) dibuat.`);
  }
  save();closeModal();applyRoleUI();render();
}
function delUser(id){
  if(!requireAdmin())return;
  const u=(DB.users||[]).find(x=>x.id===id);if(!u)return;
  if(currentUser&&u.id===currentUser.id)return toast("Tidak bisa menghapus akun sendiri.","err");
  if(u.role==="admin"&&!DB.users.some(x=>x.id!==id&&x.role==="admin"))return toast("Tidak bisa: ini admin terakhir.","err");
  if(!confirm(`Hapus akun "${u.nama}" (@${u.username})?`))return;
  DB.users=DB.users.filter(x=>x.id!==id);save();render();toast("Akun dihapus.","warn");
}
