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
const {fingerprint,validateAssetLinks,validateSignedEvidence}=require('./play-release-evidence.cjs');
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
 const web=JSON.parse(requireFile('web/manifest.webmanifest'));
 const android=JSON.parse(requireFile('android/twa-manifest.json'));
 const decision=JSON.parse(requireFile('docs/play/release-monetization.json'));
 const pkg=requireFile('package.json');
 const pkgName=JSON.parse(pkg).version;
 const isHex=x=>/^#[0-9a-f]{6}$/i.test(x);
 if(web.short_name!=='Match Studio'||web.display!=='standalone')throw Error('PWA app name/display mismatch');
 if(!web.start_url||!web.scope)throw Error('PWA manifest missing start/scope');
 for(const i of [192,512]){
   const blob=requireFile('web/icons/icon-'+i+'.png');
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
 if(!(pkgName===android.appVersion||pkgName.startsWith(android.appVersion+'.')||pkgName.startsWith(android.appVersion+'-')))throw Error('Android appVersion is out of sync with PWA');
 add('PASS','PWA and launcher icons','192/512 PNG and trusted HTTPS host validated');
 add('PASS','Android metadata',android.packageId+' · v'+android.appVersion+' ('+android.appVersionCode+')');
 if(decision.android.packageIdConfirmedByOwner!==true||decision.android.packageIdProposal!==android.packageId)add('BLOCKED','Package identity','Final package ID requires owner confirmation.');
 if(decision.android.packageIdAvailableInConsole!==true)add('BLOCKED','Play application record','Package availability and application record are not confirmed in Play Console.');
 add('PASS','Permissions','No push delegation or payment permissions configured in wrapper.');
 const possiblePrivacy=path.join(root,'web/privacy.html');
 if(fs.existsSync(possiblePrivacy)){
  const issues=require('./play-privacy-validate.cjs').validatePrivacyPage(requireFile('web/privacy.html').toString('utf8'),requireFile('web/index.html').toString('utf8'));
  if(issues.length)add('BLOCKED','Public privacy policy',issues.join(' '));
  else add('CHECK','Privacy page source','Static safety checks passed; legal accuracy, in-app navigation and public HTTPS URL still require manual confirmation.');
 }else add('BLOCKED','Public privacy policy','privacy.html is not live; privacy draft must be reviewed, approved and published first.');
 const expectedFingerprints=[process.env.PLAY_APP_SIGNING_SHA256,...(android.fingerprints||[]).map(x=>typeof x==='string'?x:x.value)].map(fingerprint).filter(Boolean);
 if(!expectedFingerprints.length)add('BLOCKED','Digital Asset Links','Play App Signing SHA-256 fingerprint not yet provided. Do not publish a placeholder.');
 else add('CHECK','Play signing','Check the fingerprint is from Play Console App signing certificate, not upload key.');
 if(decision.account.identityVerificationStatus!=='verified'||decision.account.appCreatedInConsole!==true)add('BLOCKED','Play developer account','Identity verification/application registration are not confirmed; current status: '+decision.account.identityVerificationStatus);
 else add('CHECK','Play account','Account attested externally; final Play Console review still required.');
 if(fs.existsSync(path.join(root,'android','upload-key.jks')))throw Error('Refusing a repo-local signing keystore: remove it before release.');
 const evidencePath=process.env.MATCHSTUDIO_SIGNED_AAB_REPORT;
 if(!evidencePath)add('BLOCKED','AAB signing','Supply an external signed-AAB inspection report via MATCHSTUDIO_SIGNED_AAB_REPORT. No private key belongs in this workspace.');
 else{
  let issues;try{const evidence=JSON.parse(fs.readFileSync(evidencePath,'utf8'));issues=validateSignedEvidence(evidence,android);}catch{issues=['Signed AAB inspection report could not be read.'];}
  add(issues.length?'BLOCKED':'PASS','AAB signing',issues.length?issues.join(' '):'External signed upload AAB matches metadata and inspected SHA-256; this is not Play approval.');
 }
 add('CHECK','Android API 36','Bubblewrap must generate Gradle targetSdkVersion 36. Verify the built AAB in Play Console.');
 add('CHECK','Testers and physical devices','Verify closed-test eligibility, 12/14 requirement if personal account, backup restore, TWA launch and 16 KB device support.');
 if(remote){
   async function probe(rel){
      try{
       const rsp=await fetch(origin+rel,{redirect:'manual',signal:AbortSignal.timeout(10000)});
       const text=await rsp.text();
       return {ok:rsp.ok,status:rsp.status,redirected:rsp.redirected,type:rsp.headers.get('content-type')||'',text:text.slice(0,100000)};
      }catch(e){return {ok:false,status:'NETWORK',text:''};}
   }
   const pwa=await probe('/manifest.webmanifest');
   add(pwa.ok&&pwa.text.includes('"start_url"')?'PASS':'BLOCKED','Public webmanifest',String(pwa.status));
   const privacy=await probe('/privacy.html');
   const privacyIssues=require('./play-privacy-validate.cjs').validatePrivacyPage(privacy.text,requireFile('web/index.html').toString('utf8'));
   add(privacy.status===200&&/^text\/html/i.test(privacy.type||'')&&!privacyIssues.length?'PASS':'BLOCKED','Public privacy URL',String(privacy.status));
   const links=await probe('/.well-known/assetlinks.json');
   const linkIssues=validateAssetLinks(links,android.packageId,expectedFingerprints);
   add(linkIssues.length?'BLOCKED':'PASS','Public Digital Asset Links',linkIssues.length?linkIssues.join(' '):'Exact Play certificate/package binding without redirects');
 }
 for(const line of report)console.log('['+line.level+'] '+line.name+' — '+line.details);
 const blocked=report.filter(x=>x.level==='BLOCKED').length;
 console.log('\nPlay readiness: '+report.length+' checks, '+blocked+' blockers; mode='+(strict?'strict':'preparation'));
 if(strict&&blocked)process.exitCode=1;
}
run().catch(e=>{console.error('Play preflight failed:',e.message);process.exitCode=1;});
