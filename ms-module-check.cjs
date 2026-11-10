const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const page=await b.newPage({viewport:{width:1440,height:1100}});
 const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 const idle=async()=>{await page.waitForFunction(()=>document.querySelector('#app')?.getAttribute('aria-busy')!=='true',null,{timeout:15000}).catch(()=>{});await page.waitForTimeout(200);};
 const nav=async r=>{const it=page.locator(`[data-nav="${r}"]:visible`).first();if(await it.count())await it.click();else{await page.locator('.mobile-more summary').click();await page.locator(`.mobile-more [data-nav="${r}"]`).click();}await idle();await page.waitForTimeout(300);};
 await page.goto('http://127.0.0.1:8970/',{waitUntil:'load'});
 await page.locator('#club-create-form [name=clubName]').fill('Modul Test Spor');
 await page.locator('#club-create-form button').click();await page.locator('.app-shell').waitFor();await idle();
 await nav('archive');await page.locator('#group-form [name=name]').fill('U14');await page.locator('#group-form button').click();await idle();
 await nav('players');
 for(let i=0;i<3;i++){await page.locator('[data-action=add-player]').first().click();await idle();await page.locator('#player-form [name=fullName]').fill('Deneme Oyuncu '+(i+1));await page.locator('#player-form [name=shirtNumber]').fill(String(i+1));const g=page.locator('#player-form [name=groups]').first();if(await g.count())await g.check().catch(()=>{});await page.locator('[data-action=submit-player]').click();await idle();}
 await nav('matches');await page.locator('#groupId').selectOption({label:'U14'});await page.locator('#opponent').fill('Rakip');await page.locator('#venue').fill('Stad');await page.locator('#matchDate').fill('2026-11-10');await page.locator('#kickoffTime').fill('19:15');await page.locator('[data-action=save-match]').click();await idle();
 await nav('roster');for(let g=0;g<10;g++){const box=page.locator('.roster-pool-row input[type=checkbox]:not([disabled]):not(:checked)').first();if(!(await box.count()))break;await box.check({force:true}).catch(()=>{});await page.waitForTimeout(120);}await idle();
 await nav('attendance');
 const rows=await page.locator('.att-row').count();
 const empty=await page.locator('.att-empty').first().textContent().catch(()=>'');
 console.log('yoklama satir:',rows,'| bos mesaj:',(empty||'').slice(0,60));
 if(rows){await page.locator('[data-att-status=present]').first().click();await idle();}
 const pressed=rows?await page.locator('[data-att-status=present]').first().getAttribute('aria-pressed'):'n/a';
 await page.locator('[data-action=att-save]').click();await idle();
 const stat=await page.locator('.att-stat strong').nth(1).textContent();
 await page.screenshot({path:process.env.TEMP+'/attendance.png'});
 await nav('safeguarding');
 await page.locator('#sg-form [name=summary]').fill('Deneme koruma notu');
 await page.locator('[data-action=sg-add]').click();await idle();
 const sgRows=await page.locator('.att-row').count();
 await page.locator('[data-sg-status=reviewing]').first().click();await idle();
 const badge=await page.locator('.sg-badge.reviewing').count();
 await page.screenshot({path:process.env.TEMP+'/safeguarding.png'});
 console.log('yoklama satir:',rows,'| pressed:',pressed,'| Var sayisi:',stat,'| sg kayit:',sgRows,'| inceleniyor badge:',badge);
 console.log('konsol hata:',errs.length,errs.slice(0,3));
 await b.close();
})().catch(e=>{console.error('HATA',e.message);process.exit(1)});
