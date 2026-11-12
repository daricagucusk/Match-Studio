#!/usr/bin/env node
'use strict';

const BLOCKED=[
  {re:/(^|[\\/])\.env(\.|$)/i, why:'ortam dosyasi (.env) yazilamaz'},
  {re:/\.(jks|keystore|p12|pfx|pkcs12)$/i, why:'imza anahtari yazilamaz'},
  {re:/(^|[\\/])key\.properties$/i, why:'android/key.properties yazilamaz'},
  {re:/(^|[\\/])local\.properties$/i, why:'android/local.properties yazilamaz'},
  {re:/(^|[\\/])web[\\/]app\.bundle\.js$/i, why:'app.bundle.js uretilen dosyadir, kaynagi src/ altinda'},
  {re:/(^|[\\/])web[\\/]sw\.js$/i, why:'sw.js uretilen dosyadir, kaynagi src/ altinda'},
  {re:/(^|[\\/])dist[\\/]/i, why:'dist/ uretilen cikti, elle duzenlenmez'},
  {re:/(^|[\\/])public[\\/]/i, why:'public/ uretilen cikti, elle duzenlenmez'},
];

function deny(reason){
  process.stdout.write(JSON.stringify({
    hookSpecificOutput:{
      hookEventName:'PreToolUse',
      permissionDecision:'deny',
      permissionDecisionReason:`[Match Studio] ${reason}.`,
    },
  })+'\n');
  process.exit(0);
}

let raw='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',c=>{raw+=c;});
process.stdin.on('end',()=>{
  let input={};
  try{input=JSON.parse(raw||'{}');}catch{process.exit(0);}
  const ti=input.tool_input||{};
  const path=ti.file_path||ti.path||ti.notebook_path||'';
  if(!path) process.exit(0);
  for(const rule of BLOCKED){
    if(rule.re.test(path)) deny(rule.why);
  }
  process.exit(0);
});
