'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {SECURITY_HEADERS}=require('./security-headers.cjs');
const project=path.resolve(__dirname,'..');
// Source checkout: web/. Extracted PWA ZIP: runtime files at the archive root.
const root=process.argv[3]==='--static'?path.join(project,'public'):
 fs.existsSync(path.join(project,'web'))?path.join(project,'web'):project;
const port=Number(process.argv[2]||8904);
const files=new Map([['/','index.html'],...[
 ...require('./runtime-files.cjs').runtimeFiles,...require('./runtime-files.cjs').diagnostics,'sw.js','privacy.html','robots.txt','.well-known/assetlinks.json'
].map(name=>['/'+name,name])]);
const types={'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Port 1024–65535 arasında olmalı.');
const server=http.createServer((req,res)=>{
 let url;
 try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400);res.end('Geçersiz adres');return;}
 const relative=files.get(url.pathname);
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
 if(!relative){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Bulunamadı');return;}
 fs.readFile(path.join(root,relative),(error,bytes)=>{
  if(error){res.writeHead(error.code==='ENOENT'?404:500);res.end('Dosya okunamadı');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(relative)],'Cache-Control':'no-cache',...SECURITY_HEADERS});
  if(req.method==='HEAD')res.end();else res.end(bytes);
 });
});
server.listen(port,'127.0.0.1',()=>console.log(`Match Studio hazır: http://localhost:${port}\nÇıkmak için Ctrl+C basın.\nNot: Kayıtlar bu tarayıcı profilinde yerel saklanır.`));
