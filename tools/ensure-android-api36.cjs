'use strict';
// CI-only generated Gradle hardening: do not edit canonical Android metadata.
// Google Play requires targetSdk >= 36 for new apps as of 2026-08-31.
// Fail closed if the generator's Gradle format is unfamiliar.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(process.argv[2]||'.unsigned-twa');
function walk(dir,depth=0){
 if(depth>5)return [];
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  if(e.isDirectory()){
   if(['.gradle','build','node_modules'].includes(e.name))return [];
   return walk(path.join(dir,e.name),depth+1);
  }
  if(e.isFile()&&/^build\.gradle(?:\.kts)?$/.test(e.name))return [path.join(dir,e.name)];
  return [];
 });
}
const candidates=walk(root),matched=[];
for(const filename of candidates){
 let body=fs.readFileSync(filename,'utf8'),changed=false;
 // Accept older Groovy and Kotlin DSL patterns. Only patch numeric SDK values.
 for(const name of ['compileSdkVersion','compileSdk','targetSdkVersion','targetSdk']){
  const rx=new RegExp('\\b('+name+')\\s*(?:=\\s*|\\(\\s*|\\s+)([0-9]{2})(\\s*\\))?','g');
  body=body.replace(rx,(all,key,raw,closer)=>{
   const n=Number(raw);if(n>=36)return all;
   if(n<24)throw Error('Unexpected Android SDK in '+filename+': '+all);
   changed=true;return all.replace(raw,'36');
  });
 }
 if(/\btargetSdk(?:Version)?\b/.test(body)){
  const current=[...body.matchAll(/\btargetSdk(?:Version)?\s*(?:=\s*|\(\s*|\s+)(\d+)/g)].map(m=>Number(m[1]));
  if(!current.length||current.some(n=>n<36))throw Error('Could not prove targetSdk >=36 in '+filename);
  matched.push(filename);
 }
 if(changed)fs.writeFileSync(filename,body);
}
if(!matched.length)throw Error('No generated targetSdk Gradle configuration found; cannot prove Play API 36 readiness');
console.log('API 36 Gradle check PASS: '+matched.map(f=>path.relative(root,f)).join(', '));
