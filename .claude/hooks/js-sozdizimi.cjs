#!/usr/bin/env node
'use strict';
const {execFileSync}=require('node:child_process');

let raw='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',c=>{raw+=c;});
process.stdin.on('end',()=>{
  let input={};
  try{input=JSON.parse(raw||'{}');}catch{process.exit(0);}
  const ti=input.tool_input||{};
  const path=ti.file_path||ti.path||'';
  if(!path||!/\.(js|cjs|mjs)$/i.test(path)) process.exit(0);
  if(!/[\\/]src[\\/]/i.test(path)) process.exit(0);
  if(!require('node:fs').existsSync(path)) process.exit(0);
  try{
    execFileSync(process.execPath,['--check',path],{stdio:['ignore','pipe','pipe']});
    process.exit(0);
  }catch(err){
    const msg=(err.stderr||'').toString().split('\n').slice(0,6).join('\n');
    process.stderr.write(`[Match Studio] Sozdizimi hatasi: ${path}\n${msg}\n`);
    process.exit(2);
  }
});
