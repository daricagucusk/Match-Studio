const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
test('create the 1024x500 Match Studio Google Play feature graphic from verified copy',async({browser},info)=>{
 test.skip(info.project.name!=='desktop','Feature art runs once, in the desktop Chromium project.');
 const output=path.join(root,'dist','store-listing');
 fs.mkdirSync(output,{recursive:true});
 const html=fs.readFileSync(path.join(root,'tools/play-store-feature.html'),'utf8');
 expect(html).toContain('Kadrodan sahaya');
 expect(html).toContain('MATCH STUDIO');
 expect(html).not.toMatch(/Pro lisansı|ücretli|abonelik/i);
 const context=await browser.newContext({viewport:{width:1024,height:500},deviceScaleFactor:1,javaScriptEnabled:false});
 try{
  const page=await context.newPage();
  await page.setContent(html,{waitUntil:'load'});
  await expect(page.locator('.headline')).toContainText('MAÇ GÜNÜNÜ');
  const file=path.join(output,'05-one-cikan-gorsel.png');
  const bytes=await page.screenshot({path:file,fullPage:false,animations:'disabled'});
  expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(1024);
  expect(bytes.readUInt32BE(20)).toBe(500);
 }finally{await context.close();}
});
