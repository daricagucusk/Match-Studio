'use strict';
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),version=require('../package.json').version;
const releaseId='V'+version.toUpperCase().replace(/[^A-Z0-9]/g,'');
execFileSync(process.execPath,[path.join(__dirname,'build.cjs')],{stdio:'inherit'});
const generated=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const shell=JSON.parse(generated.match(/const SHELL=(.*);/)[1]);
const files=[...new Set([...shell.filter(x=>x!=='./').map(x=>x.slice(2)),'sw.js','robots.txt','BASLAT_TERMUX.sh','TELEFON_KURULUM.txt','tools/serve.cjs','docs/DEVICE_CHECKLIST.md','docs/VALIDATION.md','docs/RELEASE.md'])].sort();
const sums=files.map(name=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')+'  '+name).join('\n')+'\n';
fs.writeFileSync(path.join(root,'SHA256SUMS.txt'),sums);files.push('SHA256SUMS.txt');
const dist=path.join(root,'dist');fs.mkdirSync(dist,{recursive:true});
const script=`import sys,json,pathlib,zipfile
root=pathlib.Path(sys.argv[1]); public=json.loads(sys.argv[2]); tag=sys.argv[3]
source=json.loads(sys.argv[4])
for name,files in [(f'MatchStudio_{tag}_PWA.zip',public),(f'MatchStudio_{tag}_Source.zip',source)]:
 with zipfile.ZipFile(root/'dist'/name,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for f in sorted(files):
   info=zipfile.ZipInfo(f,date_time=(2026,10,22,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=(0o100755 if f.endswith('.sh') else 0o100644)<<16;z.writestr(info,(root/f).read_bytes())
 print(name)
`;
execFileSync('python3',['-c',script,root,JSON.stringify(files),releaseId,JSON.stringify(require('./package-files.cjs').sourceFiles(root))],{stdio:'inherit'});
const pwa=`MatchStudio_${releaseId}_PWA.zip`,source=`MatchStudio_${releaseId}_Source.zip`;
execFileSync('python3',[path.join(__dirname,'verify-release.py'),path.join(dist,pwa)],{stdio:'inherit'});
const artifacts=[pwa,source].map(name=>{const bytes=fs.readFileSync(path.join(dist,name));return {name,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};});
fs.writeFileSync(path.join(dist,'SHA256SUMS.txt'),artifacts.map(a=>`${a.sha256}  ${a.name}`).join('\n')+'\n');
fs.writeFileSync(path.join(dist,'release.json'),JSON.stringify({version,releaseId,archiveVerification:'passed',artifacts},null,2)+'\n');
