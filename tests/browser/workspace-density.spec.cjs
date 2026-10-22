const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');
const fs=require('node:fs'),path=require('node:path');
async function top(page){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));}
async function measure(page){return page.evaluate(()=>{const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{top:r.top,height:r.height,bottom:r.bottom}:null;};return {header:box('.match-workspace-head'),field:box('.pitch-field'),search:box('#roster-search'),target:box('[data-kind=public]'),overflow:document.documentElement.scrollWidth>innerWidth+1};});}
test('workspace header leaves the phone first screen available for real controls',async({page},info)=>{
 await setup(page);await nav(page,'pitch');await top(page);const before=await measure(page);
 const dir=path.resolve(__dirname,'../../reviews/update-06');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,info.project.name+'-measurements.json'),JSON.stringify({pitch:before},null,2));
 await page.screenshot({path:path.join(dir,'pitch-'+info.project.name+'.png')});
 expect(before.header.height).toBeLessThanOrEqual(info.project.name==='phone'?150:180);expect(before.overflow).toBe(false);
 expect(before.field.top).toBeLessThan(info.project.name==='phone'?700:info.project.name==='fold-open'?780:850);
 await expect(page.locator('.match-workspace-head')).toContainText('Sahil Spor');await expect(page.locator('.workflow-tabs button')).toHaveCount(5);
 for(const button of await page.locator('.workflow-tabs button').all()){const box=await button.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);}
 await page.locator('.workspace-match-details summary').click();await expect(page.locator('.workspace-match-details')).toContainText('Kent Stadı');await expect(page.locator('.workspace-match-details')).toContainText('14:00');await page.locator('.workspace-match-details summary').click();
 await page.locator('.workflow-tabs [data-action=go-roster]').click();await idle(page);await top(page);const roster=await measure(page);await page.screenshot({path:path.join(dir,'roster-'+info.project.name+'.png')});expect(roster.search.bottom).toBeLessThan(info.project.name==='phone'?700:900);expect(roster.overflow).toBe(false);await expect(page.locator('input[data-player-id]')).toHaveCount(4);
 await page.locator('.workflow-tabs [data-action=go-studio]').click();await idle(page);await top(page);const studio=await measure(page);await page.screenshot({path:path.join(dir,'studio-'+info.project.name+'.png')});expect(studio.target.top).toBeLessThan(info.project.name==='phone'?700:900);expect(studio.overflow).toBe(false);
 await page.locator('[data-kind=public]').click();await idle(page);await expect(page.locator('#preview-status')).toContainText('Paylaşmaya hazır');
 fs.writeFileSync(path.join(dir,info.project.name+'-measurements.json'),JSON.stringify({pitch:before,roster,studio},null,2));
});

test('compact pitch controls still switch views, export PNG, and keep the selected match',async({page})=>{
 await setup(page);await nav(page,'pitch');
 await page.locator('.pitch-mode [data-pitch-mode=all]').click();await idle(page);await expect(page.locator('.pitch-mode [data-pitch-mode=all]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.pitch-full-grid')).toContainText('Oyuncu 1');await expect(page.locator('.pitch-full-grid')).toContainText('Oyuncu 4');
 await page.locator('.pitch-mode [data-pitch-mode=match]').click();await idle(page);await expect(page.locator('[data-pitch-slot]')).toHaveCount(3);
 const downloading=page.waitForEvent('download');await page.locator('[data-action=pitch-export]').click();const download=await downloading;expect(await download.failure()).toBe(null);expect(download.suggestedFilename()).toContain('_SAHA_Sahil_Spor_match.png');
 await page.locator('.workflow-tabs [data-action=edit-match]').click();await idle(page);await expect(page.locator('#opponent')).toHaveValue('Sahil Spor');await expect(page.locator('#venue')).toHaveValue('Kent Stadı');await expect(page.locator('#kickoffTime')).toHaveValue('14:00');
});
