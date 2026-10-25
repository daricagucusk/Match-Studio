const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
const {load}=createLoader();
const {splitDelimited,parseFixtureRows}=load('src/domain/fixture-import.js');
test('weekly CSV/TSV import supports Turkish headers and quoted content',()=>{
 const rows=splitDelimited('Grup;Rakip;Tarih;Saat;Saha\nU14;"Sahil; Spor";08.11.2026;14.30;Kent Stadı');
 const plan=parseFixtureRows(rows);
 assert.deepEqual(plan.errors,[]);
 assert.equal(plan.rows.length,1);
 assert.equal(plan.rows[0].opponent,'Sahil; Spor');
 assert.equal(plan.rows[0].matchDate,'2026-11-08');
 assert.equal(plan.rows[0].kickoffTime,'14:30');
});
test('Excel numeric date and time normalize without guessing text dates',()=>{
 const p=parseFixtureRows([['Grup','Rakip','Tarih','Saat','Saha'],['U12','Rakip Spor','46334','0.625','Saha A']]);
 assert.deepEqual(p.errors,[]);
 assert.match(p.rows[0].matchDate,/^\d{4}-\d{2}-\d{2}$/);
 assert.equal(p.rows[0].kickoffTime,'15:00');
});
test('missing mandatory columns fail closed',()=>{
 const p=parseFixtureRows([['Ad','Yer'],['Futbol','Saha']]);
 assert.equal(p.rows.length,0);
 assert.match(p.errors.join(' '),/Zorunlu sütunlar/);
});
test('duplicate and invalid fixtures are refused',()=>{
 const p=parseFixtureRows([['Grup','Rakip','Tarih','Saat','Saha'],
 ['U14','Sahil Spor','2026-11-08','14:00','Merkez Saha'],
 ['U14','Sahil Spor','2026-11-08','14:00','Merkez Saha'],
 ['U15','Komşu','2026-19-99','bad','Merkez Saha']]);
 assert.equal(p.rows.length,1);
 assert.equal(p.errors.length,2);
});
test('TSV file preserves opponent details and avoids CSV formula execution',()=>{
 const grid=splitDelimited('Grup\tRakip\tTarih\tSaat\tSaha\nU14\t=FALSE()\t2026-11-08\t14:00\tSaha');
 const plan=parseFixtureRows(grid);
 assert.equal(plan.rows.length,1);
 assert.equal(plan.rows[0].opponent,'=FALSE()');
});
