/* =====================================================
 * LAB TJKT — js/dashboard.js
 * Render dashboard: statistik, grafik, peringatan, aktivitas.
 * (Plain script, tanpa build step. Urutan muat di index.html)
 * ===================================================== */
"use strict";
/* ================= RENDER: DASHBOARD ================= */
function renderDashboard(){
  const totalUnit=DB.items.reduce((a,b)=>a+Number(b.stok||0),0);
  const tipis=DB.items.filter(i=>i.stok<=i.minStok);
  const aktif=DB.loans.filter(l=>l.status!=="kembali");
  const telat=aktif.filter(l=>loanState(l)==="late");
  const menunggu=DB.loans.filter(l=>l.status==="menunggu");
  const bln=thisMonth();
  const belanjaBln=DB.purchases.filter(p=>p.tanggal.startsWith(bln)).reduce((a,b)=>a+Number(b.total||0),0);
  const belanjaTot=DB.purchases.reduce((a,b)=>a+Number(b.total||0),0);
  $("#stJenis").textContent=DB.items.length;
  $("#stUnit").textContent=totalUnit+" unit total";
  $("#stTipis").textContent=tipis.length;
  $("#stPinjam").textContent=aktif.length;
  $("#stTerlambat").textContent=telat.length+" terlambat";
  $("#stBelanja").textContent=fmtRp(belanjaBln);
  $("#stBelanjaTotal").textContent="total "+fmtRp(belanjaTot);
  $("#todayLine").textContent=new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})+" — ringkasan stok, pembelian & peminjaman.";
  const badge=$("#navLoanBadge");
  badge.style.display=aktif.length?"flex":"none";badge.textContent=aktif.length;

  // Grafik 6 bulan
  const months=[];
  for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);months.push({k:d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"),l:d.toLocaleDateString("id-ID",{month:"short"})})}
  const vals=months.map(m=>DB.purchases.filter(p=>p.tanggal.startsWith(m.k)).reduce((a,b)=>a+Number(b.total||0),0));
  const max=Math.max(...vals,1);
  $("#monthChart").innerHTML=months.map((m,i)=>{
    const h=Math.max(6,Math.round(vals[i]/max*110));
    return `<div class="mcol"><div class="col${vals[i]?"":" low"}" style="height:${h}px" title="${m.l} : ${fmtRp(vals[i])}"></div><span>${m.l}</span></div>`;
  }).join("");

  // Kategori
  const byCat={};DB.items.forEach(i=>byCat[i.kategori]=(byCat[i.kategori]||0)+Number(i.stok||0));
  const totCat=Math.max(1,Object.values(byCat).reduce((a,b)=>a+b,0));
  const colors=["","amber","violet","red"];
  const cats=Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,6);
  $("#catBars").innerHTML=cats.length?cats.map(([k,v],i)=>{
    const pct=Math.round(v/totCat*100);
    return `<div class="bar-row"><div class="t"><span>${esc(k)}</span><strong>${v} unit • ${pct}%</strong></div><div class="bar ${colors[i%4]}"><i style="width:${pct}%"></i></div></div>`;
  }).join(""):`<div class="empty"><b>Belum ada data</b>Tambahkan barang dulu.</div>`;

  // Alert
  const alerts=[
    ...tipis.slice(0,4).map(i=>({red:i.stok<=0,t:`<b>${esc(i.nama)}</b><small>Stok ${i.stok} ${esc(i.satuan)} • min. ${i.minStok} • ${esc(i.lokasi)}</small>`,go:"stok"})),
    ...(isAdmin()?menunggu:menunggu.filter(isOwner)).slice(0,4).map(l=>({red:false,t:`<b>${esc(l.nama)} — ${esc(l.namaSnap)}</b><small>Diajukan ${fmtTgl(l.tglDiajukan)} • menunggu konfirmasi admin</small>`,go:"pinjam"})),
    ...telat.slice(0,4).map(l=>({red:true,t:`<b>${esc(l.nama)} — ${esc(l.namaSnap)}</b><small>Terlambat sejak ${fmtTgl(l.tglRencana)} • ${esc(l.identitas)}</small>`,go:"pinjam"}))
  ];
  $("#alertList").innerHTML=alerts.length?alerts.map(a=>`<div class="alert-item"><div class="warn${a.red?" red":""}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg></div><div style="flex:1;min-width:0">${a.t}</div><button class="mini-btn go" style="flex:0 0 auto;padding:8px 14px" onclick="go('${a.go}')">Lihat</button></div>`).join("")
    :`<div class="empty"><b>Semua aman</b>Tidak ada stok kritis, keterlambatan, atau ajuan pending.</div>`;

  // Aktivitas
  const acts=[
    ...(isAdmin()?DB.purchases:[]).map(p=>({d:p.tanggal,ico:"buy",t:`<b>Pembelian:</b> ${esc(p.namaSnap)} ×${p.jumlah}`,s:`${fmtTgl(p.tanggal)} • ${fmtRp(p.total)} • ${esc(p.kegunaan).slice(0,60)}`})),
    ...DB.loans.map(l=>({d:l.status==="kembali"&&l.tglKembali?l.tglKembali:l.status==="menunggu"&&l.tglDiajukan?l.tglDiajukan:l.tglPinjam,ico:l.status==="dipinjam"?"loan":"back",t:l.status==="kembali"?`<b>Kembali:</b> ${esc(l.namaSnap)} oleh ${esc(l.dikembalikanOleh||l.nama)}`:l.status==="menunggu"?`<b>Menunggu:</b> ${esc(l.namaSnap)} — ajuan ${esc(l.diajukanOleh||l.nama)}`:`<b>Pinjam:</b> ${esc(l.namaSnap)} oleh ${esc(l.nama)}`,s:`${fmtTgl(l.status==="kembali"&&l.tglKembali?l.tglKembali:l.status==="menunggu"&&l.tglDiajukan?l.tglDiajukan:l.tglPinjam)} • ${esc(l.keperluan).slice(0,60)}`}))
  ].sort((a,b)=>b.d.localeCompare(a.d)).slice(0,8);
  const icoPaths={buy:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',loan:'<path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7"/>',back:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'};
  $("#activityList").innerHTML=acts.length?acts.map(a=>`<div class="act"><div class="d"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icoPaths[a.ico]}</svg></div><div style="min-width:0"><div>${a.t}</div><small>${esc(a.s)}</small></div></div>`).join(""):`<div class="empty"><b>Belum ada aktivitas</b></div>`;
}
