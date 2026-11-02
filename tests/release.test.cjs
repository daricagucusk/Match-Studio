const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnPython}=require('../tools/python.cjs');
const root=path.resolve(__dirname,'..'),verifier=path.join(root,'tools/verify-release.py');
const baseline=path.join(root,'evidence/baseline/MatchStudio_V268F2_PWA.zip');
// A valid previously delivered PWA is an independent verifier fixture.
test('release verifier accepts the previously delivered PWA package',()=>{
 const result=spawnPython([verifier,baseline],{encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.stdout);
});
for(const mode of ['corrupt','missing','extra','traversal','duplicate','worker-manifest','evidence','web'])test('release verifier rejects '+mode+' archive',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'matchstudio-release-')),file=path.join(dir,'bad.zip');
 try{
  const script=`import sys,zipfile,json,hashlib,re\nsource,out,mode=sys.argv[1:]\nwith zipfile.ZipFile(source) as z: files={n:z.read(n) for n in z.namelist()}\nif mode=='corrupt': files['app.bundle.js']+=b'changed'\nif mode=='missing': del files['index.html']\nif mode=='extra': files['src/private.js']=b'unexpected'\nif mode in ('evidence','web'): files[mode+'/private.txt']=b'unexpected'\nif mode=='traversal': files['../escape.txt']=b'unsafe'\nif mode=='worker-manifest':\n sw=files['sw.js'].decode();m=re.search(r'const INTEGRITY=(.*);',sw);data=json.loads(m[1]);data['./index.html']='0'*64;files['sw.js']=(sw[:m.start(1)]+json.dumps(data,separators=(',',':'))+sw[m.end(1):]).encode()\n files['SHA256SUMS.txt']=''.join(hashlib.sha256(v).hexdigest()+'  '+n+'\\n' for n,v in sorted(files.items()) if n!='SHA256SUMS.txt').encode()\nwith zipfile.ZipFile(out,'w') as z:\n for n,v in files.items(): z.writestr(n,v)\n if mode=='duplicate': z.writestr('index.html',files['index.html'])\n`;
  const create=spawnPython(['-c',script,baseline,file,mode],{encoding:'utf8'});assert.equal(create.status,0,create.stderr);
  const result=spawnPython([verifier,file],{encoding:'utf8'});assert.equal(result.status,1,result.stderr||result.stdout);assert.match(result.stderr,/FAIL/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
