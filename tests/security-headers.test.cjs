'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {SECURITY_HEADERS,CSP}=require('../tools/security-headers.cjs');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');

test('Vercel and the standalone server share the same security policy',()=>{
 const cfg=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
 const served=Object.fromEntries(cfg.headers.find(h=>h.source==='/(.*)').headers.map(h=>[h.key,h.value]));
 for(const [key,value] of Object.entries(SECURITY_HEADERS))assert.equal(served[key],value,key);
 for(const directive of ["default-src 'self'","script-src 'self'","object-src 'none'","base-uri 'none'","frame-ancestors 'none'","form-action 'none'"])assert.ok(CSP.includes(directive),directive);
 assert.doesNotMatch(CSP,/script-src[^;]*unsafe/);
});

test('app and device diagnostics use external scripts compatible with strict CSP',()=>{
 for(const name of ['index.html','device-test.html']){
  const html=fs.readFileSync(path.join(web,name),'utf8');
  assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>/i,name+' inline script');
  assert.doesNotMatch(html,/\son[a-z]+\s*=\s*["']/i,name+' inline handler');
 }
 assert.match(fs.readFileSync(path.join(web,'device-test.html'),'utf8'),/<script\b[^>]*\bsrc="\.\/device-test\.js"/);
});

test('manifest preserves app identity and has separate any and maskable icons',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(web,'manifest.webmanifest'),'utf8'));
 assert.equal(manifest.name,'Match Studio — Futbol Kulübü');
 assert.equal(manifest.id,'./index.html');assert.equal(manifest.start_url,'./index.html');
 assert.equal(manifest.scope,'./');assert.equal(manifest.lang,'tr');
 assert.ok(!manifest.icons.some(icon=>/any\s+maskable/.test(icon.purpose)));
 assert.ok(manifest.icons.some(icon=>icon.purpose==='any'));
 assert.ok(manifest.icons.some(icon=>icon.purpose==='maskable'));
 for(const icon of manifest.icons){
  const bytes=fs.readFileSync(path.join(web,icon.src));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(icon.sizes,bytes.readUInt32BE(16)+'x'+bytes.readUInt32BE(20));
 }
});
