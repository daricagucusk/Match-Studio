'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const {serverFiles}=require('../tools/runtime-files.cjs');
const {SECURITY_HEADERS}=require('../tools/security-headers.cjs');
const root=path.resolve(__dirname,'..');

test('PWA server dependency list boots independently and protects source paths',async()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'matchstudio-server-'));
 let child,exited;
 try{
  for(const name of serverFiles){const dest=path.join(temporary,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,name),dest);}
  fs.writeFileSync(path.join(temporary,'index.html'),'<html>independent PWA</html>');
  fs.mkdirSync(path.join(temporary,'src'));fs.writeFileSync(path.join(temporary,'src/private.js'),'private');
  const probe=net.createServer();await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(0,'127.0.0.1',resolve);});
  const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  child=spawn(process.execPath,['tools/serve.cjs',String(port)],{cwd:temporary,windowsHide:true});
  exited=new Promise(resolve=>child.once('exit',resolve));
  let stderr='';child.stderr.on('data',chunk=>{stderr+=chunk;});
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Standalone server did not start: '+stderr)),10000);
   const fail=error=>{clearTimeout(timer);reject(error);};
   child.once('error',fail);child.once('exit',code=>fail(Error('Standalone server exited '+code+': '+stderr)));
   child.stdout.once('data',()=>{clearTimeout(timer);resolve();});
  });
  const response=await fetch('http://127.0.0.1:'+port+'/index.html');
  assert.equal(response.status,200);assert.equal(await response.text(),'<html>independent PWA</html>');
  for(const [name,value] of Object.entries(SECURITY_HEADERS))assert.equal(response.headers.get(name),value,name);
  assert.equal((await fetch('http://127.0.0.1:'+port+'/src/private.js')).status,404);
  assert.equal((await fetch('http://127.0.0.1:'+port+'/tools/security-headers.cjs')).status,404);
 }finally{
  if(child){child.kill();await exited;}
  fs.rmSync(temporary,{recursive:true,force:true});
 }
});
