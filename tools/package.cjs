'use strict';
const {execFileSync}=require('node:child_process');
const {execPython}=require('./python.cjs');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),version=require('../package.json').version;
const releaseId='V'+version.toUpperCase().replace(/[^A-Z0-9]/g,'');
execFileSync(process.execPath,[path.join(__dirname,'build.cjs')],{stdio:'inherit'});
// Use the same verified runtime as the web export, including legal/App Links files.
const runtime=require('./export-static.cjs').exportStatic(root);
const entries=Object.fromEntries(runtime.map(name=>[name,path.join(root,'public',name)]));
for(const name of [...require('./runtime-files.cjs').serverFiles,'docs/RELEASE.md','docs/VALIDATION.md','docs/guides/DEVICE_CHECKLIST.md'])entries[name]=path.join(root,name);
entries['BASLAT_TERMUX.sh']=path.join(root,'tools/termux/BASLAT_TERMUX.sh');
entries['TELEFON_KURULUM.txt']=path.join(root,'docs/guides/TELEFON_KURULUM.txt');
const sums=Object.keys(entries).sort().map(name=>crypto.createHash('sha256').update(fs.readFileSync(entries[name])).digest('hex')+'  '+name).join('\n')+'\n';
const dist=path.join(root,'dist');fs.mkdirSync(dist,{recursive:true});
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'matchstudio-package-'));
try{
entries['SHA256SUMS.txt']=path.join(temporary,'SHA256SUMS.txt');
fs.writeFileSync(entries['SHA256SUMS.txt'],sums);
const script=`import sys,json,pathlib,zipfile
root=pathlib.Path(sys.argv[1]); public=json.loads(sys.argv[2]); tag=sys.argv[3]
source={name:str(root/name) for name in json.loads(sys.argv[4])}
for name,files in [(f'MatchStudio_{tag}_PWA.zip',public),(f'MatchStudio_{tag}_Source.zip',source)]:
 with zipfile.ZipFile(root/'dist'/name,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for f in sorted(files):
   info=zipfile.ZipInfo(f,date_time=(2026,10,22,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=(0o100755 if f.endswith('.sh') else 0o100644)<<16;z.writestr(info,pathlib.Path(files[f]).read_bytes())
 print(name)
`;
execPython(['-c',script,root,JSON.stringify(entries),releaseId,JSON.stringify(require('./package-files.cjs').sourceFiles(root))],{stdio:'inherit'});
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
const pwa=`MatchStudio_${releaseId}_PWA.zip`,source=`MatchStudio_${releaseId}_Source.zip`;
execPython([path.join(__dirname,'verify-release.py'),path.join(dist,pwa)],{stdio:'inherit'});
const artifacts=[pwa,source].map(name=>{const bytes=fs.readFileSync(path.join(dist,name));return {name,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};});
fs.writeFileSync(path.join(dist,'SHA256SUMS.txt'),artifacts.map(a=>`${a.sha256}  ${a.name}`).join('\n')+'\n');
fs.writeFileSync(path.join(dist,'release.json'),JSON.stringify({version,releaseId,archiveVerification:'passed',artifacts},null,2)+'\n');
