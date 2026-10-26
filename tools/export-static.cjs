'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtimeFiles=new Set(['index.html','app.bundle.js','broadcast.css','premium-v267.css','live-clock-v268b.css','live-substitutions-v268c.css','live-pitch-v268d.css','live-events-v268e.css','manifest.webmanifest','device-test.html','icons/icon-192.png','icons/icon-512.png','assets/ms-emblem-mark.png','assets/match-studio-brand-preview.png','assets/match-studio-blue-violet-brand.png']);
function exportStatic(root=path.resolve(__dirname,'..')){
 const read=name=>{const file=path.join(root,name);if(!fs.lstatSync(file).isFile()||fs.realpathSync(file)!==file)throw Error('Unsafe file: '+name);return fs.readFileSync(file);};
 const worker=read('sw.js');
 const shell=JSON.parse(worker.toString().match(/^const SHELL=(.*);$/m)?.[1]||'null');
 const integrity=JSON.parse(worker.toString().match(/^const INTEGRITY=(.*);$/m)?.[1]||'null');
 if(!Array.isArray(shell)||!integrity||typeof integrity!=='object')throw Error('Missing generated worker manifest');
 // Treat the generated manifest as data, never as executable JavaScript.
 const bytes=new Map([['sw.js',worker]]);
 for(const url of shell){
  if(typeof url!=='string'||!url.startsWith('./')||url.includes('..')||url.includes('\\'))throw Error('Unsafe runtime path');
  const name=url==='./'?'index.html':url.slice(2);
  if(!runtimeFiles.has(name))throw Error('Non-runtime file: '+name);
  const content=read(name);
  if(crypto.createHash('sha256').update(content).digest('hex')!==integrity[url])throw Error('Integrity mismatch: '+name);
  bytes.set(name,content);
 }
 if(!bytes.has('index.html')||Object.keys(integrity).length!==new Set(shell).size)throw Error('Incomplete worker manifest');
 bytes.set('robots.txt',read('robots.txt'));
 // Play Store documents may only be staged after legal owner approval and
 // the real Google Play App Signing SHA-256 is known. Never ship placeholder links.
 if(fs.existsSync(path.join(root,'privacy.html'))){
  const privacy=read('privacy.html');
  const problems=require('./play-privacy-validate.cjs').validatePrivacyPage(privacy.toString('utf8'),read('index.html').toString('utf8'));
  if(problems.length)throw Error('Privacy page cannot be published: '+problems.join(' '));
  bytes.set('privacy.html',privacy);
 }
 const assetLinkName='.well-known/assetlinks.json';
 if(fs.existsSync(path.join(root,assetLinkName))){
  const blob=read(assetLinkName);
  const items=JSON.parse(blob.toString('utf8'));
  const twa=JSON.parse(read('android/twa-manifest.json').toString('utf8'));
  const valid=Array.isArray(items)&&items.some(item=>
    (item.relation||[]).includes('delegate_permission/common.handle_all_urls')&&
    item.target?.namespace==='android_app'&&
    item.target?.package_name===twa.packageId&&
    (item.target?.sha256_cert_fingerprints||[]).some(fp=>/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/i.test(fp)));
  if(!valid)throw Error('Invalid Android App Links certificate binding');
  bytes.set(assetLinkName,blob);
 }
 const stage=fs.mkdtempSync(path.join(root,'.static-output-'));
 try{
  for(const [name,content] of bytes){const target=path.join(stage,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);}
  fs.rmSync(path.join(root,'public'),{recursive:true,force:true});fs.renameSync(stage,path.join(root,'public'));
 }finally{fs.rmSync(stage,{recursive:true,force:true});}
 return [...bytes.keys()].sort();
}
module.exports={exportStatic};
if(require.main===module)console.log('Static export verified: '+exportStatic().length+' files in public/');
