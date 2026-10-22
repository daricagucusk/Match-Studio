
const {getTeamPitchAnalysis,getFormationPitchSlots}=require("src/domain/team-pitch-analysis.js");
const {TEAM_ROLES}=require("src/domain/team-depth.js");

const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const SHORT={GK:'KL',RB:'SB',CB:'STP',LB:'SLB',DM:'ÖL',CM:'MO',AM:'OO',RW:'SK',LW:'SLK',ST:'SF'};
const STATUS={missing:'EKSİK',balanced:'DENGELİ',crowded:'YOĞUN',optional:'OPSİYONEL',alternative:'ALTERNATİF'};
function renderTeamPitch({depth,players=[],selectedRole='GK',prefs={}}){
 const analysis=getTeamPitchAnalysis(depth,players,prefs);
 const slots=analysis.slots;
 const cards=slots.map(slot=>{
  const p=analysis.positions[slot.role];
  // Resolved at group level: each athlete appears once across all positions.
  const assigned=[slot.primary,...(analysis.prefs.depthFactor===2?[slot.backup]:[])].filter(Boolean);
  const missing=assigned.length<analysis.prefs.depthFactor;
  const status=missing?'missing':p.status==='crowded'?'crowded':'balanced';
  return `<button type="button" class="dg-tp-role dg-tp-${status} ${selectedRole===p.code?'is-selected':''}" data-team-role="${p.code}" data-team-slot="${p.code}-${slot.roleIndex}" aria-pressed="${selectedRole===p.code}" aria-label="${esc(p.name)} ${slot.roleIndex+1}: ${assigned.length}/${analysis.prefs.depthFactor} oyuncu" style="--x:${slot.x}%;--y:${slot.y}%">
    <span class="dg-tp-role-header"><span class="dg-tp-name">${esc(SHORT[p.code])}<small>${slot.roleTotal>1?`${slot.roleIndex+1}. `:''}${esc(p.name)}</small></span><strong>${assigned.length}<i>/${analysis.prefs.depthFactor}</i></strong></span>
    <span class="dg-tp-roster" aria-hidden="true">${assigned.length?assigned.map((pl,i)=>`<span title="${esc(pl.fullName)}">${i===0?'● ':'○ '}${esc(pl.fullName)}</span>`).join(''):'<span class="dg-tp-unfilled">Oyuncu atanmamış</span>'}</span>
    <span class="dg-tp-status">${STATUS[status]}</span>
  </button>`;
 }).join('');
 const slotList=slots.map(slot=>{
  const p=analysis.positions[slot.role];
  const people=[slot.primary?.fullName||'Boş',...(analysis.prefs.depthFactor===2?[slot.backup?.fullName||'Boş']:[])];
  return `<button type="button" class="dg-tp-slot-row" data-team-role="${slot.role}" aria-label="${esc(p.name)} ${slot.roleIndex+1}: ${people.map(esc).join(' ve ')}"><strong>${esc(SHORT[p.code])}${slot.roleTotal>1?` ${slot.roleIndex+1}`:''}</strong><span>${people.map((name,i)=>`<small>${i===0?'İlk:':'Alternatif:'} ${esc(name)}</small>`).join('')}</span></button>`;
 }).join('');
 const summary=`<div class="dg-tp-summary" role="status"><span class="dg-tp-flag"><b>${analysis.assignedPrimary}/${slots.length}</b> ilk kadro görevi</span><span class="dg-tp-flag"><b>${analysis.missingSlots}</b> boş görev</span><span class="dg-tp-flag"><b>${analysis.duplicateRoleNominations}</b> çok mevki adayı</span><span class="dg-tp-flag"><b>${analysis.missingRoles.length}</b> eksik bölge</span><span class="dg-tp-flag"><b>${analysis.crowdedRoles.length}</b> yoğun bölge</span><span class="dg-tp-flag"><b>${analysis.unassigned.length}</b> atanmamış</span><span class="dg-tp-flag"><b>${analysis.assignedUnique}</b> mevki adayı</span></div>`;
 const selected=analysis.positions[selectedRole]||analysis.positions.GK;
 return `<div class="dg-tp-module" role="group" aria-label="Kuşbakışı genel takım saha haritası">
 ${summary}
 <div class="dg-tp-legend" aria-label="Saha durum açıklamaları"><span class="dg-tp-key missing">Eksik</span><span class="dg-tp-key balanced">Dengeli</span><span class="dg-tp-key crowded">Yoğun</span><span class="dg-tp-key optional">Opsiyonel</span></div>
 <div class="dg-tp-current-formation" role="status">${esc(analysis.prefs.formation)} · ${slots.length} saha görevi · ${analysis.prefs.depthFactor}× derinlik</div>
 <div class="dg-tp-ground" data-slot-count="${slots.length}" role="group" aria-label="${esc(analysis.prefs.formation)} dizilişinde ${slots.length} oyuncu görevi"><svg class="dg-tp-lines" viewBox="0 0 620 790" preserveAspectRatio="none" aria-hidden="true">
 <rect x="17" y="15" width="586" height="760" rx="5" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>
 <line x1="17" y1="395" x2="603" y2="395" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>
 <circle cx="310" cy="395" r="84" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/><circle cx="310" cy="395" r="3.5" fill="#d2f6da" opacity=".75"/>
 <rect x="172" y="15" width="276" height="109" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/><rect x="237" y="15" width="146" height="42" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>
 <rect x="172" y="666" width="276" height="109" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/><rect x="237" y="732" width="146" height="43" fill="none" stroke="#d2f6da" stroke-width="2.5" opacity=".58"/>
 </svg><div class="dg-tp-grid dg-tp-grid-dynamic">${cards}</div><span class="dg-tp-attacking">HÜCUM YÖNÜ ↑</span></div>
 <div class="dg-tp-slot-list"><div class="dg-tp-slot-list-head">GÖREVLERE GÖRE OYUNCULAR · ${slots.length} POZİSYON <small>İsimleri okumak ve mevki seçmek için bu listeyi kullanın.</small></div><div class="dg-tp-slot-list-grid">${slotList}</div></div>
 <div class="dg-tp-role-picker" aria-label="Atanabilir bütün mevkiler"><span>MEVKİ SEÇİMİ</span>${TEAM_ROLES.map(r=>`<button type="button" data-team-role="${r.code}" aria-pressed="${selectedRole===r.code}" class="${selectedRole===r.code?'selected':''}">${SHORT[r.code]} <small>${analysis.positions[r.code].count}</small></button>`).join('')}</div>
 <div class="dg-tp-selected"><div><small>SEÇİLİ MEVKİ</small><strong>${esc(selected.name)} <em>${selected.count} / ${selected.target||'opsiyonel'} oyuncu</em></strong></div><span class="dg-tp-selected-${selected.status}">${STATUS[selected.status]}</span></div>
 <p class="dg-tp-info">Sahadaki her kart seçili dizilişin gerçek bir oyuncu görevini temsil eder. ● ilk tercih, ○ alternatif. Renkler seçtiğin diziliş ve mevki derinliği hedefine göredir; oyuncu uygunluğu veya resmî kadro kuralı değildir. Bir oyuncu birden fazla mevkiye aday olabilir ama aynı dizilişte yalnızca bir görevde sayılır. İlk/alternatif sırası antrenörün verdiği öncelik sırasına dayanır; otomatik yetenek puanı değildir.</p>
 </div>`;
}

Object.assign(exports,{renderTeamPitch});
