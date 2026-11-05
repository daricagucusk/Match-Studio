'use strict';
/* Team depth editor: explicit tactical slots and a safe fallback to legacy role candidates. */
function createTeamAnalysisViews(deps){
 const {TEAM_ROLES,TEAM_ROLE_PROFILES,getTeamDepthStats,getTeamSlotCandidates,TEAM_PITCH_FORMATIONS,getTeamPitchAnalysis,getFormationPitchSlots,renderTeamPitch,state,activeDepth,pageHeader,esc}=deps;
 function teamRosterPage(){
  const depth=activeDepth(),group=state.data.groups.find(g=>g.id===depth.groupId);
  const members=state.data.players.filter(p=>(p.groupIds||[]).includes(depth.groupId)&&p.isActive!==false);
  const stats=getTeamDepthStats(depth,members);
  const analysis=getTeamPitchAnalysis(depth,members,state.teamPitchPrefs);
  const requestedRole=TEAM_ROLES.find(r=>r.code===state.teamRoleSelected)||TEAM_ROLES[0];
  const selected=analysis.slots.find(s=>s.key===state.teamSlotSelected)||
   (!state.teamSlotSelected?analysis.slots.find(s=>s.role===requestedRole.code):null);
  const role=selected?TEAM_ROLES.find(r=>r.code===selected.role):requestedRole;
  const slotKey=selected?.key||null;
  const order=slotKey?getTeamSlotCandidates(depth,slotKey):depth.roles[role.code]||[];
  const term=state.teamQuery.toLocaleLowerCase('tr-TR');
  const candidates=members.filter(p=>p.fullName.toLocaleLowerCase('tr-TR').includes(term)).sort((a,b)=>{
    const ia=order.indexOf(a.id),ib=order.indexOf(b.id);
    return (ia<0?100000:ia)-(ib<0?100000:ib)||a.fullName.localeCompare(b.fullName,'tr-TR');
  });
  const preferenceLabel=index=>index===0?'1. tercih':index===1?'2. tercih':(index+1)+'. alternatif';
  const candidateCards=candidates.map(p=>{
   const index=order.indexOf(p.id),chosen=index>=0;
   const isBusy=analysis.slots.some(s=>(s.primary?.id===p.id||s.backup?.id===p.id)&&s.key!==slotKey);
   const checkbox=slotKey?'data-team-slot-player="'+esc(p.id)+'" data-team-slot-key="'+esc(slotKey)+'"':'data-team-role-player="'+esc(p.id)+'"';
   return '<div class="dg-tp-priority-row'+(chosen?' is-chosen':'')+'">'+
    '<label class="v22-team-member"><input type="checkbox" '+checkbox+' '+(chosen?'checked':'')+'>'+
    '<span>'+esc(p.fullName)+'<small>'+esc(p.position||'OTHER')+
    (chosen?' · '+preferenceLabel(index):' · uygun oyuncu')+(isBusy?' · diğer görevde de kullanılıyor':'')+
    '</small></span></label>'+
    (chosen?'<div class="dg-tp-priority-actions">'+
       '<button type="button" data-team-priority="up" data-team-slot-key="'+esc(slotKey||'')+'" data-player-id="'+esc(p.id)+'"'+(index===0?' disabled':'')+' aria-label="'+esc(p.fullName)+' önceliğini yükselt" title="Önceliği yükselt">↑</button>'+
       '<button type="button" data-team-priority="down" data-team-slot-key="'+esc(slotKey||'')+'" data-player-id="'+esc(p.id)+'"'+(index===order.length-1?' disabled':'')+' aria-label="'+esc(p.fullName)+' önceliğini düşür" title="Önceliği düşür">↓</button>'+
     '</div>':'')+'</div>';
  }).join('');
  const roleOptions=slotKey?(TEAM_ROLE_PROFILES[role.code]||[]).map(x=>
   '<option value="'+esc(x.id)+'" '+(x.id===selected.tacticalRole?'selected':'')+'>'+esc(x.name)+' · '+esc(x.description)+'</option>').join(''):'';
  const formationOptions=Array.from({length:9},(_,i)=>i+3).map(n=>
   '<optgroup label="'+n+'v'+n+' · '+TEAM_PITCH_FORMATIONS.filter(f=>getFormationPitchSlots(f).length===n).length+' diziliş">'+
    TEAM_PITCH_FORMATIONS.filter(f=>getFormationPitchSlots(f).length===n).map(x=>
    '<option value="'+esc(x)+'" '+(state.teamPitchPrefs.formation===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</optgroup>').join('');
  const fullChoices=order.map((id,index)=>{
   const p=members.find(x=>x.id===id);
   if(!p)return '';
   return '<li><span class="dg-tp-choice-rank">'+preferenceLabel(index)+'</span> <strong>'+esc(p.fullName)+'</strong></li>';
  }).join('');
  const activeCandidates=selected?.candidateCount??order.length;
  return pageHeader('GENEL TAKIM KADROSU','Mevki ve Taktik Rol Kartları','Her saha görevini tek tek yönet. İlk iki tercih önde, kalan tüm alternatifler erişilebilir.')+
   '<div class="v22-team-toolbar"><div class="field"><label for="team-group-select">Takımı seç</label>'+
    '<select id="team-group-select">'+state.data.groups.map(g=>'<option value="'+esc(g.id)+'" '+(depth.groupId===g.id?'selected':'')+'>'+esc(g.name)+'</option>').join('')+'</select></div>'+
    '<div class="v22-team-stats"><span><strong>'+stats.total+'</strong> oyuncu</span><span><strong>'+stats.coveredPlayerIds.length+'</strong> mevki adayı</span><span><strong>'+analysis.assignedPrimary+'</strong> ilk kadro</span><span><strong>'+analysis.missingSlots+'</strong> boş görev</span></div></div>'+
   '<div class="dg-tp-controls"><div class="field"><label for="team-pitch-formation">Referans diziliş</label>'+
    '<select id="team-pitch-formation">'+formationOptions+'</select></div>'+
    '<div class="field"><label for="team-pitch-depth">Öncelik görünümü</label><select id="team-pitch-depth">'+
    '<option value="1" '+(state.teamPitchPrefs.depthFactor===1?'selected':'')+'>İlk tercih (diğerleri alternatif)</option>'+
    '<option value="2" '+(state.teamPitchPrefs.depthFactor===2?'selected':'')+'>1. ve 2. tercih + tüm alternatifler</option></select></div>'+
    '<p>Her pozisyon ayrı kaydedilir. Bir oyuncu birden çok göreve aday olabilir, fakat aynı anda iki pozisyona sayılmaz.</p></div>'+
   '<div class="v22-team-grid dg-tp-layout"><section class="workspace-surface v22-team-pitch" aria-label="'+esc(group?.name||'Takım')+' bağımsız mevki haritası">'+
    '<div class="eyebrow">GENEL TAKIM / BAĞIMSIZ GÖREVLER</div><h2>'+esc(group?.name||'Takım seç')+' · Kuşbakışı saha</h2>'+
    renderTeamPitch({depth,players:members,selectedRole:role.code,selectedSlot:slotKey,prefs:state.teamPitchPrefs})+'</section>'+
    '<aside class="workspace-surface v22-team-assign"><div class="eyebrow">MEVKİ VE ROL ATAMASI</div>'+
    '<h2>'+esc(selected?.label||role.name)+'</h2>'+
    '<p>'+ (slotKey?'Bu pozisyonun adaylarını ve oyun içi rolünü ayrı sırala.':'Bu mevki kategorisinin ortak aday listesini düzenle.')+'</p>'+
    '<div class="dg-tp-role-overview"><span>'+activeCandidates+' aday</span><span>İlk iki oyuncu ve diğer tüm alternatifler</span></div>'+
    (slotKey?'<div class="field dg-tp-tactical-field"><label for="team-tactical-role">Bu mevkinin taktik görevi</label>'+
    '<select id="team-tactical-role" data-team-tactical-slot="'+esc(slotKey)+'">'+roleOptions+'</select>'+
    '<small>Rol yalnızca bu göreve aittir; oyuncu puanı veya lisans mevkii değildir.</small></div>':'')+
    '<div class="field"><label for="team-search">Oyuncu ara</label><input id="team-search" type="search" placeholder="Takımdaki oyuncuyu bul" value="'+esc(state.teamQuery)+'"></div>'+
    '<div class="v22-team-members redesigned-scroll" aria-label="Göreve atanabilecek oyuncular">'+(candidateCards||'<p>Takımda uygun oyuncu bulunmuyor.</p>')+'</div>'+
    '<div class="dg-tp-full-depth"><strong>Mevkinin tam tercih sırası ('+order.length+')</strong>'+
    '<ol>'+ (fullChoices||'<li>Bu göreve henüz aday atanmadı.</li>')+'</ol></div>'+
    '<div class="v22-team-note">↑ ↓ düğmeleriyle sırayı değiştir. Ortak mevki listesi ve her saha görevi ayrı saklanır. Bu işlem resmî maç kadrosunu veya oyuncunun ana mevkisini değiştirmez.</div>'+
    '</aside></div>';
 }
 return {teamRosterPage};
}
Object.assign(exports,{createTeamAnalysisViews});
