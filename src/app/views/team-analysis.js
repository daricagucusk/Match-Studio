/* Match Studio P1 architecture: isolated view templates; no storage access or side effects on import. */
function createTeamAnalysisViews(deps){
 const {TEAM_ROLES, getTeamDepthStats, TEAM_PITCH_FORMATIONS, getTeamPitchAnalysis, getFormationPitchSlots, renderTeamPitch, state, activeDepth, pageHeader, esc} = deps;
function teamRosterPage(){
 const groups=state.data.groups;const depth=activeDepth();const group=groups.find(g=>g.id===depth.groupId);
 const members=state.data.players.filter(p=>(p.groupIds||[]).includes(depth.groupId)&&p.isActive!==false);
 const stats=getTeamDepthStats(depth,members);
 const analysis=getTeamPitchAnalysis(depth,members,state.teamPitchPrefs);
 const role=TEAM_ROLES.find(r=>r.code===state.teamRoleSelected)||TEAM_ROLES[0];
 const term=state.teamQuery.toLocaleLowerCase('tr-TR');
 const order=depth.roles[role.code]||[];
 const candidates=members.filter(p=>p.fullName.toLocaleLowerCase('tr-TR').includes(term)).sort((a,b)=>{
  const ia=order.indexOf(a.id),ib=order.indexOf(b.id);
  return (ia<0?100000:ia)-(ib<0?100000:ib)||a.fullName.localeCompare(b.fullName,'tr-TR');
 });
 return `${pageHeader('GENEL TAKIM KADROSU','Saha Üzerinde Mevki Analizi','Maçlardan bağımsız takım derinliği. Boş ve kalabalık mevkileri bir bakışta gör.')}
 <div class="v22-team-toolbar"><div class="field"><label for="team-group-select">Takımı seç</label><select id="team-group-select">${groups.map(g=>`<option value="${esc(g.id)}" ${depth.groupId===g.id?'selected':''}>${esc(g.name)}</option>`).join('')}</select></div><div class="v22-team-stats"><span><strong>${stats.total}</strong> oyuncu</span><span><strong>${stats.coveredPlayerIds.length}</strong> mevkisi atanan</span><span><strong>${analysis.assignedPrimary}</strong> dolu ilk kadro</span><span><strong>${analysis.missingSlots}</strong> boş görev</span></div></div>
 <div class="dg-tp-controls"><div class="field"><label for="team-pitch-formation">Referans diziliş</label><select id="team-pitch-formation">${Array.from({length:9},(_,i)=>i+3).map(n=>`<optgroup label="${n}v${n} · ${TEAM_PITCH_FORMATIONS.filter(f=>getFormationPitchSlots(f).length===n).length} diziliş">${TEAM_PITCH_FORMATIONS.filter(f=>getFormationPitchSlots(f).length===n).map(x=>`<option value="${esc(x)}" ${state.teamPitchPrefs.formation===x?'selected':''}>${esc(x)}</option>`).join('')}</optgroup>`).join('')}</select></div><div class="field"><label for="team-pitch-depth">Mevki derinlik hedefi</label><select id="team-pitch-depth"><option value="1" ${state.teamPitchPrefs.depthFactor===1?'selected':''}>1× · Her saha görevi için 1 oyuncu</option><option value="2" ${state.teamPitchPrefs.depthFactor===2?'selected':''}>2× · Her saha görevi için 2 oyuncu</option></select></div><p>Takım/grup bazında otomatik kaydedilir. Mevki adayları sıraya göre değerlendirilir; aynı oyuncu aynı anda iki görevi dolduramaz.</p></div>
 <div class="v22-team-grid dg-tp-layout"><section class="workspace-surface v22-team-pitch" aria-label="${esc(group?.name||'Takım')} genel mevki haritası"><div class="eyebrow">GENEL TAKIM / SAHA ÜZERİNDE DERİNLİK</div><h2>${esc(group?.name||'Takım seç')} · Kuşbakışı saha</h2>${renderTeamPitch({depth,players:members,selectedRole:role.code,prefs:state.teamPitchPrefs})}</section>
 <aside class="workspace-surface v22-team-assign"><div class="eyebrow">MEVKİ ATAMA</div><h2>${esc(role.name)}</h2><p>Sol taraftaki saha kartına dokunarak mevki seç. Aynı mevkiye birden fazla oyuncu atanabilir.</p><div class="dg-tp-role-overview"><span>${analysis.positions[role.code].candidateCount} mevki adayı</span><span>${analysis.positions[role.code].count} kullanılabilir görev / hedef ${analysis.positions[role.code].target||'opsiyonel'}</span></div><div class="field"><label for="team-search">Oyuncu ara</label><input id="team-search" type="search" placeholder="Takımdaki oyuncuyu bul" value="${esc(state.teamQuery)}"></div><div class="v22-team-members redesigned-scroll">${candidates.map(p=>{
  const index=order.indexOf(p.id),selected=index>=0;
  return `<div class="dg-tp-priority-row"><label class="v22-team-member"><input type="checkbox" data-team-role-player="${esc(p.id)}" ${selected?'checked':''}><span>${esc(p.fullName)}<small>${esc(p.position||'OTHER')}${selected?' · Öncelik '+(index+1):''}</small></span></label>${selected?`<div class="dg-tp-priority-actions"><button type="button" data-team-priority="up" data-player-id="${esc(p.id)}" ${index===0?'disabled':''} aria-label="${esc(p.fullName)} önceliğini yükselt" title="Önceliği yükselt">↑</button><button type="button" data-team-priority="down" data-player-id="${esc(p.id)}" ${index===order.length-1?'disabled':''} aria-label="${esc(p.fullName)} önceliğini düşür" title="Önceliği düşür">↓</button></div>`:''}</div>`;
 }).join('')||'<p>Bu takımda aktif oyuncu yok. Oyuncular bölümünden takıma oyuncu ekle.</p>'}</div><div class="v22-team-note">${stats.unassigned.length} oyuncu hiçbir mevkiye atanmadı. Öncelik ↑↓ düğmeleriyle elle belirlenir. ${analysis.duplicateRoleNominations} oyuncu farklı mevkilerin aday listesinde de bulunuyor; saha analizi onları yalnızca bir defa sayar. Bu çalışma maç kadrolarını veya oyuncunun ana mevkisini değiştirmez.</div></aside></div>`;
}

 return {teamRosterPage};
}
Object.assign(exports,{createTeamAnalysisViews});
