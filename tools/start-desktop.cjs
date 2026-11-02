'use strict';
// Local launcher; never changes club databases or browser profiles.
const http=require('node:http');
const path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const url='http://127.0.0.1:8911/';
function probe(){return new Promise(resolve=>{const req=http.get(url,res=>{let body='';res.on('data',x=>body+=x);res.on('end',()=>resolve(res.statusCode===200&&/Match Studio/i.test(body)?'ready':'other'));});req.on('error',()=>resolve('absent'));req.setTimeout(1500,()=>{req.destroy();resolve('absent');});});}
(async()=>{
 const built=spawnSync(process.execPath,[path.join(__dirname,'build.cjs')],{cwd:root,stdio:'inherit'});
 if(built.status!==0)throw new Error('Derleme başarısız.');
 let state=await probe();
 if(state==='other')throw new Error('8911 portunda başka bir uygulama var. Portu kontrol edin; mevcut servis kapatılmadı.');
 if(state==='absent'){
  const server=spawn(process.execPath,[path.join(__dirname,'serve.cjs'),'8911'],{cwd:root,detached:true,windowsHide:true,stdio:'ignore'});server.unref();
  for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,300));state=await probe();if(state==='ready')break;}
 }
 if(state!=='ready')throw new Error('Yerel sunucu başlatılamadı.');
 if(process.platform==='win32')spawn('powershell.exe',['-NoProfile','-Command',"Start-Process 'http://127.0.0.1:8911/'"],{windowsHide:true,stdio:'ignore'}).unref();
 console.log('Match Studio: '+url);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
