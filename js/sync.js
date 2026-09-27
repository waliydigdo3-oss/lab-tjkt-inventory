/* =====================================================
 * LAB TJKT — js/sync.js
 * Sinkronisasi Google Sheets via Apps Script Web App.
 * LocalStorage = cache offline; Sheets = data bersama.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= SINKRONISASI GOOGLE SHEETS ================= */
const LS_API="labtjkt_api_url", LS_LASTSYNC="labtjkt_last_sync";
const SYNC_COLS=["items","purchases","loans","users"];
let _pushTimer=null, _syncing=false;

function getApiUrl(){try{return (localStorage.getItem(LS_API)||"").trim()}catch(e){return""}}
function isSyncOn(){return getApiUrl().indexOf("https://script.google.com/")==0}
function lastSyncText(){try{return localStorage.getItem(LS_LASTSYNC)||""}catch(e){return""}}
function markSynced(){try{localStorage.setItem(LS_LASTSYNC,new Date().toLocaleString("id-ID"))}catch(e){}}

async function apiRead(){
  const r=await fetch(getApiUrl()+"?action=read&_="+Date.now(),{method:"GET"});
  if(!r.ok)throw new Error("HTTP "+r.status);
  const j=await r.json();
  if(!j||!j.ok)throw new Error((j&&j.error)||"respons tidak valid");
  return j.data||{};
}
async function apiWrite(collection,rows){
  // POST sebagai text/plain agar tidak kena preflight CORS di Apps Script
  const r=await fetch(getApiUrl(),{method:"POST",body:JSON.stringify({collection:collection,rows:rows||[]})});
  if(!r.ok)throw new Error("HTTP "+r.status);
  const j=await r.json();
  if(!j||!j.ok)throw new Error((j&&j.error)||"gagal tulis");
  return true;
}
function normalizeDB(){
  const num=v=>{const n=Number(v);return isFinite(n)?n:0};
  (DB.items||[]).forEach(o=>{o.stok=num(o.stok);o.minStok=num(o.minStok);o.harga=num(o.harga)});
  (DB.purchases||[]).forEach(o=>{o.jumlah=num(o.jumlah);o.harga=num(o.harga);o.total=num(o.total)});
  (DB.loans||[]).forEach(o=>{o.jumlah=num(o.jumlah);o.kontak=String(o.kontak==null?"":o.kontak)});
}
function schedulePush(){
  if(!isSyncOn()||!currentUser)return;
  clearTimeout(_pushTimer);
  _pushTimer=setTimeout(()=>{pushAll(true)},900);
}
async function pushAll(silent){
  if(!isSyncOn()||_syncing)return false;
  _syncing=true;
  try{
    for(const k of SYNC_COLS)await apiWrite(k,DB[k]||[]);
    markSynced();
    if(!silent)toast("Semua data terkirim ke <b>Google Sheets</b>.");
    return true;
  }catch(err){
    if(!silent)toast("Gagal sinkron: "+esc(err.message||err),"err");
    return false;
  }finally{_syncing=false}
}
async function pullFromSheets(silent){
  if(!isSyncOn()||_syncing)return false;
  _syncing=true;
  try{
    const d=await apiRead();
    const hasRemote=SYNC_COLS.some(k=>Array.isArray(d[k])&&d[k].length>0);
    const hasLocal=(DB.items.length+DB.purchases.length+DB.loans.length)>0;
    if(hasRemote){
      DB={items:d.items||[],purchases:d.purchases||[],loans:d.loans||[],users:d.users||[]};
      ensureUsers();normalizeDB();saveLocal();
      if(currentUser)currentUser=(DB.users||[]).find(x=>x.id===currentUser.id)||currentUser;
      markSynced();applyRoleUI();render();
      if(!silent)toast("Data terbaru dari <b>Google Sheets</b> dimuat.");
    }else if(hasLocal){
      _syncing=false;
      return pushAll(silent); // Sheets masih kosong → unggah data lokal
    }else if(!silent){
      toast("Sheets & data lokal sama-sama kosong.");
    }
    return true;
  }catch(err){
    if(!silent)toast("Gagal sinkron: "+esc(err.message||err)+". Memakai data lokal.","err");
    return false;
  }finally{_syncing=false}
}
function bootPull(){
  if(!isSyncOn()||!currentUser)return;
  pullFromSheets(true); // sinkron diam-diam saat dibuka / login
}
window.addEventListener("online",()=>{if(isSyncOn()&&currentUser)pushAll(true)});
function connectSheets(){
  if(!requireAdmin())return;
  const u=$("#apiUrl").value.trim();
  if(u.indexOf("https://script.google.com/")!==0)return toast("Tempel URL Web App yang valid (https://script.google.com/.../exec).","err");
  try{localStorage.setItem(LS_API,u)}catch(e){}
  closeModal();
  toast("Menghubungkan ke <b>Google Sheets</b>...");
  pullFromSheets(false);
}
function disconnectSheets(){
  if(!requireAdmin())return;
  if(!confirm("Putuskan sinkronisasi Google Sheets? Data lokal tetap tersimpan."))return;
  try{localStorage.removeItem(LS_API);localStorage.removeItem(LS_LASTSYNC)}catch(e){}
  closeModal();toast("Sinkronisasi diputus. Aplikasi kembali offline penuh.","warn");
}
function manualSync(){
  if(!requireAdmin())return;
  if(!isSyncOn())return toast("Hubungkan URL Web App dulu.","err");
  closeModal();
  toast("Menyinkronkan dengan <b>Google Sheets</b>...");
  pullFromSheets(false);
}
