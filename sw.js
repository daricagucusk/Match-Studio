/* Generated — edit src/pwa/service-worker.js */
const CACHE="matchstudio-universal-v268f13-038548efa32c2527";
const SHELL=["./","./index.html","./app.bundle.js","./broadcast.css","./premium-v267.css","./live-clock-v268b.css","./live-substitutions-v268c.css","./live-pitch-v268d.css","./live-events-v268e.css","./assets/ms-emblem-mark.png","./assets/match-studio-brand-preview.png","./assets/match-studio-blue-violet-brand.png","./manifest.webmanifest","./device-test.html","./icons/icon-192.png","./icons/icon-512.png"];
const INTEGRITY={"./":"f1da4ed00c68129626ad2a541190def21f245c868d485c64929d918a793c54e0","./index.html":"f1da4ed00c68129626ad2a541190def21f245c868d485c64929d918a793c54e0","./app.bundle.js":"dd63a6a07560439f4dd0470d2acee49b8b9236a19666065a58fdaa9ccde39078","./broadcast.css":"127d338c212b53e6ab0cc0e13a6fd07db80c9753776e6a858571b677de9f7a51","./premium-v267.css":"987c3408093f92988e286e2ab11915366e9cae508029734e0870a103d87bf89a","./live-clock-v268b.css":"345e7091774585da969697b100d720a6760b95da0e63d72a3b7fda0107daeac7","./live-substitutions-v268c.css":"13b12ca0c3a157c4fe75a54f2648d9d440edaa519616a0e6ee153360f104dbb2","./live-pitch-v268d.css":"d78f1a83787f14f2d95c5f967e49651344ce835c156f809336b33104f2df35ef","./live-events-v268e.css":"6cd9f977890e88b24ff510a816fd2ed31c3293255a2acef54c6d695852eb4a9e","./assets/ms-emblem-mark.png":"df1dbe5778e5966f84d369d854248f86a8b0b5ded6ee19ad5162abda09ba3f25","./assets/match-studio-brand-preview.png":"f6062ad867fb52909506f1b6c460e9ae2fbb0ee33eb96ff1f20bf8399e52181d","./assets/match-studio-blue-violet-brand.png":"c556b74e501107f06227e56bc541d5e17c4a9273e2b554ff0d945ba2028f60f0","./manifest.webmanifest":"fecb27c340d9708f624a75bff42714671d5514cd40fdc2bab29a07a5e3dddd7e","./device-test.html":"44350b88c250896ff338dca3f6c004eab007faf4e1c2accbdc72b27cc914ba12","./icons/icon-192.png":"df8a3f025b11fe2d7de48d56bde44324fdb779d22fd13af7048b8240fab790ec","./icons/icon-512.png":"df1dbe5778e5966f84d369d854248f86a8b0b5ded6ee19ad5162abda09ba3f25"};
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
 // Legal privacy policy is a distinct public document, not a SPA navigation.
 if(req.mode==='navigate'&&canonical.pathname==='/privacy.html')return;
 if(!shellUrls.has(canonical.href)&&req.mode!=='navigate')return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const key=shellUrls.has(canonical.href)?canonical:new URL('./index.html',self.registration.scope);
  const cached=await cache.match(key);
  // Never fill a missing file from a different deployment.
  return cached||new Response('Uygulama dosyası eksik. İnternete bağlanıp uygulamayı yeniden açın.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 })());
});
