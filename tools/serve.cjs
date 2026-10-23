'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..',process.argv[3]==='--static'?'public':'.');
const port=Number(process.argv[2]||8904);
const files=new Map([
 ['/','index.html'],['/index.html','index.html'],['/app.bundle.js','app.bundle.js'],['/broadcast.css','broadcast.css'],
 ['/sw.js','sw.js'],['/manifest.webmanifest','manifest.webmanifest'],
 ['/icons/icon-192.png','icons/icon-192.png'],['/icons/icon-512.png','icons/icon-512.png'],['/premium-v267.css','premium-v267.css'],['/live-clock-v268b.css','live-clock-v268b.css'],['/live-substitutions-v268c.css','live-substitutions-v268c.css'],['/live-pitch-v268d.css','live-pitch-v268d.css'],['/live-events-v268e.css','live-events-v268e.css'],['/assets/ms-emblem-mark.png','assets/ms-emblem-mark.png'],['/assets/match-studio-brand-preview.png','assets/match-studio-brand-preview.png'],['/assets/match-studio-blue-violet-brand.png','assets/match-studio-blue-violet-brand.png']
]);
const types={'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png'};
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Port 1024–65535 arasında olmalı.');
const server=http.createServer((req,res)=>{
 let url;
 try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400);res.end('Geçersiz adres');return;}
 const relative=files.get(url.pathname);
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
 if(!relative){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Bulunamadı');return;}
 fs.readFile(path.join(root,relative),(error,bytes)=>{
  if(error){res.writeHead(500);res.end('Dosya okunamadı');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(relative)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'});
  if(req.method==='HEAD')res.end();else res.end(bytes);
 });
});
server.listen(port,'127.0.0.1',()=>console.log(`Match Studio V2.6.8-F.11 Yayına Hazırlık — Paket F test sürümü hazır: http://localhost:${port}\nÇıkmak için Ctrl+C basın.\nNot: Kayıtlar bu tarayıcı profilinde yerel saklanır.`));
