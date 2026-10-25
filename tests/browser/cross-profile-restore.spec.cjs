const {test,expect}=require('@playwright/test');
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
async function nav(page,route){
 const direct=page.locator('[data-nav="'+route+'"]:visible').first();
 if(await direct.count()){
  if(await page.evaluate(()=>window.innerWidth<=767)){
   const hit=await direct.evaluate(el=>{
    const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    const nav=el.closest('.mobile-nav'),content=document.elementFromPoint(x,y);
    return {rectangle:{x:r.x,y:r.y,width:r.width,height:r.height},
      viewport:{innerWidth,innerHeight,visualWidth:visualViewport?.width,visualHeight:visualViewport?.height},
      nav:nav?{position:getComputedStyle(nav).position,zIndex:getComputedStyle(nav).zIndex,display:getComputedStyle(nav).display}:null,
      mainZ:getComputedStyle(document.querySelector('.main')).zIndex,
      hit:(content?.outerHTML||'').slice(0,260)};
   });
   console.log('UNIFIED_MOBILE_HIT_TEST',JSON.stringify(hit));
  }
  await direct.click();
 }
 else {await page.locator('.mobile-more summary').click();await page.locator('.mobile-more [data-nav="'+route+'"]').click();}
 await idle(page);
}
async function makeClub(page,name){
 await page.goto('/');
 await page.locator('#club-create-form [name=clubName]').fill(name);
 await page.locator('#club-create-form button[type=submit]').click();
 await expect(page.locator('.app-shell')).toBeVisible();
 await idle(page);
}
async function snapshot(page){
 return page.evaluate(async()=>{
  const names=await indexedDB.databases();
  const club=names.find(x=>x.name.startsWith('matchstudio-club-'));
  if(!club)throw Error('No club IndexedDB');
  const db=await new Promise((resolve,reject)=>{
   const request=indexedDB.open(club.name);
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error);
  });
  try{
   return await new Promise((resolve,reject)=>{
    const tx=db.transaction(['players','groups','matches','assets']);
    const result={};
    for(const name of ['players','groups','matches','assets']){
     const req=tx.objectStore(name).getAll();
     req.onsuccess=()=>{result[name]=req.result.map(x=>name==='assets'?{id:x.id,size:x.blob?.size,type:x.blob?.type}:{...x}).sort((a,b)=>String(a.id).localeCompare(String(b.id)));};
    }
    tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);
   });
  }finally{db.close();}
 });
}

test('P0: encrypted club backup restores roster, match and image in a completely separate browser profile',async({page,browser})=>{
 const password='portable-backup-test-2026';
 page.on('dialog',d=>d.accept(d.type()==='prompt'?password:undefined));
 await makeClub(page,'Kaynak Kulüp');
 await page.locator('#group-form [name=name]').fill('U14');
 await page.locator('#group-form button[type=submit]').click();await idle(page);
 await nav(page,'players');
 await page.locator('[data-action=add-player]').first().click();await idle(page);
 await page.locator('#fullName').fill('Sentetik Test Oyuncusu');
 await page.locator('#birthYear').fill('2012');
 await page.locator('#shirtNumber').fill('7');
 await page.locator('#player-form [name=groups]').check();
 await page.locator('#player-photo').setInputFiles('icons/icon-192.png');
 await page.locator('[data-action=submit-player]').click();await idle(page);
 await expect(page.locator('#player-form')).toHaveCount(0);
 await nav(page,'matches');
 await page.locator('#groupId').selectOption({label:'U14'});
 await page.locator('#ageCategory').selectOption('U14');
 await page.locator('#opponent').fill('Sentetik Rakip');
 await page.locator('#venue').fill('Sentetik Saha');
 await page.locator('#matchDate').fill('2026-11-08');
 await page.locator('#kickoffTime').fill('14:00');
 await page.locator('[data-action=save-match]').click();await idle(page);
 const source=await snapshot(page);
 expect(source.players).toHaveLength(1);
 expect(source.groups).toHaveLength(1);
 expect(source.matches).toHaveLength(1);
 expect(source.assets.length).toBeGreaterThan(0);
 await nav(page,'archive');
 const pending=page.waitForEvent('download');
 await page.locator('[data-action=backup-export-secure]').click();
 const downloaded=await pending;
 const downloadedPath=await downloaded.path();
 expect(downloaded.suggestedFilename()).toMatch(/KORUMALI.*\.json$/);

 // Independent browser context: no storage, IndexedDB or localStorage shared.
 const fresh=await browser.newContext({baseURL:'http://127.0.0.1:8911'});
 try{
  const second=await fresh.newPage();
  second.on('dialog',d=>d.accept(d.type()==='prompt'?password:undefined));
  await makeClub(second,'Hedef Kulüp');
  const untouched=await snapshot(second);
  expect(untouched.players).toHaveLength(0);
  expect(untouched.groups).toHaveLength(0);
  const chooser=second.waitForEvent('filechooser');
  await nav(second,'archive');
  await second.locator('[data-action=backup-import]').click();
  await (await chooser).setFiles(downloadedPath);
  await expect(second.locator('.toast')).toContainText('Yedek geri yüklendi');
  await idle(second);
  const restored=await snapshot(second);
  // New club ID is expected, but the backed-up records must match exactly.
  expect(restored).toEqual(source);
  await nav(second,'players');
  await expect(second.locator('body')).toContainText('Sentetik Test Oyuncusu');
 }finally{await fresh.close();}
});
