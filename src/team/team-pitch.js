'use strict';
const {getTeamPitchAnalysis}=require('src/domain/team-pitch-analysis.js');
const {TEAM_ROLES}=require('src/domain/team-depth.js');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STATUS={missing:'Eksik',balanced:'Dengeli',crowded:'Alternatif var',optional:'Opsiyonel',alternative:'Alternatif'};

function renderTeamPitch({depth,players=[],selectedRole='GK',selectedSlot=null,prefs={}}){
 const analysis=getTeamPitchAnalysis(depth,players,prefs);
 const slots=analysis.slots;
 const selected=slots.find(s=>s.key===selectedSlot)||slots.find(s=>s.role===selectedRole)||slots[0];
 const roleSelected=selected?.role||selectedRole;
 const fmt=name=>name?esc(name.fullName):'—';
 const cards=slots.map(slot=>{
  const count=Number(Boolean(slot.primary))+Number(Boolean(slot.backup));
  const missing=count<analysis.prefs.depthFactor;
  const status=missing?'missing':slot.alternatives.length?'crowded':'balanced';
  const active=selected?.key===slot.key;
  return '<button type="button" class="dg-tp-role dg-tp-'+status+(active?' is-selected':'')+'"'+
   ' data-team-role="'+esc(slot.role)+'" data-team-slot="'+esc(slot.key)+'"'+
   ' aria-pressed="'+active+'" aria-label="'+esc(slot.label)+', '+esc(slot.tacticalRoleName)+', '+count+' tercih, '+slot.alternatives.length+' ek alternatif"'+
   ' style="--x:'+slot.x+'%;--y:'+slot.y+'%">'+
   '<span class="dg-tp-role-header"><span class="dg-tp-name">'+esc(slot.short)+
   '<small>'+esc(slot.label)+'</small></span><strong>'+count+'<i>/'+analysis.prefs.depthFactor+'</i></strong></span>'+
   '<span class="dg-tp-role-tactic">'+esc(slot.tacticalRoleName)+'</span>'+
   '<span class="dg-tp-roster"><span><b>1.</b> '+fmt(slot.primary)+'</span>'+
   '<span><b>2.</b> '+fmt(slot.backup)+'</span></span>'+
   '<span class="dg-tp-status">'+(slot.alternatives.length?'+'+slot.alternatives.length+' alternatif':STATUS[status])+'</span>'+
   '</button>';
 }).join('');
 const rows=slots.map(slot=>{
  const active=selected?.key===slot.key;
  const alternatives=slot.alternatives.map((p,i)=>'<span class="dg-tp-alt-name">'+(i+3)+'. '+fmt(p)+'</span>').join('');
  return '<button type="button" class="dg-tp-slot-row dg-tp-slot-detail'+(active?' selected':'')+'" data-team-role="'+esc(slot.role)+'" data-team-slot="'+esc(slot.key)+'" aria-pressed="'+active+'">'+
   '<strong>'+esc(slot.short)+'</strong><span class="dg-tp-slot-candidates"><b>'+esc(slot.label)+' · '+esc(slot.tacticalRoleName)+'</b>'+
   '<small>1. '+fmt(slot.primary)+' · 2. '+fmt(slot.backup)+'</small>'+
   (alternatives?'<span class="dg-tp-extra-candidates" aria-label="Diğer adaylar">'+alternatives+'</span>':'<small>Başka aday atanmadı</small>')+
   '</span><em>'+slot.candidateCount+' aday</em></button>';
 }).join('');
 const roleButtons=TEAM_ROLES.map(r=>{
  const active=r.code===roleSelected,info=analysis.positions[r.code];
  return '<button type="button" data-team-role="'+r.code+'" aria-pressed="'+active+'" class="'+(active?'selected':'')+'">'+
   esc(r.name)+' <small>'+info.candidateCount+'</small></button>';
 }).join('');
 const selectedInfo=selected?
  '<div class="dg-tp-selected"><div><small>BAĞIMSIZ MEVKİ KARTI</small><strong>'+esc(selected.label)+
  ' <em>'+selected.candidateCount+' aday · '+esc(selected.tacticalRoleName)+'</em></strong></div>'+
  '<span class="dg-tp-selected-'+(selected.primary?'balanced':'missing')+'">'+(selected.primary?'Aktif adaylar':'Eksik')+'</span></div>':'';
 const flags='<div class="dg-tp-summary" role="status">'+
  '<span class="dg-tp-flag"><b>'+analysis.assignedPrimary+'/'+slots.length+'</b> ilk kadro</span>'+
  '<span class="dg-tp-flag"><b>'+analysis.assignedBackups+'</b> ikinci seçenek</span>'+
  '<span class="dg-tp-flag"><b>'+analysis.missingSlots+'</b> boş tercih</span>'+
  '<span class="dg-tp-flag"><b>'+analysis.duplicateRoleNominations+'</b> çok mevki adayı</span>'+
  '<span class="dg-tp-flag"><b>'+analysis.unassigned.length+'</b> henüz atanmadı</span></div>';
 return '<div class="dg-tp-module dg-tp-f19" role="group" aria-label="Mevkiye özel antrenör tercihleri">'+
  flags+
  '<div class="dg-tp-current-formation" role="status">'+esc(analysis.prefs.formation)+' · '+slots.length+' bağımsız görev · 1. ve 2. tercih + sınırsız alternatif</div>'+
  '<div class="dg-tp-ground" data-slot-count="'+slots.length+'" role="group" aria-label="Dizilişte bağımsız saha görevleri">'+
  '<svg class="dg-tp-lines" viewBox="0 0 620 790" preserveAspectRatio="none" aria-hidden="true">'+
  '<rect x="17" y="15" width="586" height="760" rx="5" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>'+
  '<line x1="17" y1="395" x2="603" y2="395" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>'+
  '<circle cx="310" cy="395" r="84" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>'+
  '<rect x="172" y="15" width="276" height="109" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>'+
  '<rect x="172" y="666" width="276" height="109" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>'+
  '</svg><div class="dg-tp-grid dg-tp-grid-dynamic">'+cards+'</div><span class="dg-tp-attacking">HÜCUM YÖNÜ ↑</span></div>'+
  '<div class="dg-tp-slot-list"><div class="dg-tp-slot-list-head">BAĞIMSIZ MEVKİ KARTLARI · '+slots.length+' GÖREV <small>1. ve 2. tercih önde, tüm diğer alternatifler aşağıda.</small></div>'+
  '<div class="dg-tp-slot-list-grid">'+rows+'</div></div>'+
  '<div class="dg-tp-role-picker" aria-label="Mevki kategorileri"><span>MEVKİLER</span>'+roleButtons+'</div>'+
  selectedInfo+
  '<p class="dg-tp-info">Her saha kartı ayrı görevdir. Sıra ve rol antrenör tarafından belirlenir. Aynı oyuncu birden çok göreve aday olabilir, ancak bir dizilişte aynı anda iki görevde sayılmaz; bu analiz resmî kadro kararı yerine geçmez.</p>'+
  '</div>';
}
Object.assign(exports,{renderTeamPitch});
