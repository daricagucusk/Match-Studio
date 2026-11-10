'use strict';
// Safeguarding (çocuk koruma) kaydı: olay kaydı, zaman damgası, salt-okunur denetim izi.
// Kişisel veri minimizasyonu: yalnızca gerekli alanlar; serbest metin 400 karakterle sınırlı.
const CATEGORIES=['safeguarding','medical','discipline','facility','other'];
const SEVERITIES=['low','medium','high'];
const STATUSES=['open','reviewing','closed'];
const LABELS={safeguarding:'Koruma',medical:'Sağlık',discipline:'Disiplin',facility:'Tesis',other:'Diğer',low:'Düşük',medium:'Orta',high:'Yüksek',open:'Açık',reviewing:'İncelemede',closed:'Kapandı'};

function clean(value,max=400){return String(value??'').replace(/\s+/g,' ').trim().slice(0,max);}
function nowIso(){return new Date().toISOString();}

function createRecord({id,date,playerId='',category='safeguarding',severity='medium',summary='',action='',reporter=''}={},at=nowIso()){
 const issues=[];
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||'')))issues.push('Olay tarihi geçersiz.');
 if(!CATEGORIES.includes(category))issues.push('Olay kategorisi geçersiz.');
 if(!SEVERITIES.includes(severity))issues.push('Önem derecesi geçersiz.');
 if(clean(summary).length<10)issues.push('Olay özeti en az 10 karakter olmalı.');
 if(issues.length)throw Error(issues.join(' '));
 return {id:String(id||`sg:${date}:${Math.random().toString(36).slice(2,8)}`),date,playerId:String(playerId||''),category,severity,summary:clean(summary),action:clean(action),reporter:clean(reporter,80),status:'open',createdAt:at,updatedAt:at,audit:[{at,event:'created'}]};
}

function updateStatus(record,status,note='',at=nowIso()){
 if(!record)throw Error('Kayıt bulunamadı.');
 if(!STATUSES.includes(status))throw Error('Durum geçersiz.');
 if(record.status==='closed')throw Error('Kapanmış kayıt yeniden açılamaz; yeni kayıt oluşturun.');
 return {...record,status,updatedAt:at,audit:[...(record.audit||[]),{at,event:'status:'+status,note:clean(note,200)}]};
}

function addNote(record,note,at=nowIso()){
 if(!record)throw Error('Kayıt bulunamadı.');
 const text=clean(note,200);
 if(!text)throw Error('Not boş olamaz.');
 return {...record,updatedAt:at,audit:[...(record.audit||[]),{at,event:'note',note:text}]};
}

function summarize(records=[]){
 const by={open:0,reviewing:0,closed:0,high:0};
 for(const r of records){if(by[r.status]!==undefined)by[r.status]++;if(r.severity==='high')by.high++;}
 return {...by,total:records.length};
}

function redact(record){
 if(!record)return null;
 const {summary,action,...rest}=record;
 return {...rest,summary:summary?summary.slice(0,0)+'[gizlendi]':'',action:action?'[gizlendi]':''};
}

Object.assign(exports,{CATEGORIES,SEVERITIES,STATUSES,LABELS,createRecord,updateStatus,addNote,summarize,redact});
