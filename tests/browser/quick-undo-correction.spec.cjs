const {test,expect}=require('@playwright/test');
const {setup,idle,nav}=require('./live-fixture.cjs');

test('quick undo of last scorer correction restores original goal without changing 1-0 score after reload',async({page})=>{
 await setup(page);
 await page.locator('[data-action=live-start]').click();await idle(page);
 await page.locator('[data-action=live-quick-event][data-event-type=GOAL]').click();
 await page.locator('[data-live-pitch-out=p1]').click();await idle(page);
 await page.locator('[data-action=live-assist-none]').click();await idle(page);
 await expect(page.locator('.live-console-score')).toHaveText('1 : 0');

 await page.locator('#live-console-secondary').evaluate(el=>el.open=true);
 await page.locator('.live-e-history').evaluate(el=>el.open=true);
 await page.locator('[data-action=live-edit-event]').first().click();
 await expect(page.locator('#live-event-correction-form')).toBeVisible();
 await page.locator('#live-edit-player').selectOption('p2');
 await page.locator('#live-edit-reason').fill('Golcu duzeltmesi');
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#live-event-correction-form button[type=submit]').click();await idle(page);
 await expect(page.locator('.live-console-score')).toHaveText('1 : 0');
 await expect(page.locator('[data-live-pitch-out=p2] [data-kind=goal]')).toHaveCount(1);

 await page.locator('[data-action=live-coach-undo]').click();await idle(page);
 await expect(page.locator('.live-console-score')).toHaveText('1 : 0');
 await expect(page.locator('[data-live-pitch-out=p1] [data-kind=goal]')).toHaveCount(1);
 await expect(page.locator('[data-live-pitch-out=p2] [data-kind=goal]')).toHaveCount(0);

 await page.reload();
 await nav(page,'live');
 await page.locator('[data-action=live-open]').click();await idle(page);
 await expect(page.locator('.live-console-score')).toHaveText('1 : 0');
 await expect(page.locator('[data-live-pitch-out=p1] [data-kind=goal]')).toHaveCount(1);
});
