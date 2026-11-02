const {test,expect}=require('@playwright/test');
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
test('toast has an accessible close control; install chip appears once, can be dismissed and is remembered',async({page})=>{
 await page.goto('/');
 await page.locator('#club-create-form [name=clubName]').fill('Premium Test Spor');await page.locator('#club-create-form button[type=submit]').click();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);
 await page.evaluate(()=>{const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{};e.userChoice=Promise.resolve({outcome:'dismissed'});window.dispatchEvent(e);});
 const chip=page.locator('.install-chip');await expect(chip).toBeVisible();await expect(chip).toContainText('ana ekrana');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await chip.getByRole('button',{name:'Sonra'}).click();await expect(chip).toHaveCount(0);
 await page.evaluate(()=>{const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{};e.userChoice=Promise.resolve({outcome:'dismissed'});window.dispatchEvent(e);});
 await expect(page.locator('.install-chip')).toHaveCount(0);
 // a real toast: create a group from the archive page
 const item=page.locator('[data-nav="archive"]:visible').first();if(await item.count())await item.click();else{await page.locator('.mobile-more summary').click();await page.locator('.mobile-more [data-nav="archive"]').click();}
 await idle(page);await page.locator('#group-form [name=name]').fill('U12');await page.locator('#group-form button[type=submit]').click();await idle(page);
 const toast=page.locator('.toast');await expect(toast).toContainText('Grup eklendi');
 await expect(toast).toHaveAttribute('role','status');
 const box=await toast.boundingBox();const vp=page.viewportSize();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(vp.width);
 await toast.getByRole('button',{name:'Bildirimi kapat'}).click();await expect(toast).toHaveCount(0);
});
