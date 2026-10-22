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
