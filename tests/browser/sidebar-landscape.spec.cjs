const {test,expect}=require('@playwright/test');
const {idle,nav}=require('./live-fixture.cjs');

for(const width of [780,980])test(`short landscape ${width}x360 keeps navigation and club selection reachable`,async({page})=>{
 await page.setViewportSize({width,height:360});
 await page.goto('/');
 await page.locator('#club-create-form [name=clubName]').fill('Sentetik Yatay A');
 await page.locator('#club-create-form button[type=submit]').click();await idle(page);
 const clubA=await page.locator('#club-switch').inputValue();
 await nav(page,'weekly');
 await expect(page.locator('#weekly-import-heading')).toBeVisible();
 await nav(page,'archive');
 await page.locator('.ms-manager-details summary').filter({hasText:'Yeni kulüp oluştur'}).click();
 await page.locator('#club-create-form [name=clubName]').fill('Sentetik Yatay B');
 await page.locator('#club-create-form button[type=submit]').click();await idle(page);
 // Scroll back from the bottom navigation to the club picker with normal pointer input.
 await nav(page,'weekly');
 const picker=page.locator('#club-switch');await picker.scrollIntoViewIfNeeded();
 await picker.click();await page.keyboard.press('Escape');
 await picker.selectOption(clubA);await idle(page);
 await expect(picker).toHaveValue(clubA);
 // Keyboard focus must also reveal the last item, without being hidden by the footer.
 const archive=page.locator('.sidebar [data-nav="archive"]');
 await archive.focus();await expect(archive).toBeInViewport();
 await page.keyboard.press('Enter');await idle(page);
 await expect(page.locator('#club-settings-form [name=clubName]')).toHaveValue('Sentetik Yatay A');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
