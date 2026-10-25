const {test,expect}=require('@playwright/test');
const {idle,nav}=require('./live-fixture.cjs');

test('F.14 unified transfer offers encrypted download and preserves recovery controls',async({page})=>{
 await page.goto('/');
 await page.locator('#club-create-form [name=clubName]').fill('Güvenli Aktarım Spor');
 await page.locator('#club-create-form button[type=submit]').click();
 await idle(page);
 await nav(page,'archive');
 const transfer=page.locator('[data-simple-transfer]');
 await expect(transfer).toBeVisible();
 await expect(transfer).toContainText('Verilerini güvenle taşı');
 await expect(transfer.locator('[data-action=backup-export-secure]')).toBeVisible();
 await expect(transfer.locator('[data-action=backup-import]')).toBeVisible();
 // Unencrypted JSON is available only inside explicit compatibility details.
 const legacy=transfer.locator('details');
 await expect(legacy).not.toHaveAttribute('open','');
 await expect(legacy.locator('[data-action=backup-export]')).toBeHidden();
 await expect(page.locator('[data-action=backup-rollback]')).toBeVisible();
 await expect(page.locator('[data-action=integrity-audit]')).toBeVisible();
});
