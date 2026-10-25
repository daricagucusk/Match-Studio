#!/usr/bin/env node
'use strict';
// Android/Play preflight: safe and intentionally read-only.
// Preparation mode can pass with documented release blockers; --strict exits 1.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const args=new Set(process.argv.slice(2));
const strict=args.has('--strict');
const remote=args.has('--remote');
const report=[];
function add(level,name,details){report.push({level,name,details});}
function requireFile(relative){
 const target=path.join(root,relative);
 if(!fs.existsSync(target))throw Error('Missing '+relative);
 return fs.readFileSync(target);
}
function pngSize(bytes){
 if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid PNG');
 return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
}
const origin='https://match-studio-telefon.vercel.app';
const hostname=new URL(origin).host;
async function run(){
 const web=JSON.parse(requireFile('manifest.webmanifest'));
 const android=JSON.parse(requireFile('android/twa-manifest.json'));
 const pkg=requireFile('package.json');
 const pkgName=JSON.parse(pkg).version;
 const isHex=x=>/^#[0-9a-f]{6}$/i.test(x);
 if(web.short_name!=='Match Studio'||web.display!=='standalone')throw Error('PWA app name/display mismatch');
 if(!web.start_url||!web.scope)throw Error('PWA manifest missing start/scope');
 for(const i of [192,512]){
   const blob=requireFile('icons/icon-'+i+'.png');
   const size=pngSize(blob);
   if(size.width!==i||size.height!==i)throw Error('App launcher icon '+i+' does not match required dimensions');
 }
 if(!/^com\.[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(android.packageId))throw Error('Android package ID invalid');
 if(android.host!==hostname||android.webManifestUrl!==origin+'/manifest.webmanifest')throw Error('TWA host mismatch');
 if(android.startUrl!=='/index.html'||android.fallbackType!=='customtabs')throw Error('TWA launch/fallback mismatch');
 if(android.enableNotifications!==false)throw Error('Unexpected Android notification feature');
 if(android.minSdkVersion<24)throw Error('Android min SDK must be 24 or above');
 if(!isHex(android.backgroundColor)||!isHex(android.themeColor))throw Error('TWA brand colors invalid');
 if(android.iconUrl!==origin+'/icons/icon-512.png')throw Error('TWA 512px icon mismatch');
 if(android.appVersionCode<1||!Number.isSafeInteger(android.appVersionCode))throw Error('Android app versionCode invalid');
 if(!pkgName.startsWith(android.appVersion+'.'))throw Error('Android appVersion is out of sync with PWA');
 add('PASS','PWA and launcher icons','192/512 PNG and trusted HTTPS host validated');
 add('PASS','Provisional Android metadata',android.packageId+' · v'+android.appVersion+' ('+android.appVersionCode+')');
 add('PASS','Permissions','No push delegation or payment permissions configured in wrapper.');
 const possiblePrivacy=path.join(root,'privacy.html');
 if(fs.existsSync(possiblePrivacy))add('PASS','Privacy page source','A privacy.html file exists; review its legal accuracy and public accessibility.');
 else add('BLOCKED','Public privacy policy','privacy.html is not live; privacy draft must be reviewed, approved and published first.');
 if((android.fingerprints||[]).length===0)add('BLOCKED','Digital Asset Links','Play App Signing SHA-256 fingerprint not yet provided. Do not publish a placeholder.');
 else add('CHECK','Play signing','Check the fingerprint is from Play Console App signing certificate, not upload key.');
 if(!process.env.GOOGLE_PLAY_ACCOUNT_VERIFIED)add('BLOCKED','Play developer account','Play Console registration, identity and test-track availability unconfirmed.');
 else add('CHECK','Play account','Account attested externally; final Play Console review still required.');
 if(!fs.existsSync(path.join(root,'android','upload-key.jks')))
    add('BLOCKED','AAB signing','No upload keystore in workspace (correct). Generate and securely back up OUTSIDE Git; not in repository.');
 else throw Error('Refusing a repo-local signing keystore: remove it before release.');
 add('CHECK','Android API 36','Bubblewrap must generate Gradle targetSdkVersion 36. Verify the built AAB in Play Console.');
 add('CHECK','Testers and physical devices','Verify closed-test eligibility, 12/14 requirement if personal account, backup restore, TWA launch and 16 KB device support.');
 if(remote){
   async function probe(rel){
      try{
       const rsp=await fetch(origin+rel,{redirect:'follow',signal:AbortSignal.timeout(10000)});
       const text=await rsp.text();
       return {ok:rsp.ok,status:rsp.status,type:rsp.headers.get('content-type')||'',text:text.slice(0,100000)};
      }catch(e){return {ok:false,status:'NETWORK',text:''};}
   }
   const pwa=await probe('/manifest.webmanifest');
   add(pwa.ok&&pwa.text.includes('"start_url"')?'PASS':'BLOCKED','Public webmanifest',String(pwa.status));
   const privacy=await probe('/privacy.html');
   add(privacy.ok&&privacy.text.includes('Gizlilik Politikası')?'PASS':'BLOCKED','Public privacy URL',String(privacy.status));
   const links=await probe('/.well-known/assetlinks.json');
   let linked=false;
   try{
      const data=JSON.parse(links.text);
      linked=Array.isArray(data)&&data.some(row=>row.target?.package_name===android.packageId&&
          Array.isArray(row.target.sha256_cert_fingerprints)&&row.target.sha256_cert_fingerprints.some(x=>/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/i.test(x)));
   }catch(_){}
   add(links.ok&&linked?'PASS':'BLOCKED','Public Digital Asset Links',String(links.status)+' / JSON certificate binding');
 }
 for(const line of report)console.log('['+line.level+'] '+line.name+' — '+line.details);
 const blocked=report.filter(x=>x.level==='BLOCKED').length;
 console.log('\nPlay readiness: '+report.length+' checks, '+blocked+' blockers; mode='+(strict?'strict':'preparation'));
 if(strict&&blocked)process.exitCode=1;
}
run().catch(e=>{console.error('Play preflight failed:',e.message);process.exitCode=1;});
