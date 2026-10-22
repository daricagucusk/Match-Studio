// Keep update acceptance separate from app rendering and from active data writes.
function setupPwaUpdates({isBusy=()=>false,onStatus=()=>{},notify=()=>{}}={}){
 if(!('serviceWorker' in navigator)||!window.isSecureContext||location.protocol==='file:')return;
 let accepted=false,hadController=Boolean(navigator.serviceWorker.controller);
 const show=reg=>{
  if(!reg.waiting||!navigator.serviceWorker.controller)return;
  let banner=document.getElementById('pwa-update');
  if(!banner){
   banner=document.createElement('div');banner.id='pwa-update';banner.className='pwa-update';banner.setAttribute('role','status');
   const text=document.createElement('span');text.textContent='Yeni sürüm hazır. Güncelleme tüm açık Match Studio sekmelerini yeniden başlatır; açık formları önce kaydedin.';
   const button=document.createElement('button');button.type='button';button.className='btn btn-primary';button.textContent='Güncelle ve yeniden başlat';
   button.addEventListener('click',async()=>{
    if(isBusy()){notify('Devam eden işlemin tamamlanmasını bekleyin.');return;}
    if(!confirm('Tüm açık Match Studio sekmeleri yeniden başlatılacak. Açık formları kaydettiniz mi?'))return;
    // Never replace the worker underneath a write in another tab.
    if(!navigator.locks){notify('Güncellemek için açık Match Studio sekmelerini kapatıp yeniden açın.');return;}
    await navigator.locks.request('matchstudio-ui-update',{ifAvailable:true},async lock=>{
     if(!lock){notify('Başka sekmede işlem sürüyor. Tamamlandıktan sonra yeniden deneyin.');return;}
     accepted=true;button.disabled=true;reg.waiting?.postMessage({type:'ACTIVATE_UPDATE'});
     await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
    });
   });
   banner.append(text,button);document.body.append(banner);
  }
 };
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  // Existing tabs reload together; the browser asks before leaving dirty forms.
  if(accepted||hadController)location.reload();
  else{hadController=true;onStatus();}
 });
 navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
  show(reg);
  reg.addEventListener('updatefound',()=>{
   const worker=reg.installing;
   worker?.addEventListener('statechange',()=>{if(worker.state==='installed'){show(reg);onStatus();}});
  });
  navigator.serviceWorker.ready.then(onStatus);
  window.addEventListener('online',()=>reg.update().catch(()=>{}));
 }).catch(error=>{console.warn('Service worker:',error);notify('Çevrimdışı kurulum tamamlanamadı. Bağlantınızı kontrol edip yeniden açın.');});
}
async function getOfflineReadiness(){
 const controller=navigator.serviceWorker?.controller;if(!controller)return false;
 return new Promise(resolve=>{
  const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(false);},3000);
  channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data?.ready===true);};
  controller.postMessage({type:'CACHE_STATUS'},[channel.port2]);
 });
}
Object.assign(exports,{setupPwaUpdates,getOfflineReadiness});
