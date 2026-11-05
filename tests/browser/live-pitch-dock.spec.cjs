const {test,expect}=require('@playwright/test');
const {setup,idle}=require('./live-fixture.cjs');

test('live pitch owns the stage and other tools stay available in place',async({page},info)=>{
 if(info.project.name==='phone')await page.setViewportSize({width:360,height:780});
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 const stage=page.locator('.live-console-stage'),field=page.locator('.live-field');
 await expect(field).toBeVisible();await expect(stage.locator('.live-console-events-column')).toHaveCount(0);
 const measurements=await page.locator('.live-event-shortcuts button').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}}));
 expect(measurements).toHaveLength(10);
 if(info.project.name==='phone'){
  expect(new Set(measurements.map(x=>Math.round(x.y))).size).toBe(2);
  expect(measurements.every(x=>x.h>=44&&x.bottom<=780)).toBe(true);
 }
 await page.locator('[data-action=live-coach-report]').click();
 await expect(page.locator('#live-console-secondary')).toHaveAttribute('open','');
 await expect(page.locator('[data-action=live-coach-report]')).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('.live-report')).toBeVisible();
 await expect(page.locator('#live-correction-form')).toBeVisible();
  await expect(page.locator('.live-history')).toBeVisible();
  await expect(field).toBeVisible();
  if(info.project.name==='phone')expect((await field.boundingBox()).height).toBeGreaterThanOrEqual(200);
  await page.locator('#live-console-secondary > summary').click();
 await expect(page.locator('#live-console-secondary')).not.toHaveAttribute('open','');
 await expect(page.locator('[data-action=live-coach-report]')).toHaveAttribute('aria-expanded','false');
 await expect(field).toBeVisible();
 if(info.project.name==='phone')await page.screenshot({path:'test-results/live-dock-phone.png'});
});
