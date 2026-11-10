/* Yoklama ve koruma ekranları: mevcut kart/panel diliyle uyumlu, dokunma hedefleri 44px. */
const {createSession,setEntry,clearEntry,sessionSummary,riskList,attendanceCsv}=require('src/domain/attendance.js');
const {createRecord,updateStatus,summarize,redact}=require('src/storage/safeguarding.js');
const ATT_STATUS=[['present','Var'],['late','Geç'],['absent','Yok'],['excused','İzinli']];
const SG_STATUS=[['open','Açık'],['reviewing','İnceleniyor'],['closed','Kapandı']];
const SG_SEVERITY=[['low','Düşük'],['medium','Orta'],['high','Yüksek']];
const SG_CATEGORY=[['safeguarding','Koruma'],['injury','Sakatlık'],['welfare','Refah'],['conduct','Davranış']];
function createAttendanceViews({state,activeRoster,pageHeader,esc}){
 const attSession=()=>state.data.settings.find(s=>s.id==='attendanceSession')?.value||null;
 const sgRecords=()=>{const raw=state.data.settings.find(s=>s.id==='safeguardingRecords')?.value;return Array.isArray(raw)?raw:[];};
 function attendancePage(){
  const roster=activeRoster(),session=attSession(),players=state.data.players;
  const entries=(roster?.entries||[]).map(e=>players.find(p=>p.id===e.playerId)).filter(Boolean);
  const summary=session?sessionSummary(session,entries):{present:0,late:0,absent:0,excused:0,total:0,rate:0};
  const rows=entries.map(p=>{
   const entry=session?.entries?.[p.id];
   const buttons=ATT_STATUS.map(([value,label])=>`<button type="button" class="${value==='absent'?'att-absent':value==='excused'?'att-excused':''}" data-att-status="${value}" data-player-id="${esc(p.id)}" aria-pressed="${entry?.status===value}">${label}</button>`).join('');
   return `<div class="att-row"><div><div class="att-name">${esc(p.name)}</div><div class="att-meta">${esc(String(p.shirtNumber||''))} · ${esc(p.position||'—')}${entry?.note?` · ${esc(entry.note)}`:''}</div></div><div class="att-actions">${buttons}</div></div>`;
  }).join('');
  const stats=[['Toplam',summary.total],['Var',summary.present],['Geç',summary.late],['Yok',summary.absent],['İzinli',summary.excused],['Devam %',summary.rate]].map(([k,v])=>`<div class="att-stat"><strong>${esc(String(v))}</strong><span>${esc(k)}</span></div>`).join('');
  const sessions=state.data.settings.find(s=>s.id==='attendanceSessions')?.value;
  const risks=riskList(Array.isArray(sessions)?sessions:session?[session]:[],players.map(p=>({id:p.id,name:p.name}))).slice(0,5);
  return `${pageHeader('Yoklama','Yoklama & Devam','Antrenman ve maç yoklamasını tek dokunuşla işaretle; devam oranı ve risk listesi anında güncellenir.')}
 <div class="att-layout">
  <div class="att-toolbar">
   <label>Oturum tarihi<input type="date" id="att-date" value="${esc(session?.date||new Date().toISOString().slice(0,10))}"></label>
   <label>Oturum türü<select id="att-kind"><option value="training" ${session?.kind==='training'?'selected':''}>Antrenman</option><option value="match" ${session?.kind==='match'?'selected':''}>Maç</option></select></label>
   <button class="btn btn-primary" data-action="att-save">Oturumu kaydet</button>
   <button class="btn btn-subtle" data-action="att-csv">CSV indir</button>
  </div>
  <div class="att-summary">${stats}</div>
  ${entries.length?`<div class="att-list">${rows}</div>`:`<div class="att-empty">Yoklama için önce maç kadrosu seç. Kadro Seçimi ekranından oyuncu ekle.</div><div class="att-list">${players.filter(p=>!(roster?.entries||[]).some(e=>e.playerId===p.id)).slice(0,30).map(p=>`<div class="att-row"><div><div class="att-name">${esc(p.name)}</div><div class="att-meta">${esc(String(p.shirtNumber||''))} · kadro dışı</div></div><div class="att-actions">${ATT_STATUS.map(([value,label])=>`<button type="button" class="${value==='absent'?'att-absent':value==='excused'?'att-excused':''}" data-att-status="${value}" data-player-id="${esc(p.id)}" aria-pressed="${session?.entries?.[p.id]?.status===value}">${label}</button>`).join('')}</div></div>`).join('')}</div>`}
  ${risks.length?`<div class="att-empty">Devam riski: ${risks.map(r=>esc(r.player?.name||'')).join(', ')}</div>`:''}
 </div>`;
 }
 function safeguardingPage(){
  const records=sgRecords(),summary=summarize(records);
  const stats=[['Toplam',summary.total],['Açık',summary.open],['İnceleniyor',summary.reviewing],['Kapandı',summary.closed]].map(([k,v])=>`<div class="att-stat"><strong>${esc(String(v))}</strong><span>${esc(k)}</span></div>`).join('');
  const rows=records.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(r=>`<div class="att-row"><div><div class="att-name">${esc(redact(r).summary)}</div><div class="att-meta">${esc(r.date)} · <span class="sg-badge ${esc(r.severity)}">${esc(r.severity)}</span> <span class="sg-badge ${esc(r.status)}">${esc(r.status)}</span> · ${esc(r.category)}</div></div><div class="att-actions">${SG_STATUS.map(([v,l])=>`<button type="button" data-sg-status="${v}" data-record-id="${esc(r.id)}" aria-pressed="${r.status===v}" ${r.status==='closed'?'disabled':''}>${l}</button>`).join('')}</div></div>`).join('');
  return `${pageHeader('Koruma','Koruma Kaydı','Çocuk koruma ve refah olaylarını denetim iziyle kaydet. Serbest metin kayıtta maskelenir.')}
 <div class="att-layout">
  <div class="att-summary">${stats}</div>
  <form id="sg-form" class="att-toolbar">
   <label>Tarih<input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}"></label>
   <label>Kategori<select name="category">${SG_CATEGORY.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>
   <label>Önem<select name="severity">${SG_SEVERITY.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>
   <label>Özet<input type="text" name="summary" maxlength="400" required placeholder="Kısa, kişisel veri içermeyen açıklama"></label>
   <button class="btn btn-primary" type="button" data-action="sg-add">Kaydı ekle</button>
  </form>
  ${records.length?`<div class="att-list">${rows}</div>`:'<div class="att-empty">Henüz koruma kaydı yok.</div>'}
 </div>`;
 }
 return {attendancePage,safeguardingPage};
}
Object.assign(exports,{createAttendanceViews});
