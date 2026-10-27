const {test}=require('node:test');
const assert=require('node:assert/strict');
const {findPython,spawnPython}=require('../tools/python.cjs');

function probe(available,seen=[]){
 return (command,args)=>{
  seen.push([command,args]);
  const version=available[command];
  return version ? {status:0,stdout:JSON.stringify(version)} : {status:9009,stdout:'Python not found'};
 };
}
test('Windows uses available Python 3 without requiring python3 alias',()=>{
 const seen=[];
 assert.deepEqual(findPython({platform:'win32',env:{},spawn:probe({python:[3,10,0]},seen)}),{command:'python',args:[]});
 assert.equal(seen.length,1);
});
test('Windows launcher preserves -3 before the script arguments',()=>{
 assert.deepEqual(findPython({platform:'win32',env:{},spawn:probe({py:[3,12,0]})}),{command:'py',args:['-3']});
});
test('POSIX prefers python3 and rejects Python 2',()=>{
 assert.deepEqual(findPython({platform:'linux',env:{},spawn:probe({python3:[3,12,0],python:[2,7,0]})}),{command:'python3',args:[]});
 assert.throws(()=>findPython({platform:'linux',env:{},spawn:probe({python3:[2,7,0],python:[2,7,0]})}),/Python 3/);
});
test('explicit executable path is kept as one argument and invalid override fails clearly',()=>{
 const command='C:/Program Files/Python/python.exe';
 assert.deepEqual(findPython({platform:'win32',env:{PYTHON:command},spawn:probe({[command]:[3,13,0]})}),{command,args:[]});
 assert.throws(()=>findPython({platform:'win32',env:{PYTHON:command},spawn:probe({python:[3,10,0]})}),/PYTHON/);
});
test('real interpreter preserves Unicode arguments, output and nonzero exit status',()=>{
 const text='Darıca Gücü / boşluklu yol';
 const ok=spawnPython(['-c','import sys; print(sys.argv[1])',text],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});
 assert.equal(ok.status,0,ok.stderr);assert.equal(ok.stdout.trim(),text);
 const bad=spawnPython(['-c','import sys; sys.exit(7)'],{encoding:'utf8'});
 assert.equal(bad.status,7);
});

