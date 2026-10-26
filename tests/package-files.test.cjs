const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {sourceFiles}=require('../tools/package-files.cjs');
test('source archive excludes synthetic signing material, build folders and symlinks',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'matchstudio-package-'));
 try{
  for(const name of ['src/app.js','android/twa-manifest.json','android/upload-key.jks','nested/release.KEY','.env.local','.unsigned-twa/gradle.properties','nested/key.properties','dist/old.zip']){
   fs.mkdirSync(path.dirname(path.join(root,name)),{recursive:true});fs.writeFileSync(path.join(root,name),'synthetic');
  }
  fs.symlinkSync(path.join(root,'android/upload-key.jks'),path.join(root,'disguised.txt'));
  assert.deepEqual(sourceFiles(root),['android/twa-manifest.json','src/app.js']);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
