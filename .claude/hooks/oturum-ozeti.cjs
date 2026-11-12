#!/usr/bin/env node
'use strict';
const {execFileSync}=require('node:child_process');

function git(args){
  try{
    return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  }catch{return '';}
}

const status=git(['status','--short']);
const files=status?status.split('\n').filter(Boolean):[];
const changed=files.filter(l=>/^[^?]/.test(l)).length;
const untracked=files.filter(l=>/^\?\?/.test(l)).length;
const branch=git(['rev-parse','--abbrev-ref','HEAD']);

const out=[
  `[Match Studio] Oturum ozeti — dal: ${branch||'bilinmiyor'}`,
  `Degisen izlenen dosya: ${changed} | Yeni izlenmeyen: ${untracked}`,
];
if(files.length&&files.length<=15) out.push(files.join('\n'));
else if(files.length>15) out.push(files.slice(0,15).join('\n')+`\n... +${files.length-15} dosya`);
out.push('Kalici karar uretildiyse: proje-hafizasi becerisi ile baglama isle.');
process.stdout.write(out.join('\n')+'\n');
