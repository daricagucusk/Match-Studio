const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {validateAssetLinks,validateSignedEvidence}=require('../tools/play-release-evidence.cjs');
const cert=Array(32).fill('AB').join(':'),pkg='com.matchdaystudio.app';
test('DAL requires exact certificate, package, relation, JSON and nonredirecting HTTP 200',()=>{
 const row={relation:['delegate_permission/common.handle_all_urls'],target:{namespace:'android_app',package_name:pkg,sha256_cert_fingerprints:[cert]}};
 const response={status:200,type:'application/json; charset=utf-8',text:JSON.stringify([row])};
 assert.deepEqual(validateAssetLinks(response,pkg,[cert]),[]);
 for(const patch of [{status:302},{redirected:true},{type:'text/html'},{text:'bad json'},{text:'[]'}])assert.ok(validateAssetLinks({...response,...patch},pkg,[cert]).length);
 assert.ok(validateAssetLinks(response,pkg,[]).length);
 for(const target of [{namespace:'web'},{package_name:'com.other.app'},{sha256_cert_fingerprints:[cert.replace('AB','AC')]}])assert.ok(validateAssetLinks({...response,text:JSON.stringify([{...row,target:{...row.target,...target}}])},pkg,[cert]).length);
 assert.ok(validateAssetLinks({...response,text:JSON.stringify([{...row,relation:[]}])},pkg,[cert]).length);
});
test('signed evidence binds actual bytes and rejects unsigned, wrong metadata and incomplete API evidence',()=>{
 const bytes=Buffer.from('synthetic artifact'),config={packageId:pkg,appVersionCode:1,appVersion:'2.6.8'};
 const report={reportVersion:1,artifactKind:'signed-upload',signatureVerified:true,packageId:pkg,versionCode:1,versionName:'2.6.8',targetSdk:36,compileSdk:36,permissions:[],nativeLibraries:[],artifactPath:'/external/synthetic.aab',artifactSha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 assert.deepEqual(validateSignedEvidence(report,config,()=>bytes),[]);
 for(const patch of [{artifactKind:'unsigned-qa'},{signatureVerified:false},{packageId:'com.other.app'},{versionCode:2},{targetSdk:35},{compileSdk:null},{permissions:['com.android.vending.BILLING']},{nativeLibraries:['base/lib/test.so']},{artifactPath:'relative.aab'},{artifactSha256:'0'.repeat(64)}])assert.ok(validateSignedEvidence({...report,...patch},config,()=>bytes).length);
 assert.ok(validateSignedEvidence(report,config,()=>{throw Error('missing');}).length);
});
