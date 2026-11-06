// Store images are actual application screenshots with synthetic data only.
// Produces 1080x2340 pixel PNG files; not a substitute for owner review.
const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const output=path.resolve(__dirname,'../../dist/store-listing');
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
async function nav(page,route){
 const link=page.locator('[data-nav="'+route+'"]:visible').first();
 if(await link.count())await link.click();
 else{await page.locator('.mobile-more summary').click();await page.locator('.mobile-more [data-nav="'+route+'"]').click();}
 await idle(page);
}
async function snap(page,name,anchor=null){
 await expect(page.locator('.app-shell')).toBeVisible();
 await idle(page);
 await expect(page.locator('.toast')).toHaveCount(0,{timeout:15000});
 if(anchor)await page.locator(anchor).scrollIntoViewIfNeeded();
 else await page.evaluate(()=>window.scrollTo(0,0));
 await page.waitForTimeout(150);
 const file=path.join(output,name+'.png');
 const bytes=await page.screenshot({path:file,fullPage:false,animations:'disabled'});
 assertPng(bytes,name);
}
function assertPng(bytes,name){
 if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Not PNG '+name);
 if(bytes.readUInt32BE(16)!==1080||bytes.readUInt32BE(20)!==2340)throw Error('Bad store screenshot dimensions '+name);
}
test('capture authentic Play listing screens with no real player or club data',async({browser},info)=>{
 test.skip(info.project.name!=='phone','Store screenshots generated once in phone project');
 fs.mkdirSync(output,{recursive:true});
 const context=await browser.newContext({baseURL:info.project.use.baseURL||'http://127.0.0.1:8911',
  viewport:{width:360,height:780},deviceScaleFactor:3,isMobile:true,hasTouch:true,acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');
  await page.locator('#club-create-form [name=clubName]').fill('Örnek Akademi');
  await page.locator('#club-create-form button[type=submit]').click();await idle(page);
  await page.locator('#group-form [name=name]').fill('U14');
  await page.locator('#group-form button[type=submit]').click();await idle(page);
  await snap(page,'01-ana-ekran');
  await nav(page,'players');
  for(let i=1;i<=4;i++){
   await page.locator('[data-action=add-player]').first().click();await idle(page);
   await page.locator('#fullName').fill('Örnek Oyuncu '+i);
   await page.locator('#birthYear').fill('2012');
   await page.locator('#shirtNumber').fill(String(i));
   await page.locator('#player-form [name=groups]').check();
   await page.locator('[data-action=submit-player]').click();await idle(page);
   await expect(page.locator('#player-form')).toHaveCount(0);
  }
  await snap(page,'02-oyuncular');
  await nav(page,'matches');
  await page.locator('#groupId').selectOption({label:'U14'});
  await page.locator('#opponent').fill('Örnek Rakip');
  await page.locator('#venue').fill('Akademi Eğitim Sahası');
  await page.locator('#matchDate').fill('2026-11-08');
  await page.locator('#kickoffTime').fill('14:00');
  await page.locator('#gameSize').selectOption('3');await idle(page);
  await page.locator('#benchLimit').fill('2');
  await page.locator('[data-action=save-match]').click();await idle(page);
  await snap(page,'03-mac-planlama');
  for(let i=0;i<4;i++){await page.locator('input[data-player-id]').nth(i).check();await idle(page);}
  await nav(page,'studio');
  await page.locator('[data-kind=public]').click();await idle(page);
  // On narrow phones the studio has a separate mobile preview tab.
  await page.locator('[data-mobile-tab="preview"]').click();await idle(page);
  await expect(page.locator('#poster-canvas')).toBeVisible();
  await expect(page.locator('#preview-status')).toContainText('Paylaşmaya hazır');
  await expect(page.locator('[data-action=export-png]:visible').first()).toBeEnabled();
  await snap(page,'04-afis-studyo','#poster-canvas');
  expect(errors).toEqual([]);
 }finally{await context.close();}
});
