const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
test('PWA worker does not rewrite the public privacy policy as app shell',()=>{
 const handlers=new Map();
 const origin='https://match-studio-telefon.vercel.app';
 const self={
  registration:{scope:origin+'/'},location:{origin},
  addEventListener:(event,listener)=>handlers.set(event,listener)
 };
 const text=fs.readFileSync(path.join(root,'src/pwa/service-worker.js'),'utf8');
 vm.runInNewContext(
  'const SHELL=["./","./index.html"];const CACHE="test";const INTEGRITY={};\n'+text,
  {self,URL,Request,Response,caches:{open:async()=>({match:async()=>null})},fetch:async()=>({ok:true}),
  crypto:globalThis.crypto,Uint8Array}
 );
 const route=url=>{
  let claimed=false;
  const event={request:{method:'GET',url:origin+url,mode:'navigate'},
   respondWith:()=>{claimed=true;}};
  handlers.get('fetch')(event);
  return claimed;
 };
 assert.equal(route('/privacy.html'),false,'policy must reach the actual published HTML');
 assert.equal(route('/privacy.html?lang=tr'),false,'query parameters must not cause SPA shell fallback');
 assert.equal(route('/'),true,'normal app navigations remain offline-capable');
 assert.equal(route('/index.html'),true);
});
test('store-facing app name does not expose internal package names',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 assert.match(html,/<title>Match Studio \| Futbol Kulübü<\/title>/);
 assert.equal(manifest.name,'Match Studio — Futbol Kulübü');
 assert.equal(manifest.short_name,'Match Studio');
 assert.ok(!manifest.name.includes('Paket F'));
});
test('robots rules allow future public legal/assetlinks documents while preserving private app indexing',()=>{
 const rules=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
 assert.match(rules,/Allow: \/privacy\.html/);
 assert.match(rules,/Allow: \/\.well-known\/assetlinks\.json/);
 assert.match(rules,/Disallow: \//);
});
