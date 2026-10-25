const {test,expect}=require('@playwright/test');

async function idle(page){
 await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');
}
async function club(page){
 await page.goto('/');
 await page.locator('#club-create-form [name=clubName]').fill('Mobil Görünüm Test Kulübü');
 await page.locator('#club-create-form button[type=submit]').click();
 await idle(page);
}
test('new club uses one clear team onboarding action, not duplicate step cards',async({page})=>{
 await club(page);
 await expect(page.locator('#group-form')).toBeVisible();
 await expect(page.locator('.ms-quickstart')).toHaveCount(0);
 await expect(page.locator('.broadcast-hero.is-empty')).toBeVisible();
 await expect(page.locator('.hero-bottom-line')).toContainText('V2.6.8-F.13');
 await expect(page.locator('.hero-bottom-line')).not.toContainText('F.11');
 if(page.viewportSize().width<768){
   await expect(page.locator('.broadcast-hero.is-empty .hero-fixture')).toBeHidden();
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('three-step dashboard is readable and touchable after creating the first group',async({page})=>{
 await club(page);
 await page.locator('#group-form [name=name]').fill('U14');
 await page.locator('#group-form button[type=submit]').click();
 await idle(page);
 const card=page.locator('.ms-quickstart');
 await expect(card).toBeVisible();
 await expect(card.locator('.ms-quickstart-step')).toHaveCount(3);
 await expect(card.locator('.ms-quickstart-step.is-done')).toHaveCount(1);
 await expect(card.locator('.ms-quickstart-kicker')).toContainText('1/3');
 await expect(card.locator('.ms-quickstart-copy strong').first()).toContainText('Takım');
 const layout=await card.locator('.ms-quickstart-step').evaluateAll(buttons=>buttons.map(btn=>{
   const number=btn.querySelector('.ms-quickstart-count').getBoundingClientRect();
   const copy=btn.querySelector('.ms-quickstart-copy').getBoundingClientRect();
   const strong=btn.querySelector('strong').getBoundingClientRect();
   const small=btn.querySelector('small').getBoundingClientRect();
   const outer=btn.getBoundingClientRect();
   return {numberRight:number.right,copyLeft:copy.left,strongBottom:strong.bottom,
     smallTop:small.top,copyRight:copy.right,outerRight:outer.right,
     bg:getComputedStyle(btn).backgroundColor,visible:outer.width>0&&outer.height>=44};
 }));
 expect(layout).toHaveLength(3);
 for(const x of layout){
  expect(x.visible).toBe(true);
  expect(x.copyLeft).toBeGreaterThanOrEqual(x.numberRight-1);
  expect(x.smallTop).toBeGreaterThanOrEqual(x.strongBottom-1);
  expect(x.copyRight).toBeLessThanOrEqual(x.outerRight+1);
  expect(x.bg).not.toBe('rgb(128, 128, 128)');
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await card.locator('.ms-quickstart-step[data-nav=players]').click();
 await idle(page);
 await expect(page.locator('.player-list')).toHaveCount(0);
});
