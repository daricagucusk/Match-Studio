const {test}=require('node:test');
const assert=require('node:assert/strict');
const cp=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

test('Play preflight validates the existing PWA icons and provisional TWA',()=>{
 const ret=cp.spawnSync(process.execPath,['tools/check-play-readiness.cjs'],{
   cwd:root,encoding:'utf8',timeout:20000
 });
 assert.equal(ret.status,0,ret.stdout+'\n'+ret.stderr);
 assert.match(ret.stdout,/\[PASS\] PWA and launcher icons/);
 assert.match(ret.stdout,/\[PASS\] Android metadata/);
 assert.match(ret.stdout,/Play readiness:/);
});
test('signed Android wrapper uses approved production origin and release metadata',()=>{
 const cfg=JSON.parse(fs.readFileSync(path.join(root,'android/twa-manifest.json'),'utf8'));
 assert.equal(cfg.host,'match-studio-telefon.vercel.app');
 assert.equal(cfg.startUrl,'/index.html');
 assert.equal(cfg.enableNotifications,false);
 const approved=JSON.parse(fs.readFileSync(path.join(root,'docs/play/release-monetization.json'),'utf8'));
 assert.equal(cfg.appVersionCode,approved.android.signedAabVersionCode);
 assert.equal(cfg.fallbackType,'customtabs');
 assert.equal(cfg.minSdkVersion,24);
 assert.ok(!cfg.signingKey.path.includes('.github'));
});
test('Digital Asset Links script never publishes invalid or missing fingerprints',()=>{
 const result=cp.spawnSync(process.execPath,['tools/generate-play-assetlinks.cjs','--play-sha256=NOT_A_REAL_CERT'],{
   cwd:root,encoding:'utf8',timeout:15000
 });
 assert.notEqual(result.status,0);
 assert.doesNotMatch(result.stdout,/delegate_permission/);
});
test('Play App Signing fingerprint creates Android App Links for the same package',()=>{
 const sha=Array(32).fill('AB').join(':');
 const result=cp.spawnSync(process.execPath,['tools/generate-play-assetlinks.cjs','--play-sha256='+sha],{
   cwd:root,encoding:'utf8',timeout:15000
 });
 assert.equal(result.status,0,result.stderr);
 const json=JSON.parse(result.stdout);
 assert.equal(json[0].target.package_name,'com.matchdaystudio.app');
 assert.equal(json[0].target.sha256_cert_fingerprints[0],sha);
 assert.deepEqual(json[0].relation,['delegate_permission/common.handle_all_urls']);
});
test('assetlinks generator validates package identity matches TWA manifest',()=>{
 const sha=Array(32).fill('CD').join(':');
 const result=cp.spawnSync(process.execPath,['tools/generate-play-assetlinks.cjs','--play-sha256='+sha],{
   cwd:root,encoding:'utf8',timeout:15000
 });
 assert.equal(result.status,0,result.stderr);
 const json=JSON.parse(result.stdout);
 assert.equal(json[0].target.package_name,'com.matchdaystudio.app');
 assert.equal(json[0].target.sha256_cert_fingerprints[0],sha);
});
test('assetlinks generator rejects malformed SHA-256 fingerprints',()=>{
 const bad='NOT_A_VALID_FINGERPRINT';
 const result=cp.spawnSync(process.execPath,['tools/generate-play-assetlinks.cjs','--play-sha256='+bad],{
   cwd:root,encoding:'utf8',timeout:15000
 });
 assert.notEqual(result.status,0);
 assert.doesNotMatch(result.stdout,/delegate_permission/);
});
test('assetlinks generator rejects incomplete SHA-256 (31 pairs)',()=>{
 const sha=Array(31).fill('EF').join(':');
 const result=cp.spawnSync(process.execPath,['tools/generate-play-assetlinks.cjs','--play-sha256='+sha],{
   cwd:root,encoding:'utf8',timeout:15000
 });
 assert.notEqual(result.status,0);
 assert.doesNotMatch(result.stdout,/delegate_permission/);
});
