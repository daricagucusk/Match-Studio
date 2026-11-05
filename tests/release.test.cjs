const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnPython}=require('../tools/python.cjs');
const root=path.resolve(__dirname,'..'),verifier=path.join(root,'tools/verify-release.py');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'matchstudio-release-baseline-'));
const baseline=path.join(dir,'baseline.zip');
// Build a fresh, minimal valid PWA fixture outside the project. No persistent ZIP needed.
before(()=>{
 const script=String.raw`import sys,zipfile,json,hashlib
index=b'<!doctype html><html><title>Test</title></html>'
bundle=b'window.MATCH_STUDIO_FIXTURE=true;'
manifest=json.dumps({'start_url':'./index.html'},separators=(',',':')).encode()
shell=['./','./index.html','./app.bundle.js','./manifest.webmanifest']
files={'index.html':index,'app.bundle.js':bundle,'manifest.webmanifest':manifest}
integrity={name:hashlib.sha256(files['index.html' if name=='./' else name[2:]]).hexdigest() for name in shell}
digest=hashlib.sha256()
for item in shell:
 digest.update(item.encode('utf-8'))
 digest.update(files['index.html' if item=='./' else item[2:]])
cache='matchstudio-universal-'+digest.hexdigest()[:16]
worker=('const CACHE='+json.dumps(cache)+';\nconst SHELL='+json.dumps(shell,separators=(',',':'))+';\nconst INTEGRITY='+json.dumps(integrity,separators=(',',':'))+';\n').encode('utf-8')
files['sw.js']=worker
files['SHA256SUMS.txt']=''.join(hashlib.sha256(data).hexdigest()+'  '+name+'\n' for name,data in sorted(files.items())).encode('utf-8')
with zipfile.ZipFile(sys.argv[1],'w',compression=zipfile.ZIP_DEFLATED) as z:
 for name,data in files.items():z.writestr(name,data)
`;
 const result=spawnPython(['-c',script,baseline],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||result.stdout);
});
after(()=>fs.rmSync(dir,{recursive:true,force:true}));
test('release verifier accepts a generated valid PWA fixture',()=>{
 const result=spawnPython([verifier,baseline],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||result.stdout);
});
for(const mode of ['corrupt','missing','extra','traversal','duplicate','worker-manifest','evidence','web'])test('release verifier rejects '+mode+' archive',()=>{
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'matchstudio-release-mutated-')),file=path.join(scratch,'bad.zip');
 try{
  const script=String.raw`import sys,zipfile,json,hashlib,re
source,out,mode=sys.argv[1:]
with zipfile.ZipFile(source) as z: files={n:z.read(n) for n in z.namelist()}
if mode=='corrupt': files['app.bundle.js']+=b'changed'
if mode=='missing': del files['index.html']
if mode=='extra': files['src/private.js']=b'unexpected'
if mode in ('evidence','web'): files[mode+'/private.txt']=b'unexpected'
if mode=='traversal': files['../escape.txt']=b'unsafe'
if mode=='worker-manifest':
 sw=files['sw.js'].decode();m=re.search(r'const INTEGRITY=(.*);',sw);data=json.loads(m[1]);data['./index.html']='0'*64;files['sw.js']=(sw[:m.start(1)]+json.dumps(data,separators=(',',':'))+sw[m.end(1):]).encode()
 files['SHA256SUMS.txt']=''.join(hashlib.sha256(v).hexdigest()+'  '+n+'\n' for n,v in sorted(files.items()) if n!='SHA256SUMS.txt').encode()
with zipfile.ZipFile(out,'w') as z:
 for n,v in files.items(): z.writestr(n,v)
 if mode=='duplicate': z.writestr('index.html',files['index.html'])
`;
  const create=spawnPython(['-c',script,baseline,file,mode],{encoding:'utf8'});
  assert.equal(create.status,0,create.stderr);
  const result=spawnPython([verifier,file],{encoding:'utf8'});
  assert.equal(result.status,1,result.stderr||result.stdout);
  assert.match(result.stderr,/FAIL/);
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
});
