/* Generated — edit src/pwa/service-worker.js */
const CACHE="matchstudio-universal-v268f13-6a3241d58fbcad83";
const SHELL=["./","./index.html","./app.bundle.js","./broadcast.css","./premium-v267.css","./live-clock-v268b.css","./live-substitutions-v268c.css","./live-pitch-v268d.css","./live-events-v268e.css","./assets/ms-emblem-mark.png","./assets/match-studio-brand-preview.png","./assets/match-studio-blue-violet-brand.png","./manifest.webmanifest","./device-test.html","./icons/icon-192.png","./icons/icon-512.png"];
const INTEGRITY={"./":"603dbb5ff219d927d22c6f0ee078a667a05ec08c5af36e50c1cae70949b5cd73","./index.html":"603dbb5ff219d927d22c6f0ee078a667a05ec08c5af36e50c1cae70949b5cd73","./app.bundle.js":"da532ac6b90528960e1a3ec6e763f8de0f8a1ab7b1ddf2bc74835503ea6c68d3","./broadcast.css":"7f18fbb3482fdd1aa8176ec24d750fb16e5cb34163e1a29a260ccec87237adfc","./premium-v267.css":"708998d0cd881f61ef959d2c119f0dd3960a104a146684fe335cfec9e7585cbb","./live-clock-v268b.css":"ee4f6337d3e7cb09a85e7167137293772535b622133399894d652658f19ebc68","./live-substitutions-v268c.css":"c62b9a84447b45601444e4d9ff2d653da49c4037fd3635118a5a9cfd728f47da","./live-pitch-v268d.css":"91204f990d9d9a1c4627fafdba36cd2154517b2373e60b7b26559260e6a3ef3d","./live-events-v268e.css":"142ca5aef63f7bf1c4794ebc39393956d4624bf94da250435b21579953accdb7","./assets/ms-emblem-mark.png":"df1dbe5778e5966f84d369d854248f86a8b0b5ded6ee19ad5162abda09ba3f25","./assets/match-studio-brand-preview.png":"f6062ad867fb52909506f1b6c460e9ae2fbb0ee33eb96ff1f20bf8399e52181d","./assets/match-studio-blue-violet-brand.png":"c556b74e501107f06227e56bc541d5e17c4a9273e2b554ff0d945ba2028f60f0","./manifest.webmanifest":"0209c90f2a85483b3500048ef70423e883a868d7b213f5cd5916fc5ab4af85c7","./device-test.html":"34ff7ba24ccf97e22025abea6ff52fc7d9bfd0cfb9835743dfd9bff6d2f22656","./icons/icon-192.png":"df8a3f025b11fe2d7de48d56bde44324fdb779d22fd13af7048b8240fab790ec","./icons/icon-512.png":"df1dbe5778e5966f84d369d854248f86a8b0b5ded6ee19ad5162abda09ba3f25"};
const shellUrls=new Set(SHELL.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{
 // A new cache is published only after every file matches the build manifest.
 // Failed installs cannot alter the cache of the currently active version.
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  try{
   for(const path of SHELL){
    const request=new Request(new URL(path,self.registration.scope),{cache:'reload'});
    const response=await fetch(request);
    if(!response.ok||response.redirected)throw Error('Incomplete release: '+path);
    const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
    const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    if(hex!==INTEGRITY[path])throw Error('Release checksum mismatch: '+path);
    await cache.put(request,response);
   }
  }catch(error){await caches.delete(CACHE);throw error;}
 })());
 // Updates wait until all old clients close, or the user requests a restart.
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  // Retain old release caches: tabs still using old code must not mix assets.
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());
 if(event.data?.type==='CACHE_STATUS')event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  const ready=(await Promise.all(SHELL.map(path=>cache.match(new URL(path,self.registration.scope))))).every(Boolean);
  event.ports[0]?.postMessage({cache:CACHE,ready});
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 // Ignore navigation query strings; the HTML and all its assets stay in one release.
 const canonical=new URL(url);canonical.search='';canonical.hash='';
 if(!shellUrls.has(canonical.href)&&req.mode!=='navigate')return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const key=shellUrls.has(canonical.href)?canonical:new URL('./index.html',self.registration.scope);
  const cached=await cache.match(key);
  // Never fill a missing file from a different deployment.
  return cached||new Response('Uygulama dosyası eksik. İnternete bağlanıp uygulamayı yeniden açın.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 })());
});
