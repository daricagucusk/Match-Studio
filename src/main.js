const {createModalFocusController}=require('src/app/modal-focus.js');
const {createMatchDraftStore}=require('src/app/match-form-drafts.js');
const {createFixtureImportSession}=require('src/app/fixture-import-session.js');
const {setupPwaUpdates,getOfflineReadiness}=require('src/app/pwa-updates.js');

const {uid,now,validatePlayer,validateMatch,formatTurkishDate,validateOverrides}=require("src/domain/validation.js");
const {buildRoster,addPlayer,removePlayer,movePlayer,copyRosterForMatch,syncRosterPlayerDetails,addPlayersToRoster}=require("src/domain/roster.js");
const {buildPosterDocument:basePosterDocument}=require("src/domain/poster-document.js");
const buildPosterDocument=(...args)=>basePosterDocument(...args,state.club?.name||"SPOR KULÜBÜ",state.club?.accent||"#176B46");
const {getRosterInsights,getPosterReleaseIssues}=require("src/domain/workspace-quality.js");
const {templates}=require("src/posters/registry.js");
const {renderPoster,exportPng,downloadPng,sharePng}=require("src/posters/renderer.js");
const {setClubDatabase,openDatabase,putRecord,getRecord,listRecords,deleteRecord,deleteMatchAtomic,safeDeleteGroup,erasePlayerAtomic,copyLegacyToActive,transact,saveMatchAndRoster,findLastRosterForGroup,clubContext,assertContext}=require("src/storage/db.js");

const {filterRosterPool}=require("src/domain/official-roster-import.js");
const {preparePhoto,prepareLogo,saveAsset,loadAsset}=require("src/storage/images.js");
const {parsePlayersCsv,mergeCsvPlayers}=require("src/storage/csv-import.js");
const {setBackupClub,exportBackup,exportEncryptedBackup,inspectBackup,restoreBackup}=require("src/storage/backup.js");
const {listClubs,saveClub,getActiveId,setActiveId,clearActiveId,validClubName,safeColor,inspectLegacy}=require("src/storage/club-registry.js");
const {deleteClubSafely,retryPendingDeletions}=require('src/storage/club-deletion.js');
const {readRestorePoint,rollbackToRestorePoint,discardRestorePoint}=require('src/storage/recovery.js');
const {resumePlayerErasures}=require('src/storage/privacy-erasure.js');
const {auditActiveClub}=require('src/storage/audit.js');
const {makeLineup,normalizeLineup,placePlayer,removeFromPitch,changePitchPreset,setPlayerPitchRole,getPitchPresets,getPitchShirtNumber,setPitchShirtNumber}=require("src/domain/lineup.js");
const {pitchScreen}=require("src/pitch/pitch-screen.js");
const {pitchPng}=require("src/pitch/pitch-export.js");
const {getRosterPolicy,filterMultiGroupPool,availableRosterSpots,proposeRosterAddition,proposeBulkRosterAddition,getMatchRosterSections,autofillStartingLineup,capacityWarning}=require("src/domain/roster-policy.js");
const {TEAM_ROLES,createTeamDepth,sanitizeTeamDepth,setTeamPlayerRole,moveTeamRoleCandidate,getTeamDepthStats}=require("src/domain/team-depth.js");
const {TEAM_PITCH_FORMATIONS,normalizeTeamPitchPrefs,getTeamPitchAnalysis,getFormationPitchSlots}=require("src/domain/team-pitch-analysis.js");
const {renderTeamPitch}=require("src/team/team-pitch.js");
const {mondayOf,pickBoardMatches,prepareBoard,renderWeeklyBoard,exportWeeklyBoard}=require("src/posters/weekly-board.js");
const {safeFilenamePart}=require("src/domain/file-names.js");
const {FORMATS,LAYOUTS,normalizeGameFormat,normalizePitchLayout,recommendedFormatForAge,getFormatDisplay}=require("src/domain/match-format.js");
const {createMatchSession,getMatchSession,listMatchEvents}=require("src/storage/live-match.js");
const {commitClockAction}=require("src/storage/match-clock.js");
const {commitSubstitution}=require("src/storage/match-substitutions.js");
const {commitSportingEvent}=require("src/storage/match-sporting-events.js");
const {effectiveSportingEvents,projectMatchReport}=require("src/domain/match-events-report.js");
const {projectClock,formatClock}=require("src/domain/match-clock.js");
const {createLiveMatchViews}=require("src/app/views/live-match-clock.js");
const {projectLivePitch}=require('src/domain/live-pitch.js');









const {createMatchOperationViews}=require("src/app/views/match-operations.js");
const {createTeamAnalysisViews}=require("src/app/views/team-analysis.js");
const {createMediaStudioViews}=require("src/app/views/media-studio.js");
const {createClubRecordViews}=require("src/app/views/club-records.js");












const {createRenderCoordinator,patchSearchRegion}=require("src/app/render-coordinator.js");
const {buildSeasonAnalytics,seasonPlayersCsv,SORT_KEYS,RESULT_LABEL,RESULT_NAME}=require("src/domain/season-analytics.js");
const {createSeasonAnalyticsViews}=require("src/app/views/season-analytics.js");
const {createWorkspaceSnapshot}=require("src/app/workspace-snapshot.js");
const root=document.getElementById('app');
const modalFocus=createModalFocusController(root,()=>{state.modal=null;render();});
let uiBusy=false;
// Hold one UI operation per tab. This keeps its club, match and form stable
// throughout image decoding, password derivation and database writes.
for(const type of ['click','change','submit','input','drop','keydown','contextmenu'])root.addEventListener(type,event=>{
 if(uiBusy){event.preventDefault();event.stopImmediatePropagation();}
},true);
function listenRoot(type,handler){
 if(handler.constructor.name!=='AsyncFunction'){root.addEventListener(type,handler);return;}
 root.addEventListener(type,event=>{
  if(uiBusy){event.preventDefault();return;}
  // Fixture parsing is read-only and carries its own club/generation token,
  // so a slow file need not block switching clubs or restoring a backup.
  if(type==='change'&&!event.target.matches('#club-switch,#club-switch-mobile,#pitch-role,#pitch-formation,#team-group,#team-pitch-formation,#team-formation-select,#team-pitch-depth,#team-depth-factor,#team-depth-select,[data-team-role-player],[data-player-id],[data-override],#club-logo,#poster-bg-file,#csv-file,#backup-file')){Promise.resolve(handler(event)).catch(error=>toast(error.message,true));return;}
  if(type==='click'&&event.target.closest('[data-action=backup-import],[data-action=live-quick-event]')){Promise.resolve(handler(event)).catch(error=>toast(error.message,true));return;}
  if(type==='click'&&!event.target.closest('[data-action],[data-team-priority],[data-pitch-remove],[data-pitch-slot],[data-template],[data-size]')){Promise.resolve(handler(event)).catch(error=>toast(error.message,true));return;}
  // Cancel native form submission before waiting for a cross-tab lock.
  if(type==='submit'||type==='drop')event.preventDefault();
  if(type==='drop'){event.matchStudioDragValue=event.dataTransfer.getData('text/plain');event.matchStudioDraggedRosterId=draggedRosterId;}
  uiBusy=true;root.inert=true;root.setAttribute('aria-busy','true');
  const run=()=>handler(event);
  const task=globalThis.navigator?.locks?navigator.locks.request('matchstudio-ui-update',{mode:'shared'},run):run();
  Promise.resolve(task).catch(error=>{console.error(error);toast(error.message||'İşlem tamamlanamadı.',true);}).finally(()=>{uiBusy=false;root.inert=false;root.removeAttribute('aria-busy');modalFocus.sync();});
 });
}
const viewCoordinator=createRenderCoordinator(root);
const {createWakeLock,haptic,createInstallPrompt}=require("src/app/premium-ux.js");
const wakeLock=createWakeLock();
const icons={chart:'<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 6-7"/>',home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 6a3 3 0 0 1 0 6m2 3a5 5 0 0 1 2 4v2"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',roster:'<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',pitch:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 4v16M2 12h20"/><circle cx="12" cy="12" r="3"/>',studio:'<rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m2 18 6-6 4 4 4-5 6 6"/>',archive:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v12h14V9m-10 4h6"/>',plus:'<path d="M12 5v14M5 12h14"/>',chevron:'<path d="m9 18 6-6-6-6"/>',shield:'<path d="m12 2 9 4v6c0 5-3 8-9 10C6 20 3 17 3 12V6Z"/><path d="M8.5 12 11 14.5 16 9"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 18v3h16v-3"/>',share:'<path d="M18 8a3 3 0 1 0-2.7-4.3L8.7 7.4a3 3 0 1 0 0 5.2l6.6 3.7A3 3 0 1 0 17 14"/>',edit:'<path d="M4 20h4l11-11-4-4L4 16zM13 7l4 4"/>',trash:'<path d="M4 7h16M10 4h4m-8 3 1 14h10l1-14M10 11v6m4-6v6"/>',check:'<path d="m5 12 5 5L20 7"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/>',up:'<path d="m6 15 6-6 6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',upload:'<path d="M12 16V4m-4 4 4-4 4 4M3 17v4h18v-4"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="m5 5 2-2 2 2m6 0 2-2 2 2M5 19l2 2 2-2m6 0 2 2 2-2M2 10v4m20-4v4"/>',bolt:'<path d="m13 2-9 11h7l-1 9 10-13h-7z"/>',back:'<path d="M19 12H5m6-6-6 6 6 6"/>'};
function I(k){return `<span class="inline-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[k]||icons.shield}</svg></span>`}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groupNames=[]; // New clubs start without seeded roster data.
const nav=[['dashboard','home','Genel Bakış'],['players','users','Oyuncular'],['matches','calendar','Yeni Maç'],['roster','roster','Kadro Seçimi'],['team','users','Genel Takım Kadrosu'],['pitch','pitch','Saha / Diziliş'],['studio','studio','Afiş Stüdyosu'],['weekly','calendar','Haftalık Maç Panosu'],['archive','archive','Arşiv / Ayarlar']];
const state={season:{groupId:'',from:'',to:'',sort:'goals',clubId:null,bundle:null,data:null,loading:false,error:null},club:null,clubs:[],legacy:null,integrityAudit:null,route:'dashboard',data:{players:[],groups:[],matches:[],rosters:[],posterDrafts:[],settings:[],assets:[]},currentId:null,filterGroup:'all',query:'',modal:null,tab:'design',previewResult:null,csvPending:null,sessionMatch:null,liveSession:null,liveEvents:[],liveLoading:false,notice:null,rosterPoolScope:'all',rosterQuery:'',pitchMode:'match',pitchSelectedId:null,pitchContext:null,rosterPoolGroups:[],rosterFilterMatchId:null,teamGroupId:null,teamRoleSelected:'GK',teamQuery:'',teamPitchPrefs:{formation:'4-3-3',depthFactor:2},board:{week:mondayOf(new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Istanbul'}))||new Date().toISOString().slice(0,10),mode:'week',size:'portrait-post',selected:null},fixtureImport:null};
const fixtureImports=createFixtureImportSession();
function invalidateFixtureImport(){fixtureImports.invalidate();state.fixtureImport=null;}
let draftStorage=null;try{draftStorage=sessionStorage;}catch(error){}
const matchDrafts=createMatchDraftStore(draftStorage);
const matchDraftScope=()=>({clubId:state.club?.id,matchId:state.currentId||null});
function rememberMatchDraft(form=root.querySelector('#match-form')){
 if(!form||!state.club||form.dataset.draftDirty!=='true')return;
 const scope=matchDraftScope();
 if(form.dataset.draftClub!==scope.clubId||form.dataset.draftMatch!==(scope.matchId||'new'))return;
 matchDrafts.write(scope,{fields:formObj(form),seed:scope.matchId?null:state.sessionMatch});
 updateMatchDraftNotice(form);
}
function updateMatchDraftNotice(form){
 let notice=form.querySelector('#match-draft-notice');
 if(!notice){notice=document.createElement('div');notice.id='match-draft-notice';notice.className='form-footer';notice.innerHTML='<span id="match-draft-status" class="muted small" role="status"></span><button type="button" class="btn btn-subtle btn-small" data-action="discard-match-draft">Taslağı sil</button>';form.append(notice);}
 const dirty=form.dataset.draftDirty==='true';notice.hidden=!dirty;notice.style.display=dirty?'':'none';
 notice.querySelector('#match-draft-status').textContent=matchDrafts.isPersistent()?'Kaydedilmemiş değişiklikler bu sekmede taslak olarak korunuyor.':'Taslak bellekte korunuyor. Sayfayı yenilemeden maçı kaydedin.';
 notice.querySelector('button').textContent=state.currentId?'Kaydedilmemiş değişiklikleri bırak':'Taslağı sil';
}
function restoreMatchDraft(){
 const form=root.querySelector('#match-form');if(!form||!state.club)return;
 const scope=matchDraftScope(),draft=matchDrafts.read(scope);
 form.dataset.draftClub=scope.clubId;form.dataset.draftMatch=scope.matchId||'new';
 if(draft){for(const [name,value] of Object.entries(draft.fields)){const input=form.elements.namedItem(name);if(input&&'value' in input)input.value=value;}form.dataset.draftDirty='true';}
 updateMatchDraftNotice(form);
}
// Capture before navigation and before any DOM replacement, including programmatic presets.
for(const type of ['input','change'])root.addEventListener(type,event=>{
 const form=event.target.closest('#match-form');if(!form)return;
 form.dataset.draftDirty='true';rememberMatchDraft(form);
 // Game size changes can also update goalkeeper and pitch defaults in the same event.
 queueMicrotask(()=>{if(form.isConnected)rememberMatchDraft(form);});
});
window.addEventListener('pagehide',()=>rememberMatchDraft());
window.addEventListener('beforeunload',event=>{
 rememberMatchDraft();
 if(!matchDrafts.isPersistent()&&matchDrafts.hasDrafts()){event.preventDefault();event.returnValue='';}
});
const getGroup=id=>state.data.groups.find(g=>g.id===id);
const activeMatch=()=>state.sessionMatch||state.data.matches.find(m=>m.id===state.currentId)||null;
const activeRoster=()=>state.data.rosters.find(r=>r.matchId===state.currentId)||buildRoster(state.currentId||'new',[]);
const activeLineup=()=>{const policy=getRosterPolicy(activeMatch(),state.data.groups);const raw=state.data.settings.find(s=>s.id===`lineup:${state.currentId}`)?.value;const starter=policy?.defaultPreset||'4-3-3';let plan=normalizeLineup(raw||makeLineup(state.currentId,starter),activeRoster());if(policy&&getPitchPresets()[plan.preset]?.length!==policy.starterLimit)plan=changePitchPreset(plan,starter);return plan;};
const activePolicy=()=>getRosterPolicy(activeMatch(),state.data.groups);
const activeDepth=()=>{const groupId=state.teamGroupId||state.data.groups.find(g=>/^U14\s*A$/i.test(g.name))?.id||state.data.groups.find(g=>state.data.players.some(p=>(p.groupIds||[]).includes(g.id)))?.id||state.data.groups[0]?.id;return sanitizeTeamDepth(state.data.settings.find(s=>s.id===`teamDepth:${groupId}`)?.value||createTeamDepth(groupId),state.data.players);};
function storedTeamPitchPrefs(groupId=activeDepth().groupId){
 return normalizeTeamPitchPrefs(state.data.settings.find(s=>s.id===`teamPitchPrefs:${groupId}`)?.value);
}
async function persistTeamPitchPrefs(prefs){
 const groupId=activeDepth().groupId;
 if(!groupId)throw Error('Önce bir takım/grup oluşturun.');
 const value=normalizeTeamPitchPrefs(prefs);
 await putRecord('settings',{id:`teamPitchPrefs:${groupId}`,value});
 await refresh();render();
}
async function persistTeamDepth(depth){await putRecord('settings',{id:`teamDepth:${depth.groupId}`,value:depth});await refresh();render();}
function openPitchContext(slot,x,y){
 const plan=activeLineup(),playerId=plan.assignments[String(slot)];
 if(!playerId||!activeRoster().entries.some(e=>e.playerId===playerId))return;
 // Desktop popup uses the viewport; mobile uses a bottom sheet and safe-area padding.
 const width=Math.min(292,Math.max(240,window.innerWidth-16)),height=374;
 const left=Math.max(8,Math.min(Number(x)||8,window.innerWidth-width-8));
 const top=Math.max(8,Math.min(Number(y)||8,window.innerHeight-height-8));
 state.pitchContext={playerId,slot:Number(slot),x:left,y:top};
 render();root.querySelector('.pitch-context-menu [role="menuitem"]:not(:disabled)')?.focus({preventScroll:true});
}
function rememberPitchModalTrigger(){
 const slot=state.pitchContext?.slot;
 if(slot!==undefined&&slot!==null)modalFocus.rememberTrigger(root.querySelector('[data-pitch-menu-trigger="'+Number(slot)+'"]'),true);
}
function closePitchContext(restoreFocus=true){
 const slot=state.pitchContext?.slot;
 if(slot===undefined||slot===null)return;
 state.pitchContext=null;
 root.querySelector('.pitch-context-menu')?.remove();
 root.querySelector('.pitch-context-scrim')?.remove();
 const trigger=[...root.querySelectorAll('[data-pitch-menu-trigger]')].find(el=>Number(el.dataset.pitchMenuTrigger)===slot);
 trigger?.setAttribute('aria-expanded','false');
 if(restoreFocus)(trigger||root.querySelector('[data-pitch-slot="'+slot+'"]'))?.focus({preventScroll:true});
}
async function savePitchPlan(plan){if(activeMatch()?.state==='archived')throw Error('Arşivlenmiş maçın saha yerleşimi değiştirilemez.');await putRecord('settings',{id:`lineup:${state.currentId}`,value:plan});await refresh();render();}
function pitchView(){const match=activeMatch();if(!match)return '<div class="empty">Önce bir maç seçmelisin.</div>';return workspaceHead(match,'pitch')+pitchScreen({roster:activeRoster(),plan:activeLineup(),players:state.data.players,mode:state.pitchMode,selectedId:state.pitchSelectedId,archived:match.state==='archived',policy:activePolicy(),match,menu:state.pitchContext});}
const allMatches=()=>[...state.data.matches].sort((a,b)=>(b.matchDate||'').localeCompare(a.matchDate||'')||(b.updatedAt||'').localeCompare(a.updatedAt||''));
function toast(s,isError=false){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast'+(isError?' error':'');el.setAttribute('role',isError?'alert':'status');const icon=document.createElement('span');icon.className='toast-icon';icon.setAttribute('aria-hidden','true');icon.textContent=isError?'!':'✓';const text=document.createElement('span');text.className='toast-text';text.textContent=s;const close=document.createElement('button');close.type='button';close.className='toast-close';close.setAttribute('aria-label','Bildirimi kapat');close.textContent='×';close.addEventListener('click',()=>el.remove());el.append(icon,text,close);document.body.append(el);haptic(isError?'error':'success');setTimeout(()=>el.remove(),isError?7000:5200)}
const workspaceSnapshot=createWorkspaceSnapshot({getClubId:()=>state.club?.id,readStore:listRecords,applySnapshot:snapshot=>{Object.assign(state.data,snapshot);state.teamPitchPrefs=storedTeamPitchPrefs();}});
async function refresh(){const loaded=await workspaceSnapshot.reload();if(loaded){invalidateSeasonAnalytics();if(state.route==='analytics')await loadSeasonAnalytics();}return loaded;}
let liveLoadSequence=0;
const liveSyncChannel=typeof BroadcastChannel==='function'?new BroadcastChannel('matchstudio-v268d-live-refresh'):null;
function notifyLiveUpdate(){try{liveSyncChannel?.postMessage({clubId:state.club?.id,matchId:state.currentId});}catch{}}
if(liveSyncChannel)liveSyncChannel.addEventListener('message',event=>{
 const d=event.data;
 if(d?.clubId===state.club?.id&&d?.matchId===state.currentId&&state.route==='live')loadLiveClock();
});
async function loadLiveClock(){
 const sequence=++liveLoadSequence;
 const clubId=state.club?.id,matchId=state.currentId;state.liveLoading=Boolean(matchId);state.liveSession=null;state.liveEvents=[];if(state.route==='live')render();
 if(!matchId){state.liveLoading=false;return;}
 try{const [session,events]=await Promise.all([getMatchSession(matchId),listMatchEvents(matchId)]);
  if(sequence===liveLoadSequence&&state.club?.id===clubId&&state.currentId===matchId){state.liveSession=session;state.liveEvents=events;state.liveLoading=false;if(state.route==='live')render();}
 }catch(error){if(sequence===liveLoadSequence&&state.club?.id===clubId&&state.currentId===matchId){state.liveLoading=false;toast('Maç saati yüklenemedi: '+error.message,true);if(state.route==='live')render();}}
}
function tickLiveClock(){
 if(state.route!=='live'||!state.liveSession||state.liveLoading){wakeLock.set(false);return;}
 const timer=root.querySelector('#live-clock-time');if(!timer){wakeLock.set(false);return;}
 try{
  const nowMs=Date.now(),v=projectClock(state.liveSession,nowMs);
  const roster=state.data.rosters.find(r=>r.matchId===state.currentId);
  const report=projectMatchReport(state.liveSession,state.liveEvents||[],state.data.players,roster,nowMs);
  const players=new Map(report.players.map(p=>[p.id,p]));
  wakeLock.set(state.liveSession.status==='running');
  timer.textContent=formatClock(v.elapsedPeriodMs);
  for(const id of ['live-clock-total','live-report-total']){const el=root.querySelector('#'+id);if(el)el.textContent=formatClock(report.elapsedMatchMs);}
  root.querySelectorAll('[data-live-minutes]').forEach(el=>{el.textContent=formatClock(players.get(el.dataset.liveMinutes)?.playedMs||0);});
  root.querySelectorAll('[data-live-whole-minutes]').forEach(el=>{el.textContent=Math.floor((players.get(el.dataset.liveWholeMinutes)?.playedMs||0)/60000)+' dk';});
  root.querySelectorAll('[data-live-participated]').forEach(el=>{el.textContent=players.get(el.dataset.liveParticipated)?.participated?'Evet':'Hayır';});
  const count=root.querySelector('#live-report-participants');if(count)count.textContent=report.players.filter(p=>p.participated).length;
  for(const [kind,needed] of [['minutes',report.minutesReviewRequired],['clock',report.clockReviewRequired]]){const el=root.querySelector('[data-live-report-warning="'+kind+'"]');if(el)el.hidden=!needed;}
  const warn=root.querySelector('#live-clock-health');if(warn)warn.textContent=v.warning||'';
 }catch(error){const warn=root.querySelector('#live-clock-health');if(warn)warn.textContent=error.message;}
}
setInterval(tickLiveClock,1000);
window.addEventListener('beforeprint',tickLiveClock);
window.addEventListener('pagehide',()=>wakeLock.set(false));
let seasonSequence=0;
function invalidateSeasonAnalytics(resetFilters=false){
 seasonSequence++;
 Object.assign(state.season,{clubId:state.club?.id||null,bundle:null,data:null,loading:false,error:null});
 if(resetFilters)Object.assign(state.season,{groupId:'',from:'',to:'',sort:'goals'});
}
function downloadFile(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
// Reads each saved match once per visit; filter changes recompute from this snapshot without touching storage.
async function collectSeasonBundle(context,snapshot){
 const sessions=new Map(),events=new Map(),rosters=new Map();
 for(const match of snapshot.matches){
  assertContext(context);
  const session=await getMatchSession(match.id);
  assertContext(context);
  if(!session)continue;
  sessions.set(match.id,session);
  if(session.status==='finished'){events.set(match.id,await listMatchEvents(match.id));assertContext(context);}
 }
 for(const roster of snapshot.rosters)rosters.set(roster.matchId,roster);
 return {matches:snapshot.matches,players:snapshot.players,sessions,events,rosters};
}
function refreshSeason(){
 const s=state.season;if(!s.bundle)return;
 s.data=buildSeasonAnalytics({...s.bundle,filter:{groupId:s.groupId,from:s.from,to:s.to,sort:s.sort}});
 if(state.route==='analytics')render();
}
async function loadSeasonAnalytics(){
 const clubId=state.club?.id;if(!clubId)return;
 const context=clubContext();
 const snapshot={matches:state.data.matches.slice(),players:state.data.players.slice(),rosters:state.data.rosters.slice()};
 const sequence=++seasonSequence;
 if(state.season.clubId!==clubId)Object.assign(state.season,{groupId:'',from:'',to:'',sort:'goals',bundle:null,data:null});
 Object.assign(state.season,{clubId,loading:true,error:null});
 if(state.route==='analytics')render();
 try{
  const bundle=await collectSeasonBundle(context,snapshot);
  assertContext(context);
  if(sequence!==seasonSequence||state.club?.id!==clubId)return;
  Object.assign(state.season,{bundle,loading:false});
  refreshSeason();
 }catch(error){
  if(sequence!==seasonSequence||state.club?.id!==clubId)return;
  Object.assign(state.season,{loading:false,error:'Sezon verileri okunamadı: '+error.message});
  if(state.route==='analytics')render();
 }
}
function selectRoute(route){rememberMatchDraft();posterPreviewVersion++;weeklyPreviewVersion++;if(['roster','studio','pitch'].includes(route)&&!state.currentId){toast('Önce bir maç kaydı oluştur.');route='matches';}if(route==='roster'&&state.rosterFilterMatchId!==state.currentId){const m=activeMatch();state.rosterPoolGroups=m?.groupId?[m.groupId]:[];state.rosterFilterMatchId=state.currentId;state.rosterQuery='';}if(route==='pitch'&&state.route!=='pitch'){state.pitchMode='match';state.pitchSelectedId=null;}state.pitchContext=null;state.route=route;state.modal=null;if(route!=='live')wakeLock.set(false);render();if(route==='live')loadLiveClock();if(route==='analytics')loadSeasonAnalytics();window.scrollTo(0,0);}
function btn(label,action,cls='btn-primary',extra=''){return `<button class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`}
const logo=()=>`<div class="brand-icons"><img class="brand-app-mark" src="./assets/ms-emblem-mark.png" alt="" aria-hidden="true"><div class="ms-club-crest" data-club-logo aria-hidden="true">${esc((state.club?.name||"MS").slice(0,2).toLocaleUpperCase("tr-TR"))}</div></div>`;
const subtitle={dashboard:'Kontrol merkezi',players:'Oyuncu merkezi',matches:'Maç planlama',roster:'Kadro oluşturucu',team:'Genel takım kadrosu',pitch:'Taktik saha',studio:'Görsel tasarım',weekly:'Haftalık maç görselleri',analytics:'Sezon analitiği',archive:'Geçmiş ve ayarlar',live:'Canlı Maç Saati'};
function shell(content){
 const mainNav=[['dashboard','home','Kontrol Merkezi'],['matches','calendar','Yeni Maç'],['players','users','Oyuncular']];
 const workspaceNav=[['live','clock','Canlı Maç Saati'],['roster','roster','Kadro Seçimi'],['team','users','Takım Derinliği'],['pitch','pitch','Saha Dizilişi'],['studio','studio','Afiş Stüdyosu'],['weekly','calendar','Haftalık Pano'],['analytics','chart','Sezon Analitiği']];
 const studioNav=[['archive','archive','Arşiv & Ayarlar']];
 const navLink=([id,ic,label])=>`<button class="nav-link ${state.route===id?'active':''}" data-nav="${id}" ${state.route===id?'aria-current="page"':''}><span class="nav-icon">${I(ic)}</span><span>${esc(label)}</span>${state.route===id?'<span class="nav-active-indicator"></span>':''}</button>`;
 const mobileTabs=[['dashboard','home','Ana Ekran'],['matches','calendar','Maç'],['players','users','Oyuncular'],['studio','studio','Afiş']];
 const moreNav=[['live','clock','Canlı Maç Saati'],['roster','roster','Kadro Seçimi'],['team','users','Takım Derinliği'],['pitch','pitch','Saha Dizilişi'],['weekly','calendar','Haftalık Pano'],['analytics','chart','Sezon Analitiği'],['archive','archive','Arşiv & Ayarlar']];
 return `<a class="skip-link" href="#main-content">İçeriğe geç</a><div class="app-shell"><aside class="sidebar"><div class="brand">${logo()}<div class="brand-identity"><div class="brand-super">V2.6.8-F.17</div><div class="brand-title">MATCH <span>STUDIO.</span></div><div class="brand-sub">KULÜP YÖNETİMİ</div></div></div><div class="sidebar-club">${clubQuickSwitcher()}</div><div class="sidebar-scroll"><div class="nav-heading">ÇALIŞMA ALANI</div><nav class="nav-list" aria-label="Ana menü">${mainNav.map(navLink).join('')}<div class="nav-divider"></div><div class="nav-heading nav-heading-inset">MAÇ OPERASYONU</div>${workspaceNav.map(navLink).join('')}<div class="nav-divider"></div>${studioNav.map(navLink).join('')}</nav></div><div class="sidebar-foot"><div class="status-row"><span class="status-dot"></span><span id="offline-readiness">Çevrimdışı kurulum denetleniyor</span></div><p>Veriler bu cihazda saklanır. Düzenli yedek oluşturun.</p><p><a href="./privacy.html" class="privacy-link">Gizlilik Politikası</a></p></div></aside><main class="main" id="main-content" tabindex="-1"><header class="topbar"><div class="topbar-left"><span class="broadcast-live"><span></span> MAÇ MERKEZİ</span><div class="crumb">${esc(state.club?.name||'MATCH STUDIO')} ${I('chevron')} <strong>${esc(subtitle[state.route]||'Kontrol Merkezi')}</strong></div></div><div class="top-actions"><span class="local-status">${I('shield')} <span>VERİLER BU CİHAZDA</span></span><span class="connection-indicator" id="connection-indicator" role="status" aria-live="polite">${navigator.onLine?'Yerel kayıt hazır':'Çevrimdışı · yerel kayıt hazır'}</span>${btn(I('plus')+' Yeni Maç','new-match','btn-primary btn-small top-new-match')}</div></header><div class="ms-mobile-club">${clubQuickSwitcher('mobile')}</div><div class="page">${location.protocol==='file:'?'<div class="offline-alert">Güvenilir kayıt için bu uygulamayı HTTPS veya yerel sunucuyla başlatın.</div>':''}${content}</div></main><nav class="mobile-nav" aria-label="Mobil menü">${mobileTabs.map(([id,ic,label])=>`<button class="mobile-link ${state.route===id?'active':''}" data-nav="${id}" ${state.route===id?'aria-current="page"':''}>${I(ic)}<span>${label}</span></button>`).join('')}<details class="mobile-more ${moreNav.some(([id])=>state.route===id)?'active':''}"><summary aria-label="Diğer bölümler">${I('roster')}<span>Diğer</span></summary><div class="mobile-more-panel"><div class="mobile-more-title">DİĞER BÖLÜMLER</div>${moreNav.map(navLink).join('')}</div></details></nav></div>${state.modal?modalHtml():''}`;
}
function pageHeader(eyebrow,title,sub,action=''){return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1 style="margin-top:9px">${title}</h1><p class="subtitle">${sub}</p></div>${action}</div>`;}
function draftFor(kind){return state.data.posterDrafts.find(p=>p.matchId===state.currentId&&p.kind===kind)||{id:`${state.currentId}:${kind}`,matchId:state.currentId,kind,templateId:'classic-stadium',size:'portrait-post',overrides:{typeScale:1,logoScale:1,accent:'#176B46',showOptionalSections:true,backgroundAssetId:null}}}
const posterKind=()=>sessionStorage.getItem('ms-kind-'+state.club.id)||'private';
function squadReleaseWarnings(kind){if(kind!=='private')return [];const policy=activePolicy();if(!policy)return ['Maç yaş kategorisini seç.'];const roster=activeRoster();const sections=getMatchRosterSections(roster,activeLineup(),policy);const problems=[];const excess=capacityWarning(roster,policy);if(excess)problems.push(excess);if(sections.bench.length>policy.benchLimit)problems.push(`Yedekler ${sections.bench.length}/${policy.benchLimit}. İlk kadroyu tamamla veya fazlalıkları düzenle.`);return problems;}

// Explicit dependency injection: views read an immutable snapshot of the current app context per render.
const {groupSetup, dashboard, matchRow, players, input, ta, groupOpt, matchFormatFields, matchForm, workspaceHead, rosterPicker}=createMatchOperationViews({formatTurkishDate, getRosterInsights, getRosterPolicy, filterMultiGroupPool, getMatchRosterSections, FORMATS, LAYOUTS, recommendedFormatForAge, getFormatDisplay, state, getGroup, activeMatch, activeRoster, activeLineup, activePolicy, allMatches, btn, pageHeader, I, esc, nav});
const {teamRosterPage}=createTeamAnalysisViews({TEAM_ROLES, getTeamDepthStats, TEAM_PITCH_FORMATIONS, getTeamPitchAnalysis, getFormationPitchSlots, renderTeamPitch, state, activeDepth, pageHeader, esc});
const {posterStudio, weeklyPage}=createMediaStudioViews({getPosterReleaseIssues, templates, pickBoardMatches, prepareBoard, state, getGroup, activeMatch, activeRoster, btn, pageHeader, I, esc, draftFor, posterKind, workspaceHead});
const {renderLiveClock}=createLiveMatchViews({state,esc,btn,I,allMatches,getGroup,activeLineup,projectLivePitch});
const {archive, modalHtml}=createClubRecordViews({formatTurkishDate, getPitchShirtNumber, state, getGroup, activeRoster, activeLineup, allMatches, btn, logo, pageHeader, I, esc, clubManager, groupSetup, groupOpt, input, ta});
const {seasonPage}=createSeasonAnalyticsViews({state,pageHeader,esc,btn,I,formatTurkishDate,SORT_KEYS,RESULT_LABEL,RESULT_NAME});
function render(){
 rememberMatchDraft();
 if(state.route==='matches'&&state.club&&!state.currentId){const draft=matchDrafts.read(matchDraftScope());if(draft?.seed)state.sessionMatch=draft.seed;}
 const prev=document.activeElement,prevId=prev?.id;
 const prevRole=prev?.dataset?.teamRole,prevSlot=prev?.dataset?.teamSlot;
 const prevPitchMode=prev?.dataset?.pitchMode;
 if(!state.club){viewCoordinator.reset();root.innerHTML=clubWelcome();modalFocus.sync();return;}document.documentElement.style.setProperty("--v22-leaf",safeColor(state.club.accent));document.documentElement.style.setProperty("--ms-accent",safeColor(state.club.accent));setBackupClub(state.club);let page;switch(state.route){case 'players':page=players();break;case 'matches':page=matchForm();break;case 'roster':page=rosterPicker();break;case 'team':page=teamRosterPage();break;case 'pitch':page=pitchView();break;case 'live':page=renderLiveClock();break;case 'studio':page=posterStudio();break;case 'weekly':page=weeklyPage();break;case 'analytics':if(state.season.clubId!==state.club.id&&!state.season.loading)setTimeout(()=>loadSeasonAnalytics(),0);page=seasonPage();break;case 'archive':page=archive();break;default:page=dashboard()};const renderKey=JSON.stringify([state.club.id,state.club.name,state.club.accent,state.clubs.map(c=>[c.id,c.name,c.accent]),state.route]);
 const notice=location.protocol==='file:'?'<div class="offline-alert">Güvenilir kayıt için bu uygulamayı HTTPS veya yerel sunucuyla başlatın.</div>':'';
 viewCoordinator.update({key:renderKey,page:notice+page,shell:()=>shell(page),modal:state.modal?modalHtml():''});if(state.route==='matches')restoreMatchDraft();if(state.route==='studio')drawLivePreview();if(state.route==='weekly')drawWeeklyPreview();if(state.route==='archive'){updateLogoPreview();updateSWStatus()}if(state.route==='players')decorateAvatars();decorateClubLogo();updateConnectionStatus();updateSWStatus();const mob=root.querySelector('.mobile-nav'),active=mob?.querySelector('.mobile-link.active');if(mob&&active)mob.scrollLeft=Math.max(0,active.offsetLeft-mob.clientWidth/2+active.offsetWidth/2);
 // Replacing the app shell must not strand keyboard focus after a select or pitch-role click.
 if(!state.modal){let keep=null;
  if(['team-pitch-formation','team-pitch-depth','pitch-formation','season-group','season-sort','season-from','season-to'].includes(prevId))keep=document.getElementById(prevId);
  else if(prevRole)keep=[...root.querySelectorAll('[data-team-role]')].find(el=>el.dataset.teamRole===prevRole&&(prevSlot?el.dataset.teamSlot===prevSlot:!el.dataset.teamSlot));
  else if(prevPitchMode)keep=root.querySelector('[data-pitch-mode="'+prevPitchMode+'"]');
  keep?.focus({preventScroll:true});
 }
 modalFocus.sync();
}
function boardPlan(){const filtered=pickBoardMatches(state.data.matches,state.board.week,state.board.mode);const ids=state.board.selected===null?filtered.slice(0,state.board.size==='story'?8:5).map(m=>m.id):state.board.selected;return prepareBoard(state.data.matches,state.data.groups,ids,state.board.size,state.club?.name,state.club?.accent);}
let weeklyPreviewVersion=0;
async function drawWeeklyPreview(){const version=++weeklyPreviewVersion;const canvas=document.getElementById('weekly-board-canvas');if(!canvas)return;try{const logo=await bundledCrest();if(version!==weeklyPreviewVersion||!canvas.isConnected||state.route!=='weekly')return;const result=renderWeeklyBoard(boardPlan(),canvas,{logo});if(!result.fits)toast('Görsel yazısı sığmıyor: '+result.warnings.join(' '),true);}catch(error){console.error(error);if(version===weeklyPreviewVersion&&canvas.isConnected)toast('Maç panosu önizlemesi: '+error.message,true);}}
async function blobToImage(blob){if(!blob)return null;const url=URL.createObjectURL(blob);try{return await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Görsel açılamadı'));im.src=url;});}finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}}
async function decorateClubLogo(){const el=root.querySelector('[data-club-logo]');if(!el||!state.club)return;const logoId=state.data.settings.find(s=>s.id==='clubLogo')?.value;if(!logoId)return;const clubId=state.club.id;try{const blob=await loadAsset(logoId);if(!blob||!el.isConnected||state.club.id!==clubId)return;const url=URL.createObjectURL(blob),img=document.createElement('img');img.className='ms-club-mark';img.alt='';img.src=url;img.onload=()=>URL.revokeObjectURL(url);img.onerror=()=>URL.revokeObjectURL(url);el.replaceChildren(img);}catch(error){console.warn('Kulüp logosu yüklenemedi:',error);}}
async function decorateAvatars(){for(const el of document.querySelectorAll('[data-photo]')){const id=el.dataset.photo;if(!id)continue;try{const blob=await loadAsset(id);if(!blob||!el.isConnected)continue;const im=document.createElement('img');im.src=URL.createObjectURL(blob);im.className='avatar';im.alt='Oyuncu fotoğrafı';im.onload=()=>URL.revokeObjectURL(im.src);el.replaceWith(im)}catch{}}}
async function bundledCrest(){const logoId=state.data.settings.find(s=>s.id==='clubLogo')?.value;return logoId?blobToImage(await loadAsset(logoId)):null;}
async function loadPosterAssets(doc){const settings=Object.fromEntries(state.data.settings.map(x=>[x.id,x.value]));const o={};if(settings.clubLogo){const blob=await loadAsset(settings.clubLogo);if(blob)o.logo=await blobToImage(blob);}if(!o.logo)o.logo=await bundledCrest();if(doc.overrides.backgroundAssetId){const blob=await loadAsset(doc.overrides.backgroundAssetId);o.background=await blobToImage(blob)}return o;}
let posterPreviewVersion=0;
async function drawLivePreview(){
 const version=++posterPreviewVersion;
 const canvas=document.getElementById('poster-canvas');if(!canvas)return;
 try{
  const draft=draftFor(posterKind()),doc=buildPosterDocument(activeMatch(),activeRoster(),draft,activeLineup());
  const assets=await loadPosterAssets(doc);if(version!==posterPreviewVersion||!canvas.isConnected||state.route!=='studio')return;
  const result=await renderPoster(doc,canvas,assets);if(version!==posterPreviewVersion||!canvas.isConnected||state.route!=='studio')return;state.previewResult=result;
  const check=[...getPosterReleaseIssues(activeMatch(),activeRoster(),draft.kind),...squadReleaseWarnings(draft.kind)];
  const problems=[...check,...(result.fits?[]:result.warnings)];
  const status=document.getElementById('preview-status');if(status){status.className='preview-quality '+(problems.length?'needs-attention':'is-verified');status.innerHTML=problems.length?`<strong>PNG üretmeden önce düzelt</strong><ul>${problems.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`${I('check')} Yerleşim ve zorunlu alanlar kontrol edildi. Paylaşmaya hazır.`;}
  for(const el of document.querySelectorAll('[data-action="export-png"],[data-action="share-png"]'))el.disabled=!!problems.length;
  // Four previews are drawn with the same offline Canvas engine as the full-size export.
  for(const thumb of document.querySelectorAll('[data-template-thumb]')){
   if(version!==posterPreviewVersion||!thumb.isConnected)return;
   const off=document.createElement('canvas');
   const thumbDoc={...doc,templateId:thumb.dataset.templateThumb,size:'portrait-post'};
   await renderPoster(thumbDoc,off,assets);
   if(version!==posterPreviewVersion)return;
   if(thumb.isConnected)thumb.getContext('2d').drawImage(off,0,0,thumb.width,thumb.height);
  }
 }catch(e){if(version!==posterPreviewVersion)return;state.previewResult={fits:false,warnings:[e.message]};const st=document.getElementById('preview-status');if(st){st.className='preview-quality needs-attention';st.textContent='Önizleme hatası: '+e.message;}for(const el of document.querySelectorAll('[data-action="export-png"],[data-action="share-png"]'))el.disabled=true;}
}
async function updateLogoPreview(){const val=state.data.settings.find(x=>x.id==='clubLogo')?.value;if(!val)return;const blob=await loadAsset(val);if(!blob)return;const el=document.getElementById('logo-preview');if(el){el.src=URL.createObjectURL(blob);el.onload=()=>URL.revokeObjectURL(el.src);}}
async function updateSWStatus(){
 const status=document.getElementById('offline-readiness');
 const detail=document.getElementById('sw-status');
 let message='Yerel kayıt kullanılıyor · Çevrimdışı kurulum bekliyor';
 if(location.protocol==='file:') message='Dosya modu · Yerel sunucudan başlatın';
 else if('serviceWorker' in navigator){
  try{
   const reg=await navigator.serviceWorker.getRegistration('./');
   if(reg?.active && navigator.serviceWorker.controller){
    message=await getOfflineReadiness()?'Çevrimdışı uygulama dosyaları hazır':'Çevrimdışı dosyalar hazırlanıyor';
   }else if(reg) message='PWA kuruluyor · Gerekirse sayfayı yenileyin';
  }catch(error){console.warn('PWA durum kontrolü:',error);message='PWA durumu denetlenemedi';}
 }
 if(status)status.textContent=message;
 if(detail)detail.textContent=message;
}
function updateConnectionStatus(){
 const el=document.getElementById('connection-indicator');if(!el)return;
 const online=navigator.onLine;
 el.textContent=online?'Yerel kayıt hazır':'Çevrimdışı · yerel kayıt hazır';
 el.classList.toggle('is-offline',!online);
 el.setAttribute('aria-label',online?'Yerel veriler bu cihazda; sunucu erişimi doğrulanmadı':'Ağ bağlantısı yok; yerel veriler kullanılabilir');
}
window.addEventListener('online',updateConnectionStatus);
window.addEventListener('offline',updateConnectionStatus);
// Refresh persisted clock on tab return; background timers are never the source of truth.
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.club&&state.route==='live')loadLiveClock();});

async function persistDraft(patch){const kind=posterKind();const prev=draftFor(kind);const draft={...prev,...patch,overrides:patch.overrides?{...prev.overrides,...patch.overrides}:prev.overrides,updatedAt:now()};draft.overrides=validateOverrides(draft.overrides);await putRecord('posterDrafts',draft);await refresh();render();}
function formObj(form){return Object.fromEntries(new FormData(form).entries())}
async function clickAction(action,target){rememberMatchDraft();switch(action){
case 'season-refresh':await loadSeasonAnalytics();return;
case 'season-csv':{const a=state.season.data;if(!a||!a.players.length)throw Error('Dışa aktarılacak oyuncu verisi yok.');downloadFile(new Blob(['\uFEFF'+seasonPlayersCsv(a)],{type:'text/csv;charset=utf-8'}),`${clubSlug()}-sezon-oyuncular.csv`);toast('CSV dosyası hazırlandı.');return;}
case 'discard-match-draft':{
 if(!confirm(state.currentId?'Kaydedilmemiş değişiklikler bırakılsın mı? Kayıtlı maç korunacak.':'Bu sekmedeki kaydedilmemiş maç taslağı silinsin mi?'))return;
 const form=root.querySelector('#match-form');if(form)delete form.dataset.draftDirty;
 matchDrafts.remove(matchDraftScope());if(!state.currentId)state.sessionMatch=null;render();break;
}
case 'legacy-preview':{state.legacy=await inspectLegacy();render();break;}
case 'legacy-import':{if(!state.legacy?.found)throw Error('Önce eski veritabanını kontrol edin.');const n=state.legacy.counts;if(!confirm('Eski kayıtlardaki '+(n.players||0)+' oyuncu ve '+(n.matches||0)+' maç '+state.club.name+' kulübüne kopyalansın mı? Eski veritabanı değiştirilmez.'))return;await copyLegacyToActive(state.legacy.stores);state.legacy=null;await refresh();render();toast('Eski kayıtlar kopyalandı, orijinal veritabanı korundu.');break;}
case 'delete-group':{const id=target.dataset.id;const g=state.data.groups.find(x=>x.id===id);if(!g)return;if(!confirm(g.name+' grubu silinsin mi? İlişkili kayıt varsa işlem engellenecektir.'))return;await safeDeleteGroup(id);if(state.filterGroup===id)state.filterGroup='all';state.teamGroupId=null;await refresh();render();toast('Grup silindi.');break;}
case 'new-match':state.currentId=null;state.sessionMatch=null;selectRoute('matches');break;
case 'weekly-prev':case 'weekly-next':{const dt=new Date(`${state.board.week}T12:00:00Z`);dt.setUTCDate(dt.getUTCDate()+(action==='weekly-next'?7:-7));state.board.week=dt.toISOString().slice(0,10);state.board.selected=null;render();break;}
case 'weekly-import-clear':invalidateFixtureImport();render();break;
case 'weekly-import-confirm':{
 const pending=state.fixtureImport;if(!pending?.rows?.length||pending.errors?.length)throw Error('Önizleme hata içeriyor; veriler kaydedilmedi.');
 fixtureImports.assertCurrent(pending.context);
 const rawSize=Number(document.getElementById('weekly-import-format')?.value);
 if(![3,5,8,9,11].includes(rawSize))throw Error('Oyun formatını açıkça seçin.');
 const format=normalizeGameFormat({playersPerSide:rawSize,goalkeeperMode:rawSize<=4?'none':'required',benchLimit:Math.min(rawSize,8)});
 const pitchLayout=normalizePitchLayout({id:'standard'},format);
 const norm=x=>String(x||'').trim().toLocaleLowerCase('tr-TR');
 const groups=new Map(state.data.groups.map(g=>[norm(g.name),g]));
 const signatures=new Set(state.data.matches.map(m=>[m.groupId,norm(m.opponent),m.matchDate,m.kickoffTime].join('|')));
 const errors=[],prepared=[];
 for(const [idx,item] of pending.rows.entries()){
  const group=groups.get(norm(item.group));
  if(!group){errors.push('Satır '+(idx+2)+': mevcut takım bulunamadı: '+item.group);continue;}
  const signature=[group.id,norm(item.opponent),item.matchDate,item.kickoffTime].join('|');
  if(signatures.has(signature)){errors.push('Satır '+(idx+2)+': aynı maç zaten kayıtlı veya dosyada tekrar var.');continue;}
  signatures.add(signature);
  const result=validateMatch({...item,groupId:group.id,ageCategory:group.name,gameFormat:format,pitchLayout,state:'draft'});
  if(!result.ok){errors.push('Satır '+(idx+2)+': '+result.errors.join(', '));continue;}
  prepared.push(result.data);
 }
 if(errors.length)throw Error(errors.slice(0,5).join(' | ')+'; hiçbir maç eklenmedi.');
 if(!prepared.length||!confirm(prepared.length+' maç kontrol edildi. Tümünü mevcut kulübe kaydetmek istiyor musunuz?'))return;
 await fixtureImports.commit(pending,prepared);
 invalidateFixtureImport();state.board.selected=null;await refresh();render();
 toast(prepared.length+' maç aynı işlemde kaydedildi.');break;
}
case 'weekly-export':case 'weekly-share':{const plan=boardPlan();if(!plan.ok)throw Error(plan.issues.join(' '));const clubLogo=await bundledCrest();const blob=await exportWeeklyBoard(plan,{logo:clubLogo});const name=`${clubSlug()}_${plan.size==='story'?'HIKAYE':'MAC_PROGRAMI'}_${plan.items[0].date}.png`;if(action==='weekly-share'){const result=await sharePng(blob,name);toast(result==='shared'?'Paylaşım tamamlandı.':result==='cancelled'?'İşlem iptal edildi.':'PNG indirildi. WhatsApp grubunda dosyayı paylaşabilirsin.');}else{downloadPng(blob,name);toast('Haftalık maç panosu indirildi.');}break;}
case 'go-live':{if(!activeMatch())throw Error('Önce maç seçmelisiniz.');selectRoute('live');break;}
case 'live-quick-event':{
 if(!['running','paused','interval','awaitFinal'].includes(state.liveSession?.status))throw Error('Olay eklemek için maçın başlatılmış olması gerekir.');
 const type=target.dataset.eventType,form=root.querySelector('#live-event-form');
 if(!form||!['GOAL','OPPONENT_GOAL','YELLOW_CARD','RED_CARD'].includes(type))return;
 form.elements.namedItem('type').value=type;
 if(type!=='GOAL')form.elements.namedItem('assistPlayerId').value='';
 form.elements.namedItem('goalEventId').value='';
 if(type==='OPPONENT_GOAL')form.elements.namedItem('playerId').value='';
 form.scrollIntoView({behavior:'instant',block:'start'});
 (type==='OPPONENT_GOAL'?form.querySelector('button[type="submit"]'):form.elements.namedItem('playerId')).focus({preventScroll:true});
 break;
}
case 'live-report-print':{tickLiveClock();window.print();break;}
case 'live-cancel-edit':{const edit=root.querySelector('#live-event-correction-form');if(edit){edit.hidden=true;edit.reset();}break;}
case 'live-edit-event':{const edit=root.querySelector('#live-event-correction-form');const item=effectiveSportingEvents(state.liveEvents||[]).find(e=>e.id===target.dataset.id);if(!edit||!item)throw Error('Düzeltilecek olay bulunamadı.');edit.reset();edit.hidden=false;edit.elements.namedItem('targetEventId').value=item.id;edit.elements.namedItem('type').value=item.type;edit.elements.namedItem('playerId').value=item.payload?.playerId||'';edit.elements.namedItem('assistPlayerId').value=item.payload?.assistPlayerId||'';edit.elements.namedItem('goalEventId').value=item.payload?.goalEventId||'';edit.elements.namedItem('note').value=item.payload?.note||'';edit.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});edit.elements.namedItem('reason').focus({preventScroll:true});break;}
case 'live-select':{state.currentId=null;state.sessionMatch=null;state.liveSession=null;state.liveEvents=[];selectRoute('live');break;}
case 'live-open':{const match=state.data.matches.find(m=>m.id===target.dataset.id);if(!match)throw Error('Maç bulunamadı.');state.currentId=match.id;state.sessionMatch=null;selectRoute('live');break;}
case 'live-start':case 'live-pause':case 'live-resume':case 'live-end':case 'live-next':case 'live-finish':{
 const map={'live-start':'START','live-pause':'PAUSE','live-resume':'RESUME','live-end':'END_PERIOD','live-next':'NEXT_PERIOD','live-finish':'FINISH'};
 if(!state.liveSession||!activeMatch())throw Error('Önce canlı oturumu açın.');
 if(activeMatch()?.state==='archived')throw Error('Arşivli maç başlatılamaz.');
 if(action==='live-end'&&!confirm('Bu devreyi bitirmek istiyor musunuz?'))return;
 if(action==='live-finish'&&!confirm('Maçı tamamlayıp saati kilitlemek istiyor musunuz?'))return;
 const activeId=state.currentId;
 const result=await commitClockAction({matchId:activeId,action:map[action],expectedRevision:state.liveSession.revision,idempotencyKey:'clock:'+crypto.randomUUID()});
 if(result.duplicate)toast('Bu işlem daha önce kaydedilmiş.');else notifyLiveUpdate();await loadLiveClock();break;
}
case 'go-players':selectRoute('players');break;case 'add-player':state.modal={type:'player',player:{groupIds:state.filterGroup==='all'?[]:[state.filterGroup]}};render();break;
case 'edit-player':state.modal={type:'player',player:state.data.players.find(p=>p.id===target.dataset.id)};render();break;
case 'pitch-menu-close':closePitchContext();break;
case 'pitch-menu-number':{
 if(activeMatch()?.state==='archived')throw Error('Arşivli maç düzenlenemez.');
 const playerId=state.pitchContext?.playerId||state.pitchSelectedId;
 if(!playerId)throw Error('Önce bir oyuncu seçin.');
 rememberPitchModalTrigger();state.pitchContext=null;state.modal={type:'pitch-number',playerId};render();break;
}
case 'pitch-number-save':{
 if(state.modal?.type!=='pitch-number')return;
 const form=document.getElementById('pitch-number-form');if(!form?.reportValidity())return;
 const playerId=state.modal.playerId;const number=form.querySelector('#pitch-shirt-number').value;
 const next=setPitchShirtNumber(activeLineup(),activeRoster(),playerId,number);
 state.modal=null;state.pitchContext=null;await savePitchPlan(next);toast('Forma numarası bu maç için kaydedildi.');break;
}
case 'pitch-number-reset':{
 if(state.modal?.type!=='pitch-number')return;
 const id=state.modal.playerId;const plan=setPitchShirtNumber(activeLineup(),activeRoster(),id,'');
 state.modal=null;await savePitchPlan(plan);toast('Oyuncunun kadro numarasına dönüldü.');break;
}
case 'pitch-menu-select':{
 const id=state.pitchContext?.playerId;if(!id)return;
 state.pitchSelectedId=id;state.pitchContext=null;render();toast('Hedef saha konumuna dokunarak oyuncunun yerini değiştir.');break;
}
case 'pitch-menu-role':{
 if(activeMatch()?.state==='archived')throw Error('Arşivli maç düzenlenemez.');
 const playerId=state.pitchContext?.playerId||state.pitchSelectedId;if(!playerId)return;
 rememberPitchModalTrigger();state.pitchContext=null;state.modal={type:'pitch-role',playerId};render();break;
}
case 'pitch-role-save':{
 if(state.modal?.type!=='pitch-role')return;
 const playerId=state.modal.playerId;const role=document.getElementById('pitch-role-modal-select')?.value;
 const plan=setPlayerPitchRole(activeLineup(),activeRoster(),playerId,role);
 state.modal=null;await savePitchPlan(plan);toast('Oyuncunun bu maçtaki mevkii kaydedildi.');break;
}
case 'pitch-menu-player':{
 const id=state.pitchContext?.playerId;if(!id)return;
 const player=state.data.players.find(p=>p.id===id);
 if(!player){toast('Bu oyuncunun kulüp kaydı bulunamadı.',true);return;}
 rememberPitchModalTrigger();state.pitchContext=null;state.modal={type:'player',player};render();break;
}
case 'pitch-menu-bench':{
 const id=state.pitchContext?.playerId;if(!id)return;
 if(activeMatch()?.state==='archived')throw Error('Arşivli maç düzenlenemez.');
 state.pitchContext=null;state.pitchSelectedId=null;
 const plan=autofillStartingLineup(removeFromPitch(activeLineup(),id),activeRoster(),activePolicy(),{excludeIds:[id]});
 await savePitchPlan(plan);toast('Oyuncu yedek listesine alındı.');break;
}

case 'close-modal':state.modal=null;render();break;
case 'submit-player':{const form=document.getElementById('player-form');if(!form.reportValidity())return;const data=formObj(form),old=state.data.players.find(p=>p.id===data.playerId)||{};let p={...old,fullName:data.fullName,birthDate:data.birthDate||null,birthYear:data.birthDate?Number(data.birthDate.slice(0,4)):data.birthYear,shirtNumber:data.shirtNumber,position:data.position,licenseStatus:data.licenseStatus,isActive:data.isActive==='true',groupIds:[...form.querySelectorAll('[name="groups"]:checked')].map(x=>x.value)};const r=validatePlayer(p);if(!r.ok){toast(r.errors.join(' '),true);return}p=r.data;const photo=form.querySelector('[name="photo"]').files[0];let photoBlob=null;
if(photo){photoBlob=await preparePhoto(photo);p.photoAssetId=uid();}
const oldAsset=old.photoAssetId&&old.photoAssetId!==p.photoAssetId?old.photoAssetId:null;
const oldAssetStillUsed=oldAsset&&(state.data.players.some(other=>other.id!==p.id&&other.photoAssetId===oldAsset)||state.data.settings.some(setting=>setting.value===oldAsset)||state.data.posterDrafts.some(d=>d?.overrides?.backgroundAssetId===oldAsset));
const changed=syncRosterPlayerDetails(state.data.rosters,p,state.data.matches);
await transact(['players','rosters','assets'],'readwrite',tx=>{
 if(photoBlob)tx.objectStore('assets').put({id:p.photoAssetId,blob:photoBlob,mime:photoBlob.type});
 tx.objectStore('players').put(p);
 for(let i=0;i<changed.length;i++)if(changed[i]!==state.data.rosters[i])tx.objectStore('rosters').put(changed[i]);
 if(oldAsset&&!oldAssetStillUsed)tx.objectStore('assets').delete(oldAsset);
});
state.modal=null;await refresh();render();toast('Oyuncu kaydedildi. Aktif maç kadroları güncellendi.');break;}
case 'delete-player':{
 const id=target.dataset.id,p=state.data.players.find(x=>x.id===id);if(!p)return;
 const refs=state.data.rosters.reduce((n,r)=>n+(r.entries||[]).filter(e=>e.playerId===id).length,0);
 if(!confirm(`${p.fullName} kalıcı silinsin mi? ${refs} maç kadrosu bağlantısı, geçmişteki isim kayıtları, saha atamaları ve varsa kullanılmayan fotoğraf temizlenecek. Eski yerel kurtarma noktası kaldırılacak. Bu işlem geri alınamaz. İndirilmiş dış yedekler silinemez; bu kopyaları ayrıca yönetmelisiniz. Silinmiş kimlikleri içeren eski yedekler bu cihazdaki aynı kulübe geri yüklenmez. Başka cihaz veya tarayıcı verilerini temizleme sonrasında bu koruma taşınmaz.`))return;
 const result=await erasePlayerAtomic(id);state.modal=null;state.pitchSelectedId=null;state.pitchContext=null;await refresh();render();toast(`Oyuncu kalıcı silindi; ${result.erasedEntryCount} kadro bağlantısı ve ${result.assetCount} kullanılmayan görsel temizlendi.`);break;}
case 'csv-import':state.modal={type:'csv',groupId:state.filterGroup==='all'?state.data.groups[0]?.id:state.filterGroup};render();break;
case 'csv-confirm':{if(!state.csvPending?.rows?.length)return;
const plan=mergeCsvPlayers(state.csvPending.rows,state.data.players);
const records=plan.updates.map(p=>{const validated=validatePlayer(p);if(!validated.ok)throw Error(validated.errors.join(' '));return validated.data;});
await transact(['players'],'readwrite',tx=>{for(const row of records)tx.objectStore('players').put(row);});
state.csvPending=null;state.modal=null;await refresh();render();toast(`${plan.created} yeni oyuncu eklendi; ${plan.updated} mevcut oyuncunun grup üyeliği birleştirildi.`);break;}
case 'format-turkey-half':{const form=document.getElementById('match-form');if(!form)return;form.dataset.draftDirty='true';form.querySelector('#gameSize').value='8';form.querySelector('#pitchLayoutId').value='half-pitch-crosswise';form.querySelector('#goalkeeperMode').value='required';form.querySelector('#benchLimit').value='8';rememberMatchDraft(form);toast('Türkiye U11/U12 · Yarı saha enine 8v8 şablonu seçildi.');break;}
case 'save-match':{if(activeMatch()?.state==='archived')throw Error('Bu maç arşivli. Düzenlemek için Arşiv / Ayarlar bölümünden kilidini açın.');const form=document.getElementById('match-form');if(!form.reportValidity())return;const old=activeMatch()||{},fields=formObj(form);
 const gameFormat=normalizeGameFormat({playersPerSide:fields.gameSize,goalkeeperMode:fields.goalkeeperMode,benchLimit:fields.benchLimit});
 const pitchLayout=normalizePitchLayout({id:fields.pitchLayoutId,half:fields.pitchHalf},gameFormat);
 for(const k of ['gameSize','goalkeeperMode','benchLimit','pitchLayoutId','pitchHalf'])delete fields[k];
 const r=validateMatch({...old,...fields,gameFormat,pitchLayout});if(!r.ok){toast(r.errors.join(' '),true);return}const match=r.data;
 const policy=getRosterPolicy(match,state.data.groups);if(!policy)throw Error('Geçerli bir maç formatı seçmelisin.');
 let previousRoster=state.data.rosters.find(x=>x.matchId===match.id)||buildRoster(match.id,[]);if(old.groupId&&old.groupId!==match.groupId&&previousRoster.entries.length){if(!confirm('Takım / grup değişiyor. Daha önce seçilen oyuncular korunacak. Devam etmek istiyor musun?'))return;}const oldPolicy=old.id?getRosterPolicy(old,state.data.groups):null;
 let updatedPlan=null;
 if(old.id&&oldPolicy&&(oldPolicy.starterLimit!==policy.starterLimit||oldPolicy.defaultPreset!==policy.defaultPreset&&old.gameFormat?.goalkeeperMode!==match.gameFormat?.goalkeeperMode)){
 const raw=state.data.settings.find(v=>v.id===`lineup:${old.id}`)?.value;
 const oldPlan=raw?normalizeLineup(raw,previousRoster):makeLineup(old.id,oldPolicy.defaultPreset);
 const displaced=Object.entries(oldPlan.assignments||{}).filter(([slot,id])=>Number(slot)>=policy.starterLimit);
 const message=`Oyun formatı ${oldPolicy.starterLimit}v${oldPolicy.starterLimit} → ${policy.starterLimit}v${policy.starterLimit} değişiyor. ${displaced.length} saha oyuncusu sahadan yedeğe alınacak; hiçbir oyuncu kadrodan silinmeyecek. Onaylıyor musun?`;
 if(!confirm(message))return;
 updatedPlan=changePitchPreset(oldPlan,policy.defaultPreset);
 }
 const overload=capacityWarning(previousRoster,policy);await saveMatchAndRoster(match,previousRoster,updatedPlan);matchDrafts.remove(matchDraftScope());delete form.dataset.draftDirty;state.currentId=match.id;state.sessionMatch=null;await refresh();selectRoute('roster');toast(overload||'Maç kaydedildi. Kadronu seçebilirsin.',!!overload);break;}
case 'edit-match':selectRoute('matches');break;
case 'open-match':state.currentId=target.dataset.id;state.sessionMatch=null;state.liveSession=null;state.liveEvents=[];selectRoute('matches');break;
case 'go-roster':selectRoute('roster');break;
case 'go-pitch':if(!activeMatch()){toast('Önce maç oluştur.',true);return}selectRoute('pitch');break;
case 'roster-start':{if(activeMatch()?.state==='archived')throw Error('Arşivli maç düzenlenemez.');const policy=activePolicy();if(!policy)throw Error('Maç kategorisi seçilmeli.');const plan=activeLineup();if(Object.keys(plan.assignments).length>=policy.starterLimit){state.pitchSelectedId=target.dataset.id;selectRoute('pitch');toast('İlk kadro dolu. Sahadaki bir oyuncuya dokunarak değişiklik yap.');return;}const free=Array.from({length:policy.starterLimit},(_,i)=>i).find(i=>!plan.assignments[String(i)]);await savePitchPlan(placePlayer(plan,activeRoster(),target.dataset.id,free));break;}
case 'roster-bench':{if(activeMatch()?.state==='archived')throw Error('Arşivli maç düzenlenemez.');await savePitchPlan(autofillStartingLineup(removeFromPitch(activeLineup(),target.dataset.id),activeRoster(),activePolicy(),{excludeIds:[target.dataset.id]}));break;}
case 'pitch-export':{const blob=await pitchPng(activeMatch(),activeRoster(),activeLineup(),state.data.players,state.pitchMode,state.club?.name);const nm=String(activeMatch()?.opponent||'MAÇ').replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ ]/g,'').replaceAll(' ','_');downloadPng(blob,`${clubSlug()}_SAHA_${nm}_${state.pitchMode}.png`);toast('Saha görseli PNG olarak indirildi.');break;}
case 'go-studio':if(!activeMatch()){toast('Önce maç oluştur.',true);return}selectRoute('studio');break;
case 'bulk-add':{
 if(!state.rosterPoolGroups.length){toast('Toplu eklemek için önce takım/grup filtresi seç.',true);return;}
 const current=activeRoster();const groupPlayers=filterMultiGroupPool(state.data.players,state.rosterPoolGroups,state.rosterQuery);
 const added=groupPlayers.filter(p=>!current.entries.some(e=>e.playerId===p.id));
 if(!added.length){toast('Filtredeki oyuncular zaten kadroda.');return;}
 if(!confirm(`${added.length} oyuncu maç kadrosuna toplu eklensin mi?`))return;
 const roster=proposeBulkRosterAddition(current,groupPlayers,activePolicy());const plan=autofillStartingLineup(activeLineup(),roster,activePolicy());
 await transact(['rosters','settings'],'readwrite',tx=>{tx.objectStore('rosters').put({id:state.currentId,...roster});tx.objectStore('settings').put({id:`lineup:${state.currentId}`,value:plan});});await refresh();render();toast(`${added.length} oyuncu kadroya eklendi.`);break;
 }
 case 'last-roster':{const found=await findLastRosterForGroup(activeMatch().groupId,state.currentId);if(!found){toast('Bu takım için önceki maç tarihinde kayıtlı bir kadro bulunamadı.');return}if(!confirm(`${found.match.opponent} maçının ${found.roster.entries.length} kişilik kadrosu getirilsin mi? Geçerli kadronun yerini alır.`))return;if(found.roster.entries.length>activePolicy().maxPlayers)throw Error(`Eski kadro ${activePolicy().maxPlayers} kişilik sınırı aşıyor. Kadro değiştirilmedi.`);const roster=copyRosterForMatch(found.roster,state.currentId);const plan=autofillStartingLineup(makeLineup(state.currentId,activePolicy().defaultPreset),roster,activePolicy());await transact(['rosters','settings'],'readwrite',tx=>{tx.objectStore('rosters').put({id:state.currentId,...roster});tx.objectStore('settings').put({id:`lineup:${state.currentId}`,value:plan});});await refresh();render();toast('Önceki kadro kopyalandı.');break;}
case 'remove-selected':{if(activeMatch()?.state==='archived')throw Error('Arşivli maç düzenlenemez.');const r=removePlayer(activeRoster(),target.dataset.id);await transact(['rosters','settings'],'readwrite',tx=>{tx.objectStore('rosters').put({id:state.currentId,...r});tx.objectStore('settings').put({id:`lineup:${state.currentId}`,value:autofillStartingLineup(removeFromPitch(activeLineup(),target.dataset.id),r,activePolicy())});});await refresh();render();break;}
case 'move-up':case 'move-down':{const old=activeRoster();const i=old.entries.findIndex(x=>x.playerId===target.dataset.id);if(i<0)return;const r=movePlayer(old,target.dataset.id,i+(action==='move-up'?-1:1));await putRecord('rosters',{id:state.currentId,...r});await refresh();render();break;}
case 'export-png':case 'share-png':{const issues=[...getPosterReleaseIssues(activeMatch(),activeRoster(),posterKind()),...squadReleaseWarnings(posterKind())];if(issues.length){toast(issues.join(' '),true);return;}const doc=buildPosterDocument(activeMatch(),activeRoster(),draftFor(posterKind()),activeLineup());if(doc.kind==='private'&&!doc.players.length){toast('Özel afiş için en az bir oyuncu seç.',true);return}const assets=await loadPosterAssets(doc),blob=await exportPng(doc,assets);const filename=`${clubSlug()}_${safeFilenamePart(doc.match.opponent,50)}_${doc.kind}_${doc.size}.png`;if(action==='share-png'){const outcome=await sharePng(blob,filename);toast(outcome==='shared'?'Paylaşım tamamlandı.':outcome==='cancelled'?'Paylaşım iptal edildi.':'Dosya indirildi. WhatsApp üzerinden paylaşabilirsiniz.')}else{downloadPng(blob,filename);toast('PNG dosyası indirildi.')}break;}
case 'clear-bg':await persistDraft({overrides:{backgroundAssetId:null}});toast('Özel arka plan kaldırıldı.');break;
case 'backup-export-secure':{
 const password=prompt('Şifreli yedek parolası (en az 12 karakter). Parolayı güvenli saklayın:');if(password===null)return;
 if(password.length<12)throw Error('Parola en az 12 karakter olmalı.');
 const repeat=prompt('Parolayı tekrar yazın:');if(repeat===null)return;
 if(password!==repeat)throw Error('Parolalar eşleşmiyor; yedek oluşturulmadı.');
 const blob=await exportEncryptedBackup(password);
 downloadPng(blob,`${clubSlug()}_MATCH_STUDIO_KORUMALI_${new Date().toISOString().slice(0,10)}.json`);
 toast('Şifreli yedek hazırlandı. İndirilenler klasörünü kontrol edin; parolanızı saklayın.');break;}
case 'backup-export':{
 if(!confirm('UYARI: Bu JSON oyuncu ve fotoğrafları ŞİFRESİZ içerir. Güvenli kullanım gerekliliğini anladınız mı?'))return;
 const blob=await exportBackup();downloadPng(blob,`${clubSlug()}_MATCH_STUDIO_SIFRESIZ_${new Date().toISOString().slice(0,10)}.json`);
 toast('Şifresiz JSON indirmesi başlatıldı; dosyanın kaydedildiğini kontrol edin.');break;}
case 'backup-confirm':{
 if(!confirm('Yedek dosyasını Android/Windows İndirilenler klasöründe bizzat açıp/varlığını kontrol ettiniz ve güvenli yere taşıdınız mı?'))return;
 await putRecord('settings',{id:'lastBackup',value:{date:now(),verifiedByUser:true,clubId:state.club.id}});await refresh();render();toast('Yedek kontrolü kullanıcı tarafından doğrulandı.');break;}
case 'backup-import':document.getElementById('backup-file').click();break;
case 'integrity-audit':{state.integrityAudit=await auditActiveClub();render();toast(state.integrityAudit.issueCount?'Veri tutarsızlıkları bulundu; raporu inceleyin.':'Kayıt bağlantıları incelendi; hata bulunmadı.',!!state.integrityAudit.issueCount);break;}
case 'backup-rollback':{
 const restorePoint=await readRestorePoint(state.club.id);if(!restorePoint)throw Error('Bu kulüpte geçerli kurtarma noktası yok.');
 const label=Object.entries(restorePoint.counts).map(([k,n])=>`${k}: ${n}`).join(' | ');
 if(!confirm(`UYARI: ${new Date(restorePoint.createdAt).toLocaleString('tr-TR')} tarihli kurtarma noktasına dönülecek. ŞİMDİKİ VERİLERİN TÜMÜ DEĞİŞECEK. Kaydedilen eski durum: ${label}. Devam mı?`))return;
 if(prompt('Geri alma işlemini onaylamak için GERİ AL yazın:')!=='GERİ AL')return;
 invalidateFixtureImport();const result=await rollbackToRestorePoint(state.club.id);matchDrafts.clearClub(state.club.id);state.currentId=null;state.sessionMatch=null;state.integrityAudit=null;await refresh();selectRoute('dashboard');toast('Önceki kulüp verileri yerel kurtarma noktasından geri alındı; içerikleri kontrol edin.');break;
}
case 'backup-recovery-discard':{const point=await readRestorePoint(state.club.id);if(!point)throw Error('Kurtarma noktası yok.');if(!confirm('Tek yerel kurtarma noktasını kalıcı olarak kaldırmak istediğinizden emin misiniz?'))return;await discardRestorePoint(state.club.id);toast('Yerel kurtarma noktası kaldırıldı.');break;}
case 'club-delete':{
 const club=state.club,backup=state.data.settings.find(s=>s.id==='lastBackup')?.value;
 if(!backup?.verifiedByUser||backup.clubId!==club.id)throw Error('Bu kulüp için doğrulandığı işaretlenmiş güncel yedek kaydı yok. Şifreli yedeği indirip kontrol ettikten sonra doğrulayın.');
 if(!confirm(`${club.name} kulübünün tüm oyuncu, maç, kadro ve görselleri BU TARAYICIDAN kalıcı silinecek. JSON yedeğinizi farklı bir yerde sakladığınızdan emin misiniz?`))return;
 const exact=prompt(`Silme kilidi: kulüp adını birebir girin:\n${club.name}`);if(exact===null)return;
 if(exact!==club.name)throw Error('Kulüp adı eşleşmiyor. Silme iptal edildi.');
 if(prompt('Son onay: ŞİFRELİ YEDEĞİ DOĞRULADIM yazın:')!=='ŞİFRELİ YEDEĞİ DOĞRULADIM')return;
 if(!confirm('SON ADIM: Kulüp veritabanı ve yerel kurtarma noktası da kaldırılacak. Geri dönüş yok. SİLİNSİN Mİ?'))return;
 let finished=false;try{await deleteClubSafely(club.id,exact,true);matchDrafts.clearClub(club.id);finished=true;}finally{
  // A pending tombstone must never be opened as a new empty club after a blocked deletion.
  state.clubs=await listClubs();const next=state.clubs[0];if(next){await chooseClub(next.id)}else{clearActiveId();state.club=null;state.integrityAudit=null;render();}
 }
 toast(finished?'Kulüp verileri cihazdan kalıcı olarak silindi.':'Silme işlemi bekliyor; diğer sekmeleri kapatıp yeniden açın.',!finished);break;
}

case 'toggle-archive':{const m=state.data.matches.find(x=>x.id===target.dataset.id);if(!m)return;
 const archived=m.state!=='archived';if(!confirm(archived?'Bu maç arşivlensin mi? Arşivdeki oyuncu isimleri sonraki değişikliklerden etkilenmeyecek.':'Bu maç yeniden düzenlenebilir hale getirilsin mi?'))return;
 await putRecord('matches',{...m,state:archived?'archived':'draft',updatedAt:now()});await refresh();render();toast(archived?'Maç arşivlendi.':'Maç yeniden etkinleştirildi.');break;}
case 'delete-match':{if(!confirm('Bu maç ve kadro kaydı kalıcı silinsin mi?'))return;const id=target.dataset.id;await deleteMatchAtomic(id);matchDrafts.remove({clubId:state.club.id,matchId:id});if(state.currentId===id){state.currentId=null;state.liveSession=null;state.liveEvents=[];}await refresh();render();toast('Maç silindi.');break;}
case 'duplicate-match':{if(matchDrafts.read({clubId:state.club.id,matchId:null})&&!confirm('Kaydedilmemiş yeni maç taslağı yerine kopya taslak açılsın mı? Önceki taslak silinecek.'))return;const src=state.data.matches.find(m=>m.id===target.dataset.id);if(!src)return;matchDrafts.remove({clubId:state.club.id,matchId:null});const form=root.querySelector('#match-form');if(form)delete form.dataset.draftDirty;state.currentId=null;state.sessionMatch={...src,id:uid(),opponent:'',matchDate:'',kickoffTime:'',venue:'',meetingTime:'',mealDeadline:'',mealMenu:'',meetingPlace:'',coachNotes:'',hydrationNotes:'',kitNotes:'',state:'draft',createdAt:now(),updatedAt:now()};matchDrafts.write(matchDraftScope(),{fields:{},seed:state.sessionMatch});selectRoute('matches');toast('Kopya taslak açıldı. Yeni rakip, tarih, saat ve stat bilgilerini gir.');break;}
}}
listenRoot('click',e=>{
 const out=e.target.closest('[data-live-pitch-out]'),inside=e.target.closest('[data-live-pitch-in]');
 if(!out&&!inside)return;
 e.preventDefault();
 const select=root.querySelector(out?'#live-sub-out':'#live-sub-in');
 if(!select||select.disabled)return;
 const id=out?.dataset.livePitchOut||inside?.dataset.livePitchIn;
 if(![...select.options].some(o=>o.value===id))return;
 select.value=select.value===id?'':id;
 select.dispatchEvent(new Event('change',{bubbles:true}));
});
function syncLivePitchSelection(){
 const out=root.querySelector('#live-sub-out')?.value||'',inside=root.querySelector('#live-sub-in')?.value||'';
 root.querySelectorAll('[data-live-pitch-out]').forEach(el=>{const chosen=el.dataset.livePitchOut===out;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen));});
 root.querySelectorAll('[data-live-pitch-in]').forEach(el=>{const chosen=el.dataset.livePitchIn===inside;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen));});
 const label=root.querySelector('#live-pitch-selection');if(label){
  const players=new Map(state.data.players.map(p=>[p.id,p.fullName]));
  label.textContent=(out?players.get(out)||'Çıkan seçildi':'Sahadan oyuncu seçin')+' → '+(inside?players.get(inside)||'Giren seçildi':'Yedekten oyuncu seçin');
 }
 const dock=root.querySelector('.live-action-dock');dock?.classList.toggle('engaged',Boolean(out||inside));
 const submit=root.querySelector('#live-pitch-confirm');if(submit)submit.disabled=!out||!inside||root.querySelector('#live-sub-out')?.disabled;
}
listenRoot('change',e=>{if(e.target.matches('#live-sub-out,#live-sub-in'))syncLivePitchSelection();});
listenRoot('change',e=>{const el=e.target;if(!['season-group','season-sort','season-from','season-to'].includes(el.id))return;const s=state.season;if(el.id==='season-group')s.groupId=el.value;if(el.id==='season-sort')s.sort=el.value;if(el.id==='season-from')s.from=el.value;if(el.id==='season-to')s.to=el.value;refreshSeason();});
listenRoot('click',async e=>{
 if(state.pitchContext&&!e.target.closest('.pitch-context-menu')&&!e.target.closest('[data-pitch-menu-trigger]'))closePitchContext(false);
 const menuButton=e.target.closest('[data-pitch-menu-trigger]');if(menuButton){e.preventDefault();e.stopPropagation();const rect=menuButton.getBoundingClientRect();openPitchContext(menuButton.dataset.pitchMenuTrigger,rect.left,rect.bottom+5);return;}

 const size=e.target.closest('[data-weekly-size]');if(size){state.board.size=size.dataset.weeklySize;state.board.selected=null;render();return;}
 const fixture=e.target.closest('[data-weekly-match]');if(fixture){const available=pickBoardMatches(state.data.matches,state.board.week,state.board.mode);const selected=state.board.selected===null?available.slice(0,state.board.size==='story'?8:5).map(m=>m.id):[...state.board.selected];const id=fixture.dataset.weeklyMatch;state.board.selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];render();return;}
 const poolGroupEl=e.target.closest('[data-pool-group]');if(poolGroupEl){const val=poolGroupEl.dataset.poolGroup;state.rosterPoolGroups=val==='all'?[]:state.rosterPoolGroups.includes(val)?state.rosterPoolGroups.filter(id=>id!==val):[...state.rosterPoolGroups,val];render();return;}
 const priority=e.target.closest('[data-team-priority]');if(priority){
  try{await persistTeamDepth(moveTeamRoleCandidate(activeDepth(),priority.dataset.playerId,state.teamRoleSelected,priority.dataset.teamPriority==='up'?-1:1,state.data.players));}
  catch(error){toast(error.message,true);}return;
 }
 const tr=e.target.closest('[data-team-role]');if(tr){state.teamRoleSelected=tr.dataset.teamRole;render();return;}
 const ptMode=e.target.closest('[data-pitch-mode]');if(ptMode){state.pitchMode=ptMode.dataset.pitchMode==='all'?'all':'match';state.pitchSelectedId=null;render();return;}
 const rolePlayer=e.target.closest('[data-pitch-role-player]');if(rolePlayer){state.pitchSelectedId=rolePlayer.dataset.pitchRolePlayer;render();return;}
 const ptPlayer=e.target.closest('[data-pitch-player]');if(ptPlayer){state.pitchSelectedId=ptPlayer.dataset.pitchPlayer;render();return;}
 const ptClear=e.target.closest('[data-pitch-clear]');if(ptClear){state.pitchSelectedId=null;render();return;}
 const ptRemove=e.target.closest('[data-pitch-remove]');if(ptRemove){const plan=autofillStartingLineup(removeFromPitch(activeLineup(),ptRemove.dataset.pitchRemove),activeRoster(),activePolicy(),{excludeIds:[ptRemove.dataset.pitchRemove]});await savePitchPlan(plan);return;}
 const ptSlot=e.target.closest('[data-pitch-slot]');if(ptSlot){const slot=ptSlot.dataset.pitchSlot;const plan=activeLineup();const here=plan.assignments[slot];if(state.pitchSelectedId){const changed=placePlayer(plan,activeRoster(),state.pitchSelectedId,Number(slot));state.pitchSelectedId=null;await savePitchPlan(changed);}else if(here){state.pitchSelectedId=here;render();}else toast('Önce sağdaki yedek listesinden bir oyuncu seç.');return;}
 const navEl=e.target.closest('[data-nav]');if(navEl){selectRoute(navEl.dataset.nav);return}const tab=e.target.closest('[data-mobile-tab]');if(tab){if(tab.dataset.mobileTab==='match')selectRoute('matches');else if(tab.dataset.mobileTab==='roster')selectRoute('roster');else{state.tab=tab.dataset.mobileTab;render()}return}const gr=e.target.closest('[data-group]');if(gr){state.filterGroup=gr.dataset.group;render();return}const k=e.target.closest('[data-kind]');if(k){sessionStorage.setItem('ms-kind-'+state.club.id,k.dataset.kind);render();return}const t=e.target.closest('[data-template]');if(t){try{await persistDraft({templateId:t.dataset.template})}catch(e){toast(e.message,true)}return}const s=e.target.closest('[data-size]');if(s){try{await persistDraft({size:s.dataset.size})}catch(e){toast(e.message,true)}return}const a=e.target.closest('[data-action]');if(a){e.preventDefault();try{await clickAction(a.dataset.action,a)}catch(err){console.error(err);toast(err.message||'İşlem sırasında hata oluştu.',true)}}});
// Right click on an occupied on-field player opens contextual actions.

listenRoot('contextmenu',e=>{
 const spot=e.target.closest('[data-pitch-slot]');if(!spot||state.route!=='pitch'||state.pitchMode!=='match')return;
 if(!activeLineup().assignments[spot.dataset.pitchSlot])return;
 e.preventDefault();openPitchContext(spot.dataset.pitchSlot,e.clientX,e.clientY);
});
document.addEventListener('keydown',e=>{
 if(!state.pitchContext)return;
 if(e.key==='Escape'){e.preventDefault();closePitchContext(true);return;}
 const menu=root.querySelector('.pitch-context-menu');
 if(!menu||!menu.contains(document.activeElement))return;
 const items=[...menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
 const index=items.indexOf(document.activeElement);
 if(!items.length)return;
 if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
  e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?items.length-1:
  (index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;
  items[next].focus({preventScroll:true});
 }
 // Keep keyboard focus inside the open menu until an action is chosen or dismissed.
 if(e.key==='Tab'){e.preventDefault();items[(index+(e.shiftKey?-1:1)+items.length)%items.length].focus({preventScroll:true});}
});
listenRoot('keydown',e=>{
 if(state.route!=='pitch'||state.pitchMode!=='match'||!['ContextMenu','F10'].includes(e.key))return;
 if(e.key==='F10'&&!e.shiftKey)return;
 const spot=e.target.closest('[data-pitch-slot]');
 if(!spot||!activeLineup().assignments[spot.dataset.pitchSlot])return;
 e.preventDefault();const rect=spot.getBoundingClientRect();openPitchContext(spot.dataset.pitchSlot,rect.left,rect.bottom+6);
});
let draggedRosterId=null;
listenRoot('dragstart',e=>{const bench=e.target.closest('[data-pitch-player]');if(bench){e.dataTransfer.setData('text/plain',bench.dataset.pitchPlayer);e.dataTransfer.effectAllowed='move';return;}
 const row=e.target.closest('[data-drag-player]');if(!row)return;draggedRosterId=row.dataset.dragPlayer;e.dataTransfer.effectAllowed='move';row.classList.add('dragging');});
listenRoot('dragover',e=>{if(e.target.closest('[data-pitch-slot]')){e.preventDefault();e.dataTransfer.dropEffect='move';return;}if(e.target.closest('[data-drag-player]')&&draggedRosterId)e.preventDefault();});
listenRoot('drop',async e=>{const pitchTarget=e.target.closest('[data-pitch-slot]');if(pitchTarget){e.preventDefault();const playerId=e.matchStudioDragValue;if(playerId){try{await savePitchPlan(placePlayer(activeLineup(),activeRoster(),playerId,Number(pitchTarget.dataset.pitchSlot)));state.pitchSelectedId=null;}catch(error){toast(error.message,true);}}return;}
 const target=e.target.closest('[data-drag-player]');if(!target||!e.matchStudioDraggedRosterId)return;e.preventDefault();const dragged=e.matchStudioDraggedRosterId;draggedRosterId=null;const old=activeRoster();const index=old.entries.findIndex(x=>x.playerId===target.dataset.dragPlayer);if(index<0)return;const updated=movePlayer(old,dragged,index);await putRecord('rosters',{id:state.currentId,...updated});await refresh();render();});
listenRoot('dragend',()=>{draggedRosterId=null;document.querySelectorAll('.dragging').forEach(el=>el.classList.remove('dragging'));});
listenRoot('input',e=>{
 const element=e.target;
 if(element.id==='roster-search'){
  state.rosterQuery=element.value;
  if(!patchSearchRegion(root,rosterPicker(),'.roster-list'))render();
  return;
 }
 if(element.id==='team-search'){
  state.teamQuery=element.value;
  if(!patchSearchRegion(root,teamRosterPage(),'.v22-team-members'))render();
  return;
 }
 if(element.id==='player-search'){
  state.query=element.value;
  const markup=players();
  if(!patchSearchRegion(root,markup,'.list-layout > .panel'))render();
  else{
   const template=document.createElement('template');template.innerHTML=markup;
   const counter=template.content.querySelector('.toolbar .stat-chip');
   const current=root.querySelector('.toolbar .stat-chip');
   if(current&&counter)current.textContent=counter.textContent;
   decorateAvatars();
  }
  return;
 }
 if(element.matches('[data-override]')&&element.type==='range'){
  const out=element.parentElement.querySelector('output');
  if(out)out.textContent=Math.round(Number(element.value)*100)+'%';
 }
});
listenRoot('change',async e=>{const el=e.target;if(el.id==='club-switch'||el.id==='club-switch-mobile'){try{await chooseClub(el.value)}catch(err){toast(err.message,true)}return;}if(el.id==='weekly-range'){state.board.mode=el.value==='all'?'all':'week';state.board.selected=null;render();return;}if(el.id==='weekly-date'){const week=mondayOf(el.value);if(week){state.board.week=week;state.board.selected=null;render();}return;}if(el.id==='gameSize'){const k=document.getElementById('goalkeeperMode'),lay=document.getElementById('pitchLayoutId');if(k&&Number(el.value)<=4)k.value='none';if(lay&&el.value!=='8'&&lay.value==='half-pitch-crosswise')lay.value='small';return;}if(el.id==='pitch-player-shortcut'){state.pitchSelectedId=el.value||null;render();return;}if(el.id==='pitch-role'){try{await savePitchPlan(setPlayerPitchRole(activeLineup(),activeRoster(),state.pitchSelectedId,el.value));}catch(error){toast(error.message,true);}return;}if(el.id==='pitch-formation'){
 try{const slots=getPitchPresets()[el.value];if(activePolicy()&&slots?.length!==activePolicy().starterLimit)throw Error(`Bu maçta ilk ${activePolicy().starterLimit} kullanılmalı.`);state.pitchSelectedId=null;await savePitchPlan(changePitchPreset(activeLineup(),el.value));}catch(error){toast(error.message,true);}return;
 }if(el.id==='team-group-select'){
  state.teamGroupId=el.value;state.teamRoleSelected='GK';state.teamQuery='';
  state.teamPitchPrefs=storedTeamPitchPrefs(el.value);render();return;
 }if(['team-pitch-formation','team-formation-select','team-pitch-depth','team-depth-factor','team-depth-select'].includes(el.id)){
  try{
   const changed=el.id.includes('formation')?{formation:el.value}:{depthFactor:Number(el.value)};
   await persistTeamPitchPrefs({...state.teamPitchPrefs,...changed});
  }catch(error){toast(error.message,true);}return;
 }if(el.dataset.teamRolePlayer){try{await persistTeamDepth(setTeamPlayerRole(activeDepth(),el.dataset.teamRolePlayer,state.teamRoleSelected,el.checked,state.data.players));}catch(error){toast(error.message,true);}return;}try{
 if(el.dataset.playerId){const player=state.data.players.find(p=>p.id===el.dataset.playerId);if(!player)return;const old=activeRoster();if(activeMatch()?.state==='archived')throw Error('Arşivli maç düzenlenemez.');const r=el.checked?proposeRosterAddition(old,player,activePolicy()):removePlayer(old,player.id);const prev=el.checked?activeLineup():removeFromPitch(activeLineup(),player.id);const plan=autofillStartingLineup(prev,r,activePolicy());await transact(['rosters','settings'],'readwrite',tx=>{tx.objectStore('rosters').put({id:state.currentId,...r});tx.objectStore('settings').put({id:`lineup:${state.currentId}`,value:plan});});await refresh();render();return;}
 if(el.dataset.override){const value=el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value;await persistDraft({overrides:{[el.dataset.override]:value}});return;}
 if(el.id==='club-logo'&&el.files[0]){const f=el.files[0];if(!['image/png','image/webp'].includes(f.type))throw Error('Şeffaf PNG veya WEBP yükleyin.');const blob=await prepareLogo(f),id=await saveAsset(blob);await putRecord('settings',{id:'clubLogo',value:id});await refresh();render();toast('Kulüp logosu cihazda saklandı.');return;}
 if(el.id==='poster-bg-file'&&el.files[0]){const blob=await preparePhoto(el.files[0],1920);const id=await saveAsset(blob);await persistDraft({overrides:{backgroundAssetId:id}});toast('Arka plan görseli uygulandı.');return;}
 if(el.id==='csv-file'&&el.files[0]){const groupId=document.getElementById('csv-group').value;const res=parsePlayersCsv(await el.files[0].text(),groupId);state.csvPending=res;const review=document.getElementById('csv-review');review.textContent=`${res.rows.length} geçerli kayıt. ${res.errors.length} hatalı satır.`+(res.errors.length?' Hatalar: '+res.errors.map(x=>`${x.row}. satır: ${x.message}`).join(' | '):'');document.getElementById('csv-confirm').disabled=!res.rows.length||!!res.errors.length;return;}
 if(el.id==='weekly-import-file'&&el.files[0]){
 const file=el.files[0];el.value='';invalidateFixtureImport();render();
 const parsed=await fixtureImports.read(file);
 state.fixtureImport=parsed;render();
 toast(parsed.errors.length?'Program hataları var; hiçbir kayıt eklenmedi.':'Program okundu, kontrol edip onaylayın.',!!parsed.errors.length);
 return;
 }
 if(el.id==='backup-file'&&el.files[0]){
 const file=el.files[0];el.value='';if(file.size>105*1024*1024)throw Error('Yedek dosyası 105 MB sınırını aşıyor.');
 let password=null,report=await inspectBackup(file);
 if(report.needsPassword){password=prompt('Bu yedek şifrelenmiş. Yedek parolasını girin:');if(password===null)return;report=await inspectBackup(file,password);}
 if(!report.valid)throw Error('Yedek geçersiz: '+report.warnings.join(' '));
 if(report.clubId&&report.clubId!==state.club.id&&!confirm(`Bu yedek farklı kulüp kimliğine (${report.club||'bilinmiyor'}) ait. Verileri ${state.club.name} kulübüne aktarmak istediğinizi onaylıyor musunuz?`))return;
 if(report.integrityWarnings?.length){if(!confirm(`Yedekte ${report.integrityWarnings.length} eski/tutarsız bağlantı tespit edildi: ${report.integrityWarnings.slice(0,3).join(' | ')}. Kayıtların eksiksiz işlenmesi garanti edilemez. Devam edilsin mi?`))return;}
 const older=await readRestorePoint(state.club.id);if(older&&!confirm('Bu kulüp için önceki yerel kurtarma noktası bulunuyor. Yeni geri yükleme, eski kurtarma noktasını değiştirecek. Önceki noktayı kaybetmeyi kabul ediyor musunuz?'))return;
 if(!confirm(`${report.encrypted?'ŞİFRELİ':'ŞİFRESİZ'} YEDEK ÖNİZLEME: ${report.counts.players} oyuncu, ${report.counts.groups} grup, ${report.counts.matches} maç, ${report.counts.assets} görsel. ${state.club.name} kulübündeki MEVCUT TÜM VERİLER değişecek. Önce mevcut kulübün yedeğini aldınız mı?`))return;
 invalidateFixtureImport();const outcome=await restoreBackup(file,true,password);matchDrafts.clearClub(state.club.id);state.integrityAudit=null;state.currentId=null;state.sessionMatch=null;state.liveSession=null;state.liveEvents=[];el.value='';await refresh();selectRoute('dashboard');toast('Yedek geri yüklendi. Önceki veriler için 7 günlük yerel geri alma noktası hazır; kayıtları kontrol edin.');return;}
 }catch(err){console.error(err);toast(err.message||'İşlem başarısız.',true)}});
listenRoot('submit',async e=>{
 if(e.target.id==='pitch-number-form'||e.target.id==='pitch-role-form'){const action=e.target.id==='pitch-number-form'?'pitch-number-save':'pitch-role-save';await clickAction(action,e.target);return;}

 if(e.target.id==='live-rules-form'){
  e.preventDefault();try{
   if(!activeMatch()||activeMatch()?.state==='archived')throw Error('Önce aktif maç seçin.');
   const f=new FormData(e.target),periods=String(f.get('periods')).split(',').map(s=>Number(s.trim()));
   const rules={periods,substitutionMode:String(f.get('substitutionMode')),maximumNamedSubstitutes:Number(f.get('maximumNamedSubstitutes')),source:'coachConfigured'};
   const starters=[...new Set(Object.values(activeLineup().assignments||{}).filter(Boolean))];
   const playerIds=[...new Set(activeRoster().entries.map(v=>v.playerId))];
   const requiredStarters=activePolicy()?.starterLimit;
   if(!starters.length||Number.isInteger(requiredStarters)&&starters.length!==requiredStarters)throw Error(`Canlı maçı hazırlamadan önce ${requiredStarters||'gerekli'} kişilik ilk kadroyu eksiksiz oluşturun.`);
   const plan=activeLineup();
   const kickoffPitchAssignments=Object.fromEntries(Object.entries(plan.assignments||{}).filter(([,id])=>starters.includes(id)));
   await createMatchSession({matchId:activeMatch().id,rules,initialPlayerIds:playerIds,currentOnFieldIds:starters,kickoffPitchAssignments,kickoffPreset:plan.preset});await loadLiveClock();toast('Canlı maç oturumu hazır. Saati ayrıca başlatın.');
  }catch(error){toast(error.message,true);}return;
 }
 if(e.target.id==='live-substitution-form'){
  e.preventDefault();try{
   if(!e.target.reportValidity()||!state.liveSession)throw Error('Canlı maç oturumu ve oyuncular seçilmelidir.');
   const f=new FormData(e.target),outPlayerId=String(f.get('outPlayerId')||''),inPlayerId=String(f.get('inPlayerId')||'');
   const outName=state.data.players.find(p=>p.id===outPlayerId)?.fullName||'Çıkan oyuncu';
   const inName=state.data.players.find(p=>p.id===inPlayerId)?.fullName||'Giren oyuncu';
   if(!confirm(outName+' oyundan çıksın, '+inName+' oyuna girsin mi? Bu işlem maç geçmişine kaydedilecek.'))return;
   const c=state.club?.id,matchId=state.currentId;
   const outcome=await commitSubstitution({matchId,outPlayerId,inPlayerId,competitionReturnApproved:f.has('competitionReturnApproved'),expectedRevision:state.liveSession.revision,idempotencyKey:'sub:'+crypto.randomUUID()});
   if(state.club?.id!==c||state.currentId!==matchId)return;
   if(!outcome.duplicate)notifyLiveUpdate();
   await loadLiveClock();toast(outcome.duplicate?'Değişiklik zaten kaydedilmiş.':'Oyuncu değişikliği kaydedildi.');
  }catch(error){toast(error.message,true);await loadLiveClock();}return;
 }
 if(e.target.id==='live-event-form'||e.target.id==='live-event-correction-form'){
  e.preventDefault();try{
   if(!state.liveSession||!e.target.reportValidity())throw Error('Etkin maç oturumu veya form eksik.');
   const f=new FormData(e.target),correcting=e.target.id==='live-event-correction-form',type=String(f.get('type')||'');
   const entry={playerId:String(f.get('playerId')||''),assistPlayerId:String(f.get('assistPlayerId')||''),goalEventId:String(f.get('goalEventId')||''),note:String(f.get('note')||'')};
   const payload=correcting?{targetEventId:String(f.get('targetEventId')||''),reason:String(f.get('reason')||''),void:f.has('void'),replacement:{type,payload:entry}}:entry;
   if(!confirm(correcting?'Bu düzeltme geçmişe yeni bir kayıt olarak eklenecek. Devam edilsin mi?':'Maç olayını kalıcı geçmişe kaydetmek istiyor musunuz?'))return;
   const oldClub=state.club?.id,oldMatch=state.currentId;
   const outcome=await commitSportingEvent({matchId:oldMatch,type:correcting?'EVENT_CORRECTION':type,payload,expectedRevision:state.liveSession.revision,idempotencyKey:'sport:'+crypto.randomUUID()});
   if(state.club?.id!==oldClub||state.currentId!==oldMatch)return;
   if(!outcome.duplicate)notifyLiveUpdate();await loadLiveClock();toast(correcting?'Düzeltme geçmişe kaydedildi.':'Maç olayı kaydedildi.');
  }catch(error){toast(error.message,true);await loadLiveClock();}return;
 }
 if(e.target.id==='live-correction-form'){
  e.preventDefault();try{
   if(!e.target.reportValidity()||!state.liveSession)return;
   const minute=Number(e.target.querySelector('#live-correction-minutes').value),second=Number(e.target.querySelector('#live-correction-seconds').value),reason=e.target.querySelector('#live-correction-reason').value;
   if(!Number.isInteger(minute)||!Number.isInteger(second)||minute<0||second<0||second>59)throw Error('Dakika ve saniye geçersiz.');
   if(!confirm('Maç saati düzeltmesi olay geçmişine kaydedilecek. Onaylıyor musunuz?'))return;
   await commitClockAction({matchId:state.currentId,action:'CORRECT',expectedRevision:state.liveSession.revision,idempotencyKey:'clock:'+crypto.randomUUID(),correctionMs:(minute*60+second)*1000,reason});
   notifyLiveUpdate();await loadLiveClock();toast('Maç saati düzeltildi ve kaydedildi.');
  }catch(error){toast(error.message,true);}return;
 }
 if(e.target.id==='club-create-form'){e.preventDefault();try{const form=new FormData(e.target);const club={id:crypto.randomUUID().replaceAll('-',''),name:validClubName(form.get('clubName')),accent:safeColor(form.get('accent')),createdAt:new Date().toISOString()};await saveClub(club);state.clubs=await listClubs();await chooseClub(club.id);}catch(error){toast(error.message,true)}return;}if(e.target.id==='club-settings-form'){e.preventDefault();try{const data=new FormData(e.target);state.club={...state.club,name:validClubName(data.get('clubName')),accent:safeColor(data.get('accent'))};await saveClub(state.club);state.clubs=await listClubs();render();toast('Kulüp kimliği güncellendi.')}catch(error){toast(error.message,true)}return;}if(e.target.id==='group-form'){e.preventDefault();const name=String(new FormData(e.target).get('name')||'').trim();if(!name)return;if(state.data.groups.some(x=>x.name.toLocaleLowerCase('tr')===name.toLocaleLowerCase('tr'))){toast('Bu grup zaten kayıtlı.',true);return}await putRecord('groups',{id:uid(),name,seasonLabel:(()=>{const d=new Date();const start=d.getMonth()>=6?d.getFullYear():d.getFullYear()-1;return `${start}-${start+1}`})(),isActive:true,sortOrder:state.data.groups.length});await refresh();render();toast('Grup eklendi.')}});
const clubSlug=()=>safeFilenamePart(state.club?.name||'KULUP',40);
async function chooseClub(id){invalidateFixtureImport();rememberMatchDraft();workspaceSnapshot.invalidate();const c=state.clubs.find(x=>x.id===id);if(!c)throw Error('Kulüp bulunamadı.');setClubDatabase(c.id);state.club=c;invalidateSeasonAnalytics(true);wakeLock.set(false);setBackupClub(c);setActiveId(c.id);state.legacy=null;state.route='dashboard';state.data={players:[],groups:[],matches:[],rosters:[],posterDrafts:[],settings:[],assets:[]};state.currentId=null;state.sessionMatch=null;state.liveSession=null;state.liveEvents=[];state.liveLoading=false;liveLoadSequence++;state.filterGroup='all';state.query='';state.modal=null;state.rosterPoolGroups=[];state.board.selected=null;state.teamGroupId=null;state.integrityAudit=null;await openDatabase();await resumePlayerErasures();await refresh();render();window.scrollTo(0,0);}
function clubWelcome(){return `<div class="ms-onboarding bd-onboarding"><div class="bd-onboarding-layout"><div class="bd-onboarding-editorial"><img src="./assets/match-studio-brand-preview.png" class="brand-feature-lockup" alt="Match Studio altın futbol taktik arması"><div class="bd-onboarding-eyebrow"><span class="onair-dot"></span> MATCH STUDIO / V2.6.8-F.17</div><h1>KULÜBÜNÜZ.<br><em>SAHNE SİZİN.</em></h1><p>Maç günü hazırlığı, kadro ve profesyonel yayın grafikleri. Kulüp kimliğinizi belirleyin, saha operasyonuna başlayın.</p><div class="bd-onboarding-features"><span>${I('shield')} Her kulüp için ayrı kayıtlar</span><span>${I('studio')} Yayına hazır maç tasarımları</span><span>${I('users')} Tek yerden kadro yönetimi</span></div><div class="bd-onboarding-footer">MAÇ GÖRSELLERİ / KULÜP YÖNETİMİ</div></div><div class="ms-onboarding-card bd-onboarding-form"><div class="eyebrow">01 / KULÜP KİMLİĞİ</div><h2>İlk kulübünüzü oluşturun</h2><p>Her kulüp ayrı yerel veritabanında saklanır. Başlangıç paketinde gerçek sporcu bilgisi yoktur.</p><form id="club-create-form" class="ms-form"><label>Kulüp adı<input name="clubName" maxlength="80" minlength="2" required placeholder="Örn. Atabey Spor Kulübü"></label><label>Kurumsal vurgu rengi<input name="accent" type="color" value="#4669D9"></label><button class="btn btn-primary" type="submit">KULÜP OLUŞTUR VE BAŞLA ${I('arrow')}</button></form><div class="bd-migration-note">${I('shield')} Eski Darıca Gücü V2.4 verileri korunur. Önce kulübü oluşturun; ardından Arşiv & Ayarlar bölümünden eski JSON yedeğinizi aktarabilirsiniz.</div></div></div></div>`;}
function clubQuickSwitcher(position="desktop"){const selectId=position==="mobile"?"club-switch-mobile":"club-switch";return `<div class="ms-quick"><label for="${selectId}">Aktif kulüp</label><select id="${selectId}" aria-label="Kulüp değiştir">${state.clubs.map(c=>`<option value="${esc(c.id)}" ${state.club?.id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><small>Her kulübün verileri ayrı saklanır</small></div>`;}
function clubManager(){return `<section class="ms-club-manager"><h2>Kulüp Yönetimi</h2><p class="muted small">Mevcut kulüp: ${esc(state.club?.name)} · Veriler bu cihaza özeldir ve diğer kulüplerin kayıtlarına karışmaz.</p><form id="club-settings-form" class="ms-form"><label>Kulüp adı<input name="clubName" required minlength="2" maxlength="80" value="${esc(state.club?.name)}"></label><label>Kurumsal vurgu rengi<input type="color" name="accent" value="${esc(safeColor(state.club?.accent))}"></label><button class="btn btn-primary" type="submit">Kulüp kimliğini kaydet</button></form><details class="ms-manager-details"><summary>Yeni kulüp oluştur</summary><form id="club-create-form" class="ms-form"><label>Yeni kulüp adı<input name="clubName" minlength="2" maxlength="80" required></label><label>Renk<input name="accent" type="color" value="#4669D9"></label><button class="btn btn-ghost" type="submit">Yeni bağımsız kulüp oluştur</button></form></details><div class="ms-import-panel"><h3>Eski V2.4 kayıtlarını koruyarak taşı</h3><p class="muted small">Eski Darıca Gücü kayıtları yalnızca aynı tarayıcı profili ve aynı site adresi üzerinden taşınabilir. Farklı bir adres kullanıyorsanız eski sürümden JSON yedeği indirip aşağıdaki geri yükleme seçeneğini kullanın. Önce eski kayıtlarınızın yedeğini alın. Kayıtların taşınacağı kulüp boş olmalıdır. Eski kayıtlar değiştirilmez.</p>${btn('Eski kayıtları kontrol et','legacy-preview','btn-ghost')}${state.legacy?`<p class="muted small">${esc(state.legacy.message||(state.legacy.found?`${state.legacy.counts.players||0} oyuncu, ${state.legacy.counts.matches||0} maç, ${state.legacy.counts.groups||0} grup bulundu.`:'Veri bulunamadı.'))}</p>${state.legacy.found?btn('Eski verileri bu kulübe kopyala','legacy-import','btn-primary'):''}`:''}</div><div class="ms-group-tools"><h3>Gruplar</h3>${state.data.groups.map(g=>`<div class="ms-group-row"><span>${esc(g.name)}</span>${btn('Grubu Sil','delete-group','btn-danger btn-small',`data-id="${esc(g.id)}"`)}</div>`).join('')||'<p class="muted">Henüz grup oluşturulmadı.</p>'}</div><section class="ms-danger-zone" aria-labelledby="danger-zone-title"><h3 id="danger-zone-title">Kulüp silme — geri alınamaz</h3><p class="footnote">Silmeden önce şifreli yedeği indirip dosyayı cihaz dışında kontrol edin. Yanlış kulüp silinmesini önlemek için kulüp adını birebir girmeniz gerekir. Bu işlem yalnızca aktif kulübü etkiler, diğer kulüpler korunur. Açık diğer sekmeler silme işlemini engelleyebilir.</p>${btn('Bu kulübü kalıcı sil','club-delete','btn-danger')}</section></section>`;}

async function init(){try{
  const pending=await retryPendingDeletions();if(pending.some(x=>!x.ok))console.warn('Bekleyen kulüp silme işlemi var. Diğer sekmelerin kapatılması gerekebilir.',pending.filter(x=>!x.ok).map(x=>x.id));state.clubs=await listClubs();const active=getActiveId();const selected=state.clubs.find(x=>x.id===active)||state.clubs[0];
  if(selected)await chooseClub(selected.id);else render();
  createInstallPrompt({storage:(()=>{try{return window.localStorage}catch{return null}})(),notify:message=>toast(message)});
  setupPwaUpdates({isBusy:()=>uiBusy,onStatus:updateSWStatus,notify:message=>toast(message,true)});
 }catch(e){root.innerHTML=`<div class="boot" style="padding:20px">Uygulama başlatılamadı<span>${esc(e.message)}<br>localhost veya HTTPS adresiyle açın.</span></div>`}}

init();

Object.assign(exports,{});
