'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createRecord,updateStatus,addNote,summarize,redact}=require('../src/storage/safeguarding.js');

const base={date:'2026-11-10',category:'safeguarding',severity:'high',summary:'Antrenman sonrası ulaşım güvenliği bildirildi',action:'Veli ile görüşüldü',reporter:'Antrenör'};

test('record validates date, category, severity and summary length',()=>{
 assert.throws(()=>createRecord({...base,date:'10.11.2026'}),/tarihi geçersiz/);
 assert.throws(()=>createRecord({...base,category:'gossip'}),/kategorisi geçersiz/);
 assert.throws(()=>createRecord({...base,severity:'extreme'}),/Önem derecesi geçersiz/);
 assert.throws(()=>createRecord({...base,summary:'kısa'}),/en az 10 karakter/);
});

test('record keeps a timestamped audit trail and starts open',()=>{
 const r=createRecord(base,'2026-11-10T10:00:00.000Z');
 assert.equal(r.status,'open');
 assert.deepEqual(r.audit,[{at:'2026-11-10T10:00:00.000Z',event:'created'}]);
 assert.equal(r.createdAt,r.updatedAt);
});

test('status transitions append audit entries and closed records stay closed',()=>{
 const r=createRecord(base,'2026-11-10T10:00:00.000Z');
 const reviewing=updateStatus(r,'reviewing','Veli toplantısı planlandı','2026-11-11T09:00:00.000Z');
 assert.equal(reviewing.status,'reviewing');
 assert.equal(reviewing.audit.at(-1).event,'status:reviewing');
 const closed=updateStatus(reviewing,'closed','','2026-11-12T09:00:00.000Z');
 assert.equal(closed.status,'closed');
 assert.throws(()=>updateStatus(closed,'open'),/yeniden açılamaz/);
 assert.throws(()=>updateStatus(r,'archived'),/Durum geçersiz/);
});

test('notes are trimmed, required and audited',()=>{
 const r=createRecord(base,'2026-11-10T10:00:00.000Z');
 assert.throws(()=>addNote(r,'   '),/Not boş olamaz/);
 const noted=addNote(r,'  Kulüp psikoloğu bilgilendirildi  ','2026-11-10T12:00:00.000Z');
 assert.equal(noted.audit.at(-1).note,'Kulüp psikoloğu bilgilendirildi');
});

test('summary counts statuses and high severity; redact hides free text',()=>{
 const a=createRecord(base,'2026-11-10T10:00:00.000Z');
 const b=updateStatus(createRecord({...base,severity:'low',summary:'Tesis kapısı kilidi arızalı'},'2026-11-10T10:00:00.000Z'),'closed');
 assert.deepEqual(summarize([a,b]),{open:1,reviewing:0,closed:1,high:1,total:2});
 const hidden=redact(a);
 assert.equal(hidden.summary,'[gizlendi]');
 assert.equal(hidden.action,'[gizlendi]');
 assert.equal(hidden.category,'safeguarding');
});
