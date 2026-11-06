'use strict';
/* Team depth: one independent task per row, preference columns and a same-screen editor.
 * The table never repeats the squad in a second list; all data comes from team-depth.js. */
function createTeamAnalysisViews(deps){
 const {TEAM_ROLE_PROFILES,getTeamSlotCandidates,TEAM_PITCH_FORMATIONS,getFormationPitchSlots,getTeamPitchAnalysis,state,activeDepth,esc}=deps;
 function teamRosterPage(){
  const depth=activeDepth();
  const members=state.data.players.filter(p=>(p.groupIds||[]).includes(depth.groupId)&&p.isActive!==false);
  const byId=new Map(members.map(p=>[p.id,p]));
  const analysis=getTeamPitchAnalysis(depth,members,state.teamPitchPrefs);
  const slots=analysis.slots,selected=slots.find(s=>s.key===state.teamSlotSelected)||slots[0]||null;
  const idsFor=slot=>getTeamSlotCandidates(depth,slot.key).filter(id=>byId.has(id));
  const compact=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(max-width:1023px)').matches;
  const columns=compact?2:3;
  const maxRank=Math.max(columns,...slots.map(slot=>idsFor(slot).length));
  const maxStart=Math.max(0,maxRank-columns);
  const start=Math.min(Math.max(0,state.teamDepthPage||0)*columns,maxStart);
  const rangeEnd=Math.min(start+columns,maxRank);
  const rows=slots.map(slot=>{
   const ids=idsFor(slot),active=state.teamEditorOpen&&selected?.key===slot.key;
   const cells=Array.from({length:columns},(_,index)=>{
    const rank=start+index,player=byId.get(ids[rank]);
    return '<button type="button" role="cell" class="depth-choice'+(player?'':' is-empty')+'" data-team-role="'+esc(slot.role)+'" data-team-slot="'+esc(slot.key)+'" aria-label="'+esc(slot.label)+', '+(rank+1)+'. tercih: '+esc(player?.fullName||'Oyuncu ekle')+'" title="'+esc(player?.fullName||'Oyuncu ekle')+'"><span>'+esc(player?.fullName||'+ Oyuncu')+'</span></button>';
   }).join('');
   return '<div class="depth-row'+(active?' is-selected':'')+'" role="row"><button type="button" role="rowheader" class="depth-role" data-team-role="'+esc(slot.role)+'" data-team-slot="'+esc(slot.key)+'" aria-label="'+esc(slot.label)+' görevini düzenle" '+(active?'aria-current="true"':'')+'><span class="depth-role-name">'+esc(slot.label)+'</span><small>'+ids.length+' aday</small></button>'+cells+'</div>';
  }).join('');
  const order=selected?idsFor(selected):[];
  const term=state.teamQuery.toLocaleLowerCase('tr-TR');
  const candidates=members.filter(p=>p.fullName.toLocaleLowerCase('tr-TR').includes(term)).sort((a,b)=>{
   const ai=order.indexOf(a.id),bi=order.indexOf(b.id);
   return (ai<0?100000:ai)-(bi<0?100000:bi)||a.fullName.localeCompare(b.fullName,'tr-TR');
  });
  const pageCount=Math.max(1,Math.ceil(candidates.length/5));
  const candidatePage=Math.min(Math.max(0,state.teamCandidatePage||0),pageCount-1);
  const cards=candidates.slice(candidatePage*5,candidatePage*5+5).map(player=>{
   const index=order.indexOf(player.id),chosen=index>=0;
   return '<div class="depth-candidate'+(chosen?' is-chosen':'')+'"><label><input type="checkbox" data-team-slot-player="'+esc(player.id)+'" data-team-slot-key="'+esc(selected?.key||'')+'" '+(chosen?'checked':'')+'>'+
    '<span><strong title="'+esc(player.fullName)+'">'+esc(player.fullName)+'</strong><small>'+esc(player.position||'Mevki belirtilmedi')+(chosen?' · '+(index+1)+'. tercih':' · aday ekle')+'</small></span></label>'+
    (chosen?'<div class="depth-candidate-actions"><button type="button" data-team-priority="up" data-team-slot-key="'+esc(selected?.key||'')+'" data-player-id="'+esc(player.id)+'" '+(index===0?'disabled':'')+' aria-label="'+esc(player.fullName)+' önceliğini yükselt" title="Önceliği yükselt">↑</button>'+
     '<button type="button" data-team-priority="down" data-team-slot-key="'+esc(selected?.key||'')+'" data-player-id="'+esc(player.id)+'" '+(index===order.length-1?'disabled':'')+' aria-label="'+esc(player.fullName)+' önceliğini düşür" title="Önceliği düşür">↓</button></div>':'')+'</div>';
  }).join('');
  const editor=state.teamEditorOpen&&selected?'<dialog id="team-depth-editor" class="depth-editor" aria-labelledby="depth-editor-title" aria-modal="true">'+
   '<header><div><div class="eyebrow">TERCİH SIRASI</div><h2 id="depth-editor-title">'+esc(selected.label)+'</h2><p>'+order.length+' aday · '+esc(selected.tacticalRoleName||'')+'</p></div><button type="button" class="depth-editor-close" data-team-editor-close aria-label="Düzenleyiciyi kapat">×</button></header>'+
   '<div class="depth-editor-body"><div class="depth-editor-fields"><label for="team-tactical-role">Taktik rol<select id="team-tactical-role" data-team-tactical-slot="'+esc(selected.key)+'">'+(TEAM_ROLE_PROFILES[selected.role]||[]).map(role=>'<option value="'+esc(role.id)+'" '+(role.id===selected.tacticalRole?'selected':'')+'>'+esc(role.name)+'</option>').join('')+'</select></label>'+
    '<label for="team-search">Oyuncu ara<input id="team-search" type="search" value="'+esc(state.teamQuery)+'" placeholder="Ad veya soyad" autofocus autocomplete="off"></label></div>'+
    '<div class="v22-team-members depth-results"><div class="depth-candidate-list">'+(cards||'<p class="depth-no-result">'+(members.length?'Aramanla eşleşen oyuncu yok.':'Bu takımda aktif oyuncu yok. Oyuncular bölümünden sporcu ekleyin.')+'</p>')+'</div>'+
    '<nav class="depth-pager" aria-label="Oyuncu listesi sayfaları"><button type="button" data-team-candidate-page="-1" '+(candidatePage===0?'disabled':'')+'>Önceki</button><span>'+(candidatePage+1)+' / '+pageCount+' · '+candidates.length+' oyuncu</span><button type="button" data-team-candidate-page="1" '+(candidatePage+1>=pageCount?'disabled':'')+'>Sonraki</button></nav></div></div>'+
   '<footer class="depth-editor-footer"><p role="status">Seçimler otomatik kaydedilir. ↑ ↓ ile sırayı değiştir.</p>'+(!members.length?'<button type="button" class="btn btn-ghost btn-small" data-nav="players">Oyunculara git</button>':'')+'</footer></dialog>':'';
  const formationOptions=Array.from({length:9},(_,index)=>index+3).map(size=>{
   const list=TEAM_PITCH_FORMATIONS.filter(formation=>getFormationPitchSlots(formation).length===size);
   return list.length?'<optgroup label="'+size+'v'+size+'">'+list.map(formation=>'<option value="'+esc(formation)+'" '+(state.teamPitchPrefs.formation===formation?'selected':'')+'>'+esc(formation)+'</option>').join('')+'</optgroup>':'';
  }).join('');
  const firstCount=slots.filter(slot=>slot.primary).length,emptyCount=slots.length-firstCount;
  const candidateTotal=slots.reduce((total,slot)=>total+slot.candidateCount,0);
  const table=state.data.groups.length?'<div class="depth-matrix" role="table" aria-label="Antrenör tercih sırası" style="--depth-cols:'+columns+'"><div class="depth-columns" role="row"><span role="columnheader">Görev</span>'+Array.from({length:columns},(_,index)=>'<span role="columnheader">'+(start+index+1)+'. tercih</span>').join('')+'</div>'+rows+'</div>':
   '<div class="depth-empty"><strong>Henüz takım / grup yok</strong><p>Önce arşiv bölümünden bir yaş grubu oluşturun; ardından görevleri burada sıralayın.</p><button type="button" class="btn btn-ghost btn-small" data-nav="archive">Takım oluştur</button></div>';
  return '<section class="depth-workspace"><header class="depth-heading"><div><div class="eyebrow">TAKTİK KADRO DERİNLİĞİ</div><h1>Takım Derinliği</h1></div><div class="depth-summary"><span><strong>'+members.length+'</strong> oyuncu</span><span><strong>'+firstCount+'/'+slots.length+'</strong> ilk tercih</span><span><strong>'+emptyCount+'</strong> boş görev</span><span><strong>'+candidateTotal+'</strong> aday</span></div></header>'+
   '<div class="depth-toolbar"><label>Takım<select id="team-group-select">'+state.data.groups.map(group=>'<option value="'+esc(group.id)+'" '+(group.id===depth.groupId?'selected':'')+'>'+esc(group.name)+'</option>').join('')+'</select></label><label>Diziliş<select id="team-pitch-formation">'+formationOptions+'</select></label><p class="depth-hint">Bir göreve dokun: oyuncu ekle, sırala, taktik rolü seç.</p></div>'+
   table+'<footer class="depth-footer"><button type="button" data-team-depth-page="-1" '+(start===0?'disabled':'')+' aria-label="Önceki tercih sütunları">←</button><span>Tercih sıraları '+((start+1))+'–'+rangeEnd+'<small>Toplam '+maxRank+' sıra · bir göreve dokunarak düzenle</small></span><button type="button" data-team-depth-page="1" '+(start>=maxStart?'disabled':'')+' aria-label="Sonraki tercih sütunları">→</button></footer></section>'+editor;
 }
 return {teamRosterPage};
}
Object.assign(exports,{createTeamAnalysisViews});
