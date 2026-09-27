/* =====================================================
 * LAB TJKT — js/device.js
 * Mode Ringan selalu aktif.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= ADAPTASI PERANGKAT ================= */
function applyLiteMode(){
  // Satu-satunya mode: Mode Ringan — selalu aktif agar ringan di semua perangkat.
  document.body.classList.add("lite");
  try{localStorage.removeItem(LS_LITE)}catch(e){}
}
