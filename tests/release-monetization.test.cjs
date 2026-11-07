const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const json=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
test('approved first Play launch remains free without unfinished billing',()=>{
 const decision=json('docs/play/release-monetization.json');
 const android=json('android/twa-manifest.json');
 assert.equal(decision.firstLaunch.priceModel,'free');
 assert.equal(decision.firstLaunch.playBillingEnabled,false);
 assert.notEqual(android.features?.playBilling?.enabled,true);
 assert.equal(decision.laterPro.pricingModel,'one_time_non_consumable');
 assert.equal(decision.laterPro.releasePhase,'after_free_launch');
});
test('Android package identity and signed AAB evidence stay aligned with Play metadata',()=>{
 const decision=json('docs/play/release-monetization.json');
 const android=json('android/twa-manifest.json');
 assert.equal(android.packageId,decision.android.packageIdProposal);
 assert.equal(android.host,decision.android.host);
 assert.equal(decision.android.targetApi,36);
 assert.equal(decision.android.signedAab,true);
 assert.equal(decision.android.signedAabVersionCode,android.appVersionCode);
 assert.match(decision.android.signedAabSha256,/^[a-f0-9]{64}$/i);
 assert.match(decision.android.signedAabInspection,/AAB_SIGNED_INSPECTION_F19_V3\.json$/);
});
