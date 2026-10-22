const {STORES,openDatabase}=require('src/storage/db.js');
const {checkSnapshotIntegrity}=require('src/storage/data-safety.js');
const BUDGET_MS=5000;
async function auditActiveClub(){const start=performance.now(),db=await openDatabase();
 // Asset blobs are not loaded; keys suffice to verify references.
 const stores=await new Promise((resolve,reject)=>{const tx=db.transaction(STORES,'readonly'),data={};
 for(const name of STORES){const req=name==='assets'?tx.objectStore(name).getAllKeys():tx.objectStore(name).getAll();req.onsuccess=()=>{data[name]=name==='assets'?req.result.map(id=>({id})):req.result;};}
 tx.oncomplete=()=>resolve(data);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });
 const durationMs=Math.round(performance.now()-start),counts=Object.fromEntries(STORES.map(s=>[s,stores[s].length]));
 const issues=checkSnapshotIntegrity(stores),total=Object.values(counts).reduce((a,b)=>a+b,0);
 return {counts,total,issues,issueCount:issues.length,durationMs,overBudget:durationMs>BUDGET_MS,measuredOnDevice:true,checkedAt:new Date().toISOString()};
}
Object.assign(exports,{auditActiveClub,BUDGET_MS});
