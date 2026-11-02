const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {exportStatic}=require('../tools/export-static.cjs');
const root=path.resolve(__dirname,'..');
function fixture(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'matchstudio-static-'));for(const [name,text] of Object.entries({'index.html':'<html>fixture</html>','app.bundle.js':'fixture app','robots.txt':'User-agent: *','src/private.txt':'never publish'})){const file=path.join(dir,'web',name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}const integrity=Object.fromEntries(['./','./index.html','./app.bundle.js'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'web',name==='./'?'index.html':name))).digest('hex')]));fs.writeFileSync(path.join(dir,'web/sw.js'),'const SHELL='+JSON.stringify(Object.keys(integrity))+';\nconst INTEGRITY='+JSON.stringify(integrity)+';\n');return dir;}
test('static output contains only verified runtime files and robots, replacing old output',()=>{const dir=fixture();try{fs.mkdirSync(path.join(dir,'public'));fs.writeFileSync(path.join(dir,'public/stale.txt'),'old');exportStatic(dir);assert.deepEqual(fs.readdirSync(path.join(dir,'public')).sort(),['app.bundle.js','index.html','robots.txt','sw.js']);for(const file of fs.readdirSync(path.join(dir,'public')))assert.deepEqual(fs.readFileSync(path.join(dir,'public',file)),fs.readFileSync(path.join(dir,'web',file)));}finally{fs.rmSync(dir,{recursive:true,force:true});}});
test('static export rejects changed shell bytes before replacing previous output',()=>{const dir=fixture();try{fs.mkdirSync(path.join(dir,'public'));fs.writeFileSync(path.join(dir,'public/previous.txt'),'safe');fs.appendFileSync(path.join(dir,'web/app.bundle.js'),'changed');assert.throws(()=>exportStatic(dir),/Integrity/);assert.equal(fs.readFileSync(path.join(dir,'public/previous.txt'),'utf8'),'safe');}finally{fs.rmSync(dir,{recursive:true,force:true});}});
test('static export rejects unsafe and source paths in worker manifest',()=>{for(const name of ['./../escape.txt','./src/private.txt']){const dir=fixture();try{fs.writeFileSync(path.join(dir,'web/sw.js'),'const SHELL='+JSON.stringify([name,'./'])+';\nconst INTEGRITY={};\n');assert.throws(()=>exportStatic(dir),/Unsafe|Non-runtime/);}finally{fs.rmSync(dir,{recursive:true,force:true});}}});
test('Vercel serves only static output, preserves file URLs, and revalidates updates',()=>{const cfg=JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));assert.equal(cfg.outputDirectory,'public');assert.equal(cfg.buildCommand,'npm run build:vercel');assert.equal(cfg.cleanUrls,false);assert.equal(cfg.framework,null);assert.ok(!cfg.rewrites);const headers=cfg.headers.find(x=>x.source==='/(.*)').headers;assert.ok(headers.some(x=>x.key==='Cache-Control'&&x.value==='no-cache'));});

test('App Links come from web while Android identity comes from the project root',()=>{
 const dir=fixture();
 try{
  const binding=[{relation:['delegate_permission/common.handle_all_urls'],target:{namespace:'android_app',package_name:'com.matchdaystudio.app',sha256_cert_fingerprints:[Array(32).fill('AB').join(':')]}}];
  fs.mkdirSync(path.join(dir,'web/.well-known'));
  fs.mkdirSync(path.join(dir,'android'));
  fs.writeFileSync(path.join(dir,'web/.well-known/assetlinks.json'),JSON.stringify(binding));
  fs.writeFileSync(path.join(dir,'android/twa-manifest.json'),JSON.stringify({packageId:'com.matchdaystudio.app'}));
  assert.ok(exportStatic(dir).includes('.well-known/assetlinks.json'));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'public/.well-known/assetlinks.json'))),binding);
  assert.equal(fs.existsSync(path.join(dir,'public/android')),false);
  fs.writeFileSync(path.join(dir,'android/twa-manifest.json'),JSON.stringify({packageId:'com.other.app'}));
  assert.throws(()=>exportStatic(dir),/Invalid Android App Links/);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'public/.well-known/assetlinks.json'))),binding);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
