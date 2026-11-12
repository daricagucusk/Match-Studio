#!/usr/bin/env node
'use strict';
const {execFileSync}=require('node:child_process');

function git(args){
  try{
    return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  }catch{return '';}
}

const branch=git(['rev-parse','--abbrev-ref','HEAD']);
const head=git(['log','-1','--oneline']);
const status=git(['status','--short']);
const dirty=status?status.split('\n').length:0;

const lines=[];
lines.push(`[Match Studio] dal: ${branch||'bilinmiyor'} | HEAD: ${head||'bilinmiyor'}`);
lines.push(`Kirli dosya: ${dirty}`);
if(dirty>0&&dirty<=12) lines.push(status);
else if(dirty>12) lines.push(status.split('\n').slice(0,12).join('\n')+`\n... +${dirty-12} dosya`);
lines.push('Talimat: CLAUDE.md + .claude/rules/07-guvenlik.md yuklu. Baglam haritasi: docs-ai/context/README.md');
process.stdout.write(lines.join('\n')+'\n');
