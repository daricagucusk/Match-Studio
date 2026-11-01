
const {STORES,listRecords,transact,clubContext,assertContext,withExclusiveClubOperation}=require("src/storage/db.js");
const {normalizeGameFormat,normalizePitchLayout}=require("src/domain/match-format.js");
const {decodeBackupBlob,encryptBackupBlob}=require('src/storage/secure-backup.js');
const {checkSnapshotIntegrity}=require('src/storage/data-safety.js');
const {saveRestorePoint,captureCurrentStores,assertNoErasedPlayers}=require('src/storage/recovery.js');
let selectedClub=null;const setBackupClub=club=>{selectedClub=club;};
async function assertBackupTarget(data,clubId,runTransaction){
 if(data?.club?.id===clubId)return;
 const current=await captureCurrentStores(runTransaction);
 if(STORES.some(name=>current[name].length))throw Error('Bu yedek farklı bir kulübe ait veya kulüp kimliği eksik. Yalnızca boş bir kulübe aktarılabilir; mevcut kayıtlar değiştirilmedi.');
}

const serial=async blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)});
async function exportBackup(){const ctx=clubContext(),club=selectedClub?{id:selectedClub.id,name:selectedClub.name}:null;const stores=await captureCurrentStores();stores.assets=await Promise.all(stores.assets.map(async a=>({...a,blob:await serial(a.blob)})));assertContext(ctx);const body={application:'MatchStudioUniversal',schemaVersion:3,club,exportedAt:new Date().toISOString(),stores};return new Blob([JSON.stringify(body)],{type:'application/json'});}
function normalizeBackupStores(data){
 const isLegacy=[1,2].includes(data?.schemaVersion);
 const source=data?.stores&&typeof data.stores==='object'?data.stores:{};
 const stores={...source};
 // Old v1/v2 archives predate live match recording; no silent conversion of old games.
 if(isLegacy){for(const name of ['matchSessions','matchEvents'])if(stores[name]===undefined)stores[name]=[];}
 return stores;
}
function validateBackup(data){
 const errors=[];
 if(!['DaricaGucuMatchStudio','MatchStudioUniversal'].includes(data?.application)||![1,2,3].includes(data?.schemaVersion))errors.push('Bu dosya uyumlu Match Studio yedeği değil.');
 const stores=normalizeBackupStores(data);
 for(const name of STORES){if(!Array.isArray(stores[name]))errors.push(`${name} bölümü eksik.`);else if(stores[name].some(row=>!row||typeof row.id!=='string'||!row.id))errors.push(`${name} kayıt kimliği geçersiz.`);}
 if(errors.length)return errors;
 for(const name of STORES){const ids=new Set();for(const row of stores[name]){
  if(!/^[a-zA-Z0-9_.:-]{1,160}$/.test(row.id))errors.push(`${name}: kayıt kimliği güvenli değil.`);
  if(ids.has(row.id))errors.push(`${name}: tekrar eden kayıt kimliği.`);ids.add(row.id);
 }}
 if(errors.length)return errors;
 const map=new Map(stores.players.map(p=>[p.id,p])),groupIds=new Set(stores.groups.map(g=>g.id)),ids=new Set(stores.matches.map(m=>m.id)),aids=new Set(stores.assets.map(a=>a.id));
 for(const p of stores.players){if((p.groupIds||[]).some(id=>!groupIds.has(id)))errors.push(`Oyuncu grubuna ulaşılamıyor: ${p.fullName}`);if(p.photoAssetId&&!aids.has(p.photoAssetId))errors.push('Eksik fotoğraf varlığı.');}
 for(const m of stores.matches){if(!groupIds.has(m.groupId))errors.push('Maç grubu bulunamadı.');if(m.gameFormat||m.pitchLayout){try{if(!m.gameFormat)throw Error('Saha yerleşimi için format gerekli.');const fmt=normalizeGameFormat(m.gameFormat);normalizePitchLayout(m.pitchLayout||{id:'standard'},fmt);}catch(error){errors.push('Maç formatı/yerleşimi geçersiz: '+error.message);}}}
 for(const r of stores.rosters){if(!ids.has(r.matchId))errors.push('Kadro maçı bulunamadı.');if(r.id!==r.matchId)errors.push('Kadro kimliği ile maç bağlantısı uyuşmuyor.');if((r.entries||[]).some(e=>!e.nameSnapshot||!e.playerId))errors.push('Kadro snapshot bilgisi eksik.');}
 for(const d of stores.posterDrafts)if(!ids.has(d.matchId))errors.push('Afiş maçı bulunamadı.');
 for(const a of stores.assets)if(typeof a.blob!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(a.blob)||a.blob.length>20e6)errors.push('Geçersiz veya büyük fotoğraf.');
 // Store-level and foreign-key invariants are shared by import validation and audit.
 if(!errors.length&&data.schemaVersion===3)errors.push(...checkSnapshotIntegrity(stores));
 return [...new Set(errors)];
}
async function inspectBackup(file,password){
 try{
  const decoded=await decodeBackupBlob(file,password);
  if(decoded.needsPassword)return {valid:false,needsPassword:true,encrypted:true,counts:{},warnings:[]};
  const data=decoded.payload,warnings=validateBackup(data);
  if(!warnings.length&&selectedClub?.id)await assertBackupTarget(data,selectedClub.id);
  // Report legacy orphaned references separately; do not silently change them.
  const integrityWarnings=warnings.length?[]:checkSnapshotIntegrity(normalizeBackupStores(data));
  if(!warnings.length&&selectedClub?.id)await assertNoErasedPlayers(selectedClub.id,normalizeBackupStores(data));
  return {valid:!warnings.length,encrypted:decoded.encrypted,counts:Object.fromEntries(STORES.map(s=>[s,data?.stores?.[s]?.length||0])),warnings,integrityWarnings,club:data?.club?.name||null,clubId:data?.club?.id||null,schemaVersion:data?.schemaVersion};
 }catch(e){return {valid:false,counts:{},warnings:[e.message]};}
}
async function exportEncryptedBackup(password){return encryptBackupBlob(await exportBackup(),password);}

const dataURIToBlob=url=>{const [meta,s]=url.split(',');const bytes=atob(s);const out=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)out[i]=bytes.charCodeAt(i);return new Blob([out],{type:meta.match(/^data:([^;]+)/)?.[1]||'image/jpeg'});};
async function restoreBackup(file,confirmed,password){
 if(!confirmed)throw Error('Geri yükleme için onay verilmeli.');
 const ctx=clubContext();if(selectedClub?.id!==ctx.id)throw Error('Aktif kulüp kimliği uyuşmuyor.');
 const decoded=await decodeBackupBlob(file,password);if(decoded.needsPassword)throw Error('Şifreli yedek parolası gerekli.');
 const data=decoded.payload,issues=validateBackup(data);if(issues.length)throw Error(issues.slice(0,3).join(' '));
 const incoming=normalizeBackupStores(data),converted={...incoming,assets:incoming.assets.map(a=>({...a,blob:dataURIToBlob(a.blob)}))};
 assertContext(ctx);
 return withExclusiveClubOperation(async runTransaction=>{
  await assertBackupTarget(data,ctx.id,runTransaction);
  // Check after decoding AND after acquiring the same lock used by erasure.
  await assertNoErasedPlayers(ctx.id,converted);
  const recovery=await saveRestorePoint(ctx.id,runTransaction);
  await runTransaction(STORES,'readwrite',tx=>{for(const s of STORES){const store=tx.objectStore(s);store.clear();for(const row of converted[s])store.put(row);}});
  return {recovery,counts:Object.fromEntries(STORES.map(s=>[s,converted[s].length]))};
 },ctx);
}

Object.assign(exports,{setBackupClub,exportBackup,exportEncryptedBackup,validateBackup,normalizeBackupStores,inspectBackup,restoreBackup});
