/* Premium device integrations: screen wake lock during a running match, short haptic
 * feedback, and an install prompt. Every browser API is optional and injected, so the
 * module degrades silently where it is unavailable and stays unit-testable. */
function createWakeLock(env={}){
 const nav=env.navigator||(typeof navigator!=='undefined'?navigator:null),doc=env.document||(typeof document!=='undefined'?document:null);
 let wanted=false,sentinel=null,pending=false;
 async function acquire(){
  if(!wanted||sentinel||pending||!nav?.wakeLock?.request)return false;
  if(doc&&doc.visibilityState&&doc.visibilityState!=='visible')return false;
  pending=true;
  try{const lock=await nav.wakeLock.request('screen');
   if(!wanted||(doc?.visibilityState&&doc.visibilityState!=='visible')){await lock.release?.();return false;}
   sentinel=lock;lock.addEventListener?.('release',()=>{if(sentinel===lock)sentinel=null;});return true;
  }catch{return false;}finally{pending=false;}
 }
 async function release(){const lock=sentinel;sentinel=null;try{await lock?.release?.();}catch{}}
 // Idempotent: called every clock tick with the current "match is running" state.
 function set(on){wanted=Boolean(on);return wanted?acquire():release();}
 // The browser drops the lock when the tab is hidden; take it again on return.
 doc?.addEventListener?.('visibilitychange',()=>{if(wanted)acquire();});
 return {set,get active(){return Boolean(sentinel);},get wanted(){return wanted;}};
}
function haptic(kind='tap',env={}){
 const nav=env.navigator||(typeof navigator!=='undefined'?navigator:null);
 if(!nav?.vibrate)return false;
 const reduce=env.reducedMotion??(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 if(reduce)return false;
 const patterns={tap:12,success:[14,40,14],warning:[30,50,30],error:[60,40,60]};
 try{return nav.vibrate(patterns[kind]||patterns.tap);}catch{return false;}
}
function createInstallPrompt({win=typeof window!=='undefined'?window:null,doc=typeof document!=='undefined'?document:null,storage=null,notify=()=>{}}={}){
 if(!win||!doc)return {available:false};
 const KEY='matchstudio-install-dismissed';
 const read=()=>{try{return storage?.getItem(KEY);}catch{return null;}},write=()=>{try{storage?.setItem(KEY,String(Date.now()));}catch{}};
 let deferred=null,chip=null;
 const standalone=()=>Boolean(win.matchMedia?.('(display-mode: standalone)').matches||win.navigator?.standalone);
 function hide(){chip?.remove();chip=null;}
 function show(){
  if(chip||!deferred||standalone())return;
  const last=Number(read());if(last&&Date.now()-last<14*86400000)return;
  chip=doc.createElement('div');chip.className='install-chip';chip.setAttribute('role','region');chip.setAttribute('aria-label','Uygulamayı yükle');
  const text=doc.createElement('span');text.textContent='Match Studio\'yu ana ekrana ekleyin: tam ekran ve çevrimdışı çalışır.';
  const yes=doc.createElement('button');yes.type='button';yes.className='btn btn-primary btn-small';yes.textContent='Yükle';
  const no=doc.createElement('button');no.type='button';no.className='btn btn-subtle btn-small';no.textContent='Sonra';
  yes.addEventListener('click',async()=>{const e=deferred;deferred=null;hide();try{await e.prompt();const choice=await e.userChoice;if(choice?.outcome==='accepted')notify('Uygulama yüklendi.');else write();}catch{write();}});
  no.addEventListener('click',()=>{write();hide();});
  chip.append(text,yes,no);doc.body.append(chip);
 }
 win.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;show();});
 win.addEventListener('appinstalled',()=>{deferred=null;hide();});
 return {available:true,show,hide};
}
Object.assign(exports,{createWakeLock,haptic,createInstallPrompt});
