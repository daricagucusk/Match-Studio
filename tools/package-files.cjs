'use strict';
const fs=require('node:fs'),path=require('node:path');
const excluded=new Set(['node_modules','dist','public','.vercel','test-results','playwright-report','.git','__pycache__','.unsigned-twa','.gradle','.idea']);
function sourceFiles(root){
 const files=[];
 function visit(dir){for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const name=entry.name,relative=path.posix.join(dir,name);
  if(excluded.has(name)||name.startsWith('.env')||name.startsWith('.static-output-')||/\.(jks|keystore|p12|pfx|pkcs12|pem|key|aab|apk)$/i.test(name)||['key.properties','local.properties'].includes(name)||entry.isSymbolicLink())continue;
  if(entry.isDirectory())visit(relative);else if(entry.isFile())files.push(relative);
 }}visit('');return files.sort();
}
module.exports={sourceFiles};
