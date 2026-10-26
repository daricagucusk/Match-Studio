'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const fingerprint=value=>typeof value==='string'&&/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/i.test(value)?value.toUpperCase():null;
function validateAssetLinks({status,type,text,redirected=false},packageId,expected=[]){
 if(status!==200||redirected)return ['Digital Asset Links must return HTTP 200 without redirects.'];
 if(!/^application\/json(?:\s*;|$)/i.test(type))return ['Digital Asset Links must be application/json.'];
 const fingerprints=expected.map(fingerprint).filter(Boolean);if(!fingerprints.length)return ['Confirmed Play App Signing certificate is missing.'];
 let data;try{data=JSON.parse(text);}catch{return ['Digital Asset Links is not JSON.'];}
 const matches=Array.isArray(data)&&data.some(row=>Array.isArray(row?.relation)&&row.relation.includes('delegate_permission/common.handle_all_urls')&&row.target?.namespace==='android_app'&&row.target.package_name===packageId&&Array.isArray(row.target.sha256_cert_fingerprints)&&row.target.sha256_cert_fingerprints.some(v=>fingerprints.includes(fingerprint(v))));
 return matches?[]:['Digital Asset Links package, namespace, relation or Play certificate does not match.'];
}
function validateSignedEvidence(report,android,readFile=fs.readFileSync){
 const errors=[];
 if(report?.reportVersion!==1||report.artifactKind!=='signed-upload'||report.signatureVerified!==true)errors.push('Verified signed-upload AAB report is required; unsigned QA is insufficient.');
 if(report?.packageId!==android.packageId||report?.versionCode!==android.appVersionCode||report?.versionName!==android.appVersion)errors.push('Signed AAB package/version differs from approved metadata.');
 if(report?.targetSdk<36||report?.compileSdk<36||!Number.isInteger(report?.targetSdk)||!Number.isInteger(report?.compileSdk))errors.push('Signed AAB API 36 evidence is missing.');
 if(!Array.isArray(report?.permissions)||report.permissions.includes('com.android.vending.BILLING'))errors.push('Free launch requires reviewed permissions without Billing.');
 if(!Array.isArray(report?.nativeLibraries)||(report.nativeLibraries.length&&report.nativeAlignmentVerified!==true))errors.push('Native library 16 KB alignment evidence is missing.');
 if(typeof report?.artifactPath!=='string'||!path.isAbsolute(report.artifactPath)||!/^[a-f0-9]{64}$/i.test(report?.artifactSha256||''))errors.push('Artifact path/SHA-256 evidence is missing.');
 else try{if(crypto.createHash('sha256').update(readFile(report.artifactPath)).digest('hex')!==report.artifactSha256.toLowerCase())errors.push('Signed AAB hash differs from inspection report.');}catch{errors.push('Signed AAB referenced by report is unavailable.');}
 return errors;
}
module.exports={fingerprint,validateAssetLinks,validateSignedEvidence};
