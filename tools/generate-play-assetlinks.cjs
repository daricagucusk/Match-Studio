#!/usr/bin/env node
'use strict';
// Produce the *real* Play App Signing Digital Asset Links JSON.
// Validates SHA-256 syntax only; its Play Console provenance requires owner review.
// Output goes to stdout for review, never directly to the public site.
const fs=require('node:fs');
const path=require('node:path');
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'../android/twa-manifest.json'),'utf8'));
const args=process.argv.slice(2);
if(args.length!==1||!args[0].startsWith('--play-sha256=')){
 console.error('Usage: node tools/generate-play-assetlinks.cjs --play-sha256=AA:BB:...(32 pairs, Play App Signing certificate)');
 process.exit(2);
}
const fingerprint=args[0].slice('--play-sha256='.length).toUpperCase();
if(!/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(fingerprint)){
 console.error('Invalid fingerprint: use the 32-byte SHA-256 from Google Play > App integrity > App signing certificate.');
 process.exit(2);
}
const statement=[{
 relation:['delegate_permission/common.handle_all_urls'],
 target:{namespace:'android_app',package_name:cfg.packageId,sha256_cert_fingerprints:[fingerprint]}
}];
process.stdout.write(JSON.stringify(statement,null,2)+'\n');
