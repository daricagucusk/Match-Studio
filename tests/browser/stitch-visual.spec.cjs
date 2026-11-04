const {test,expect}=require('@playwright/test');
const {setup,nav}=require('./live-fixture.cjs');
const fs=require('node:fs'),path=require('node:path');

test('Stitch gold identity and offline fonts render across operational screens',async({page},info)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 const dir=path.resolve(__dirname,'../../test-results/reviews/unified-f17');fs.mkdirSync(dir,{recursive:true});
 await page.goto('/');await expect(page.locator('#club-create-form')).toBeVisible();
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(dir,info.project.name+'-onboarding.png'),fullPage:true});
 const fonts=await page.evaluate(()=>({display:document.fonts.check('650 24px Outfit'),body:document.fonts.check('400 14px "Plus Jakarta Sans"')}));
 expect(fonts).toEqual({display:true,body:true});
 for(const [url,size] of [['/icons/icon-192.png',192],['/icons/icon-512.png',512],['/icons/icon-maskable-512.png',512]]){
  const dimensions=await page.evaluate(async url=>{const img=new Image();img.src=url;await img.decode();return [img.naturalWidth,img.naturalHeight];},url);
  expect(dimensions,url).toEqual([size,size]);
 }
 await setup(page);
 for(const route of ['dashboard','roster','pitch','live','studio','analytics','archive']){
  await nav(page,route);await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' document overflow').toBe(true);
  if(route==='pitch')expect(await page.locator('.pitch-main').evaluate(node=>getComputedStyle(node).borderTopColor)).toBe('rgb(97, 84, 58)');
  if(['dashboard','pitch','studio','analytics'].includes(route))await page.screenshot({path:path.join(dir,info.project.name+'-'+route+'.png'),fullPage:true});
 }
 expect(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor)).toBe('rgb(11, 14, 21)');
 expect(await page.locator('.btn-primary:visible').first().evaluate(node=>getComputedStyle(node).backgroundImage)).toContain('linear-gradient');
 expect(errors).toEqual([]);
});
