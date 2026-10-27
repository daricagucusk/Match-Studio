'use strict';
const {spawnSync}=require('node:child_process');

function findPython({platform=process.platform,env=process.env,spawn=spawnSync}={}){
 const candidates=env.PYTHON
  ? [{command:env.PYTHON,args:[]}]
  : platform==='win32'
   ? [{command:'python',args:[]},{command:'py',args:['-3']},{command:'python3',args:[]}]
   : [{command:'python3',args:[]},{command:'python',args:[]}];
 for(const candidate of candidates){
  const check=spawn(candidate.command,[...candidate.args,'-c','import sys,json; print(json.dumps(list(sys.version_info[:3])))'],{encoding:'utf8',env,windowsHide:true,shell:false});
  if(check.error || check.status!==0)continue;
  try{
   const version=JSON.parse(check.stdout.trim());
   if(Array.isArray(version) && version[0]===3 && version[1]>=8)return candidate;
  }catch{}
 }
 throw new Error('Python 3 (3.8+) bulunamadı. Python kurulumunu kontrol edin veya PYTHON değişkenine çalıştırılabilir dosyanın tam yolunu yazın.');
}
function spawnPython(args,options={}){
 const python=findPython({env:options.env||process.env});
 return spawnSync(python.command,[...python.args,...args],{windowsHide:true,...options,shell:false});
}
function execPython(args,options={}){
 const result=spawnPython(args,options);
 if(result.error)throw result.error;
 if(result.status!==0)throw new Error('Python işlemi başarısız (çıkış '+result.status+').');
 return result;
}
module.exports={findPython,spawnPython,execPython};

