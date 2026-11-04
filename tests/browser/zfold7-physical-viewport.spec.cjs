const {test,expect}=require('@playwright/test');
const {setup,idle}=require('./live-fixture.cjs');

test('Z Fold7 640 CSS px inner viewport uses two-column single-screen coach console',async({page},info)=>{
 test.skip(info.project.name!=='fold-open','physical inner viewport regression runs on fold-open project');
 await page.setViewportSize({width:640,height:537});
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 const r=await page.evaluate(()=>{
  const box=s=>{const e=document.querySelector(s);if(!e)return null;const a=e.getBoundingClientRect();return{x:a.x,y:a.y,w:a.width,h:a.height}};
  return {viewport:innerWidth,stage:box('.live-console-stage'),pitch:box('.live-console-pitch-column'),events:box('.live-console-events-column'),dock:box('.live-event-shortcuts'),buttons:[...document.querySelectorAll('.live-event-shortcuts button')].map(e=>Math.round(e.getBoundingClientRect().y)),overflow:document.documentElement.scrollWidth>innerWidth+1,nav:getComputedStyle(document.querySelector('.app-shell>.mobile-nav')).display,home:getComputedStyle(document.querySelector('.live-fold-home-link')).display};
 });
 expect(r.viewport).toBe(640);expect(r.stage.h).toBeGreaterThanOrEqual(190);
 expect(r.events.x).toBeGreaterThan(r.pitch.x+50);expect(r.buttons).toHaveLength(8);
 expect(new Set(r.buttons).size).toBe(1);expect(r.overflow).toBe(false);
 expect(r.nav).toBe('none');expect(r.home).not.toBe('none');
 await page.locator('[data-action=live-quick-note][data-note-kind=technical]').click();
 expect(await page.locator('#live-event-form').evaluate(e=>getComputedStyle(e).position)).toBe('fixed');
 await page.locator('[data-action=live-cancel-quick-note]').click();
 expect(await page.locator('.live-match-console').getAttribute('data-quick-mode')).toBeNull();
 await expect(page.locator('.live-e-history summary')).toContainText('(0)');
});

test('Z Fold7 351 CSS px closed viewport keeps header and note confirmation reachable',async({page},info)=>{
 test.skip(info.project.name!=='phone','physical cover viewport regression runs on phone project');
 await page.setViewportSize({width:351,height:679});
 await setup(page);await page.locator('[data-action=live-start]').click();await idle(page);
 const r=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,viewport:innerHeight,header:document.querySelector('.live-coach-header').getBoundingClientRect().y,overflowX:document.documentElement.scrollWidth>innerWidth+1}));
 expect(r.scroll).toBeLessThanOrEqual(r.viewport+2);expect(r.header).toBeGreaterThanOrEqual(0);expect(r.overflowX).toBe(false);
 await page.locator('[data-action=live-quick-note][data-note-kind=technical]').click();
 const button=page.locator('#live-event-form button[type=submit]');
 const coords=await button.evaluate(el=>{const r=el.getBoundingClientRect();return {y:r.y,b:r.bottom}});
 expect(coords.y).toBeGreaterThanOrEqual(0);expect(coords.b).toBeLessThanOrEqual(679);
 await page.locator('[data-action=live-cancel-quick-note]').click();
 await expect(page.locator('.live-e-history summary')).toContainText('(0)');
});
