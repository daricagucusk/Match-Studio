'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createSession,setEntry,clearEntry,sessionSummary,playerAttendance,riskList,attendanceCsv}=require('../src/domain/attendance.js');

const players=[{id:'p1',name:'Ali'},{id:'p2',name:'Berk'},{id:'p3',name:'Cem'}];

test('session rejects invalid date and kind',()=>{
 assert.throws(()=>createSession({date:'2026-13-40'}),/tarihi geçersiz/);
 assert.throws(()=>createSession({date:'2026-11-10',kind:'party'}),/türü geçersiz/);
});

test('entry statuses are validated and absences keep a known reason',()=>{
 const s=createSession({date:'2026-11-10',kind:'training',groupId:'g1'});
 assert.throws(()=>setEntry(s,'p1','maybe'),/durumu geçersiz/);
 assert.throws(()=>setEntry(s,'','present'),/Oyuncu seçilmedi/);
 const absent=setEntry(s,'p1','absent','sağlık');
 assert.deepEqual(absent.entries.p1,{status:'absent',reason:'sağlık'});
 assert.deepEqual(setEntry(s,'p2','absent','bilinmeyen').entries.p2,{status:'absent',reason:'diğer'});
 assert.deepEqual(setEntry(s,'p3','late').entries.p3,{status:'late'});
 assert.equal(clearEntry(absent,'p1').entries.p1,undefined);
});

test('session summary counts unmarked players and computes attendance rate',()=>{
 let s=createSession({date:'2026-11-10',kind:'training',groupId:'g1'});
 s=setEntry(s,'p1','present');s=setEntry(s,'p2','absent','okul');
 const summary=sessionSummary(s,players);
 assert.equal(summary.present,1);assert.equal(summary.absent,1);assert.equal(summary.unmarked,1);
 assert.equal(summary.marked,2);assert.equal(summary.rate,50);
 assert.equal(sessionSummary(null,players).rate,null);
});

test('player attendance aggregates sessions and risk list flags low attendance',()=>{
 const sessions=[];
 for(const date of ['2026-11-03','2026-11-05','2026-11-07']){
  let s=createSession({date,kind:'training',groupId:'g1'});
  s=setEntry(s,'p1','present');s=setEntry(s,'p2','absent','sağlık');s=setEntry(s,'p3','late');
  sessions.push(s);
 }
 const p2=playerAttendance(sessions,'p2');
 assert.equal(p2.absent,3);assert.equal(p2.rate,0);
 const risk=riskList(sessions,players,70);
 assert.deepEqual(risk.map(r=>r.player.id),['p2']);
 assert.equal(playerAttendance(sessions,'p3').rate,100);
});

test('csv export quotes values and labels statuses in Turkish',()=>{
 let s=createSession({date:'2026-11-10',kind:'match',groupId:'g1'});
 s=setEntry(s,'p1','present');
 const csv=attendanceCsv([s],players);
 assert.match(csv,/^"Tarih","Tür","Grup","Oyuncu","Durum","Gerekçe"/);
 assert.match(csv,/"2026-11-10","Maç","g1","Ali","Katıldı",""/);
});
