/* =====================================================
 * LAB TJKT — js/ui.js
 * Navigasi halaman, pencarian global, dan sistem modal.
 * Dimuat KEDUA.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= NAVIGASI ================= */
function go(p){
  if(!isAdmin()&&(p==="beli"||p==="pengguna")){toast("Halaman ini khusus <b>admin</b>.","err");return}
  page=p;
  $$("#mainNav .nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===p));
  $$("#bottomNav button").forEach(b=>b.classList.toggle("active",b.dataset.page===p));
  $$(".page").forEach(s=>s.classList.remove("active"));
  $("#page-"+p).classList.add("active");
  let labels={dashboard:"Tambah",stok:"Barang",beli:"Pembelian",pinjam:"Pinjam",pengguna:"Pengguna"};
  if(!isAdmin())labels={dashboard:"Pinjam",stok:"Pinjam",pinjam:"Pinjam"};
  $("#quickAddLabel").textContent=labels[p]||"Tambah";
  $("#sidebar").classList.remove("open");$("#sidebarOverlay").classList.remove("show");
  window.scrollTo({top:0,behavior:"smooth"});
  render();
}
$$("#mainNav .nav-btn, #bottomNav button").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$("#menuBtn").onclick=()=>{$("#sidebar").classList.add("open");$("#sidebarOverlay").classList.add("show")};
$("#sidebarOverlay").onclick=()=>{$("#sidebar").classList.remove("open");$("#sidebarOverlay").classList.remove("show")};
$("#quickAddBtn").onclick=()=>{
  if(!isAdmin())return openModal("loan");
  if(page==="beli")openModal("purchase");
  else if(page==="pinjam")openModal("loan");
  else if(page==="pengguna")return formUser();
  else openModal("item");
};
$("#searchToggle").onclick=()=>$("#searchWrap").classList.toggle("mobile-show");
$("#globalSearch").addEventListener("input",e=>{searchQ=e.target.value.trim().toLowerCase();render()});
document.addEventListener("keydown",e=>{
  if(e.key==="/"&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="TEXTAREA"){e.preventDefault();$("#globalSearch").focus()}
  if(e.key==="Escape")closeModal();
});

/* ================= MODAL SYSTEM ================= */
const ICONS={
  item:'<svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>',
  buy:'<svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>',
  loan:'<svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M16 21h5v-5M8 21H3v-5M21 21l-7-7M3 21l7-7"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};
function openModalShell(icon,title,sub,bodyHTML,footHTML,wide=false){
  $("#modalIco").innerHTML=ICONS[icon]||ICONS.item;
  $("#modalTitle").textContent=title;$("#modalSub").textContent=sub;
  $("#modalBody").innerHTML=bodyHTML;$("#modalFoot").innerHTML=footHTML;
  $("#modalBox").classList.toggle("wide",!!wide);
  $("#modalBg").classList.add("open");
  $("#modalBg").scrollTop=0;
}
function closeModal(){$("#modalBg").classList.remove("open")}
$("#modalBg").addEventListener("click",e=>{if(e.target.id==="modalBg")closeModal()});
