const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {sourceFiles}=require('../tools/package-files.cjs');
test('source archive excludes synthetic signing material, build folders and symlinks',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'matchstudio-package-'));
 try{
  for(const name of ['src/app.js','web/index.html','web/app.bundle.js','web/sw.js','android/twa-manifest.json','android/upload-key.jks','nested/release.KEY','.env.local','.unsigned-twa/gradle.properties','nested/key.properties','dist/old.zip','.superpowers/sdd/plan/progress.md']){
   fs.mkdirSync(path.dirname(path.join(root,name)),{recursive:true});fs.writeFileSync(path.join(root,name),'synthetic');
  }
  // Windows directory junctions exercise real link exclusion without admin privileges.
  if(process.platform==='win32')fs.symlinkSync(path.join(root,'android'),path.join(root,'disguised-directory'),'junction');
  else fs.symlinkSync(path.join(root,'android/upload-key.jks'),path.join(root,'disguised.txt'));
  assert.deepEqual(sourceFiles(root),['android/twa-manifest.json','src/app.js','web/index.html']);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
