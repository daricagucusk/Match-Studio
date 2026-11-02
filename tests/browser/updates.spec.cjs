const {test,expect}=require('@playwright/test');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
function release(id){
 const generated=fs.readFileSync(path.join(root,'web/sw.js'),'utf8');
 const shell=JSON.parse(generated.match(/const SHELL=(.*);/)[1]);
 const files=new Map();
 for(const item of shell){const url=item==='./'?'/':'/'+item.slice(2);let bytes=fs.readFileSync(path.join(root,'web',item==='./'?'index.html':item));if(item==='./app.bundle.js')bytes=Buffer.concat([bytes,Buffer.from(`\nwindow.releaseMarker=${JSON.stringify(id)};`)]);files.set(url,bytes);}
 const integrity=Object.fromEntries(shell.map(item=>[item,crypto.createHash('sha256').update(files.get(item==='./'?'/':'/'+item.slice(2))).digest('hex')]));
 const worker=`const CACHE=${JSON.stringify('matchstudio-universal-v268f2-test-'+id)};\nconst SHELL=${JSON.stringify(shell)};\nconst INTEGRITY=${JSON.stringify(integrity)};\n`+fs.readFileSync(path.join(root,'src/pwa/service-worker.js'),'utf8');files.set('/sw.js',Buffer.from(worker));return files;
}
test('partial deployment is rejected; complete update waits for acceptance and preserves club across tabs',async({page,context},info)=>{
 test.skip(info.project.name!=='desktop','Protocol scenario runs once; screen layouts tested separately.');
 let files=release('old'),broken=false;
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost').pathname;let bytes=files.get(url);if(broken&&url==='/broadcast.css')bytes=Buffer.from('corrupt deployment');if(!bytes){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':url.endsWith('.js')?'text/javascript':url.endsWith('.css')?'text/css':url.endsWith('.png')?'image/png':url.endsWith('.webmanifest')?'application/manifest+json':'text/html','Cache-Control':'no-store'});res.end(bytes);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 try{
  await page.goto(origin);await page.locator('#club-create-form [name=clubName]').fill('Güncelleme Spor');await page.locator('#club-create-form button').click();await expect(page.locator('.app-shell')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  const second=await context.newPage();await second.goto(origin);await expect(second.locator('.app-shell')).toBeVisible();
  files=release('broken');broken=true;
  const state=await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();const worker=reg.installing;if(!worker)return 'none';return new Promise(resolve=>{worker.addEventListener('statechange',()=>{if(['installed','redundant'].includes(worker.state))resolve(worker.state);});});});
  expect(state).toBe('redundant');expect(await page.evaluate(()=>window.releaseMarker)).toBe('old');
  await page.reload();expect(await page.evaluate(()=>window.releaseMarker)).toBe('old');
  files=release('new');broken=false;
  await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
  await expect(page.locator('#pwa-update')).toBeVisible();expect(await second.evaluate(()=>window.releaseMarker)).toBe('old');
  await second.reload();expect(await second.evaluate(()=>window.releaseMarker)).toBe('old');
  page.on('dialog',d=>d.accept());
  await second.evaluate(()=>{window.holdingUpdateLock=false;navigator.locks.request('matchstudio-ui-update',{mode:'shared'},()=>{window.holdingUpdateLock=true;return new Promise(resolve=>window.releaseUpdateLock=resolve);});});
  await expect.poll(()=>second.evaluate(()=>window.holdingUpdateLock)).toBe(true);
  await page.locator('#pwa-update button').click();await expect(page.locator('.toast')).toContainText('Başka sekmede işlem sürüyor');expect(await page.evaluate(()=>window.releaseMarker)).toBe('old');
  await second.evaluate(()=>window.releaseUpdateLock());await page.locator('#pwa-update button').click();
  await expect.poll(()=>page.evaluate(()=>window.releaseMarker).catch(()=>null)).toBe('new');await expect.poll(()=>second.evaluate(()=>window.releaseMarker).catch(()=>null)).toBe('new');
  await expect(page.locator('.app-shell')).toBeVisible();await expect(second.locator('.app-shell')).toBeVisible();await expect(page.locator('#club-switch')).toContainText('Güncelleme Spor');
  await second.close();
 }finally{await new Promise(resolve=>server.close(resolve));}
});
