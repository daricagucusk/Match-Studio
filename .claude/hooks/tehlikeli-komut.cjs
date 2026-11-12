#!/usr/bin/env node
'use strict';

const RULES=[
  {re:/\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+/i, why:'rm -rf / zorla silme yasak'},
  {re:/git\s+reset\s+--hard/i, why:'git reset --hard kullanici calismasini siler'},
  {re:/git\s+clean\s+-[a-zA-Z]*[fdx]/i, why:'git clean izlenmeyen dosyalari siler'},
  {re:/git\s+push\b/i, why:'git push ayri acik yetki ister'},
  {re:/git\s+push\s+.*--force/i, why:'force push yasak'},
  {re:/npm\s+publish\b/i, why:'npm publish ayri acik yetki ister'},
  {re:/vercel\s+.*--prod/i, why:'vercel --prod yayin ayri acik yetki ister'},
  {re:/git\s+checkout\s+--\s+\.\s*$/i, why:'tum calisma agacini geri alma'},
  {re:/\bformat\s+[a-zA-Z]:/i, why:'disk bicimlendirme'},
  {re:/:\(\)\s*\{\s*:\|:&\s*\};:/, why:'fork bomb'},
];

function deny(reason){
  process.stdout.write(JSON.stringify({
    hookSpecificOutput:{
      hookEventName:'PreToolUse',
      permissionDecision:'deny',
      permissionDecisionReason:`[Match Studio] ${reason}. Gerekliyse kullaniciya sor.`,
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
  const cmd=(input.tool_input&&(input.tool_input.command||input.tool_input.cmd))||'';
  if(!cmd) process.exit(0);
  for(const rule of RULES){
    if(rule.re.test(cmd)) deny(rule.why);
  }
  process.exit(0);
});
