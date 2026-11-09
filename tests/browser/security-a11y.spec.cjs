const {test,expect}=require('@playwright/test');
async function idle(page){await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');}
async function nav(page,route){const item=page.locator(`[data-nav="${route}"]:visible`).first();if(await item.count())await item.click();else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${route}"]`).click();}await idle(page);}
test('CSP is enforced with zero violations across pages; landmarks and skip link work',async({page})=>{
 await page.addInitScript(()=>{window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' '+e.blockedURI));});
 const response=await page.goto('/');
 expect(response.headers()['content-security-policy']).toContain("script-src 'self'");
 expect(response.headers()['permissions-policy']).toContain('geolocation=()');
 await page.locator('#club-create-form [name=clubName]').fill('Güvenlik Test Spor');await page.locator('#club-create-form button[type=submit]').click();await expect(page.locator('.app-shell')).toBeVisible();await idle(page);
 await expect(page.locator('main#main-content')).toHaveCount(1);
 await page.keyboard.press('Tab');
 const skip=page.locator('.skip-link');await expect(skip).toBeFocused();await expect(skip).toBeInViewport();
 await page.keyboard.press('Enter');await expect(page.locator('#main-content')).toBeFocused();
 for(const route of ['players','matches','team','weekly','archive','dashboard']){await nav(page,route);}
 expect(await page.evaluate(()=>window.__csp)).toEqual([]);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 expect(errors).toEqual([]);
});
