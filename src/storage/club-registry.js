// Match Studio universal club directory: metadata only; no athlete data.
const REG_NAME='matchstudio-club-registry-v1';const REG_STORE='clubs';const LAST_KEY='matchstudio-active-club-v1';
let registryDb=null;
function openRegistry(){if(registryDb)return Promise.resolve(registryDb);return new Promise((resolve,reject)=>{const r=indexedDB.open(REG_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore(REG_STORE,{keyPath:'id'});r.onsuccess=()=>{registryDb=r.result;resolve(registryDb)};r.onerror=()=>reject(r.error);});}
async function listClubs(){const db=await openRegistry();return new Promise((resolve,reject)=>{const r=db.transaction(REG_STORE).objectStore(REG_STORE).getAll();r.onsuccess=()=>resolve(r.result.filter(c=>c.status!=='deleting').sort((a,b)=>a.createdAt.localeCompare(b.createdAt)));r.onerror=()=>reject(r.error)});}
async function saveClub(club){const db=await openRegistry();return new Promise((resolve,reject)=>{const tx=db.transaction(REG_STORE,'readwrite');tx.objectStore(REG_STORE).put(club);tx.oncomplete=()=>resolve(club);tx.onerror=()=>reject(tx.error);});}
async function getRegistryClub(id){const db=await openRegistry();return new Promise((resolve,reject)=>{const q=db.transaction(REG_STORE).objectStore(REG_STORE).get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error);});}
async function removeRegistryClub(id){const db=await openRegistry();return new Promise((resolve,reject)=>{const tx=db.transaction(REG_STORE,'readwrite');tx.objectStore(REG_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
async function listDeletingClubs(){const db=await openRegistry();return new Promise((resolve,reject)=>{const q=db.transaction(REG_STORE).objectStore(REG_STORE).getAll();q.onsuccess=()=>resolve(q.result.filter(c=>c.status==='deleting'));q.onerror=()=>reject(q.error);});}
const getActiveId=()=>localStorage.getItem(LAST_KEY);
const clearActiveId=()=>localStorage.removeItem(LAST_KEY);
const setActiveId=id=>localStorage.setItem(LAST_KEY,id);
function validClubName(name){name=String(name||'').trim();if(name.length<2||name.length>80)throw Error('Kulüp adı 2–80 karakter olmalı.');return name;}
function safeColor(hex){return /^#[0-9a-fA-F]{6}$/.test(String(hex))?hex:'#176B46';}
// Existing database is read only; NEVER clear, upgrade or mutate it here.
async function inspectLegacy(){
 if(typeof indexedDB.databases!=='function')return {found:false,message:'Bu tarayıcı eski veritabanını güvenli biçimde listeleyemiyor. Eski uygulamadan JSON yedek alın.'};
 const names=await indexedDB.databases();if(!names.some(x=>x.name==='dg-match-studio'))return {found:false,message:'Bu tarayıcı profilinde eski Darıca Gücü veritabanı bulunmadı.'};
 return new Promise((resolve,reject)=>{const req=indexedDB.open('dg-match-studio');req.onsuccess=()=>{const db=req.result;const wanted=['players','groups','matches','rosters','posterDrafts','assets','settings'];const names=wanted.filter(s=>db.objectStoreNames.contains(s));if(!names.length){db.close();resolve({found:false,message:'Eski veri kayıt tabloları bulunamadı.'});return;}const tx=db.transaction(names,'readonly');const result={found:true,stores:{},counts:{}};for(const name of names){const q=tx.objectStore(name).getAll();q.onsuccess=()=>{result.stores[name]=q.result;result.counts[name]=q.result.length;};}tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{db.close();reject(tx.error)};};req.onerror=()=>reject(req.error);});
}
Object.assign(exports,{listClubs,saveClub,getRegistryClub,removeRegistryClub,listDeletingClubs,getActiveId,setActiveId,clearActiveId,validClubName,safeColor,inspectLegacy});
